import { FastifyPluginAsync } from "fastify";
import crypto from "crypto";

import Athena from "../../model/athena";
import Account from "../../model/account";
import * as error from "../utils/error";
import * as global from "../global";
import * as tokenCreation from "../token/create";
import { verifyGame } from "../utils/preHandler";
import { verifyToken } from "../token/verify";

const account: FastifyPluginAsync = async (app) => {
  app.all("/api/oauth/token", async (req, res) => {
    if (req.method !== "POST") {
      const err = error.method(req);
      return res.headers(err.header).status(405).send(err.error);
    }

    const { grant_type, username, password } = req.body as {
      grant_type?: string;
      username?: string;
      password?: string;
    };

    if (!grant_type) {
      const err = error.oauth_unsupported_grand_type(req);
      return res.headers(err.header).status(400).send(err.error);
    }

    const authHeader = req.headers["authorization"]?.split(" ")[1];
    if (!authHeader) {
      const err = error.auth_header_invalid(req);
      return res.headers(err.header).status(400).send(err.error);
    }

    const client_id: any = Buffer.from(authHeader, "base64")
      .toString()
      .split(":")[0];
    if (!client_id) {
      const err = error.auth_header_invalid(req);
      return res.headers(err.header).status(400).send(err.error);
    }

    switch (grant_type) {
      case "client_credentials": {
        const clientTokenIndex = global.ClientTokens.findIndex(
          (x: any) => x.ip === req.ip
        );
        if (clientTokenIndex !== -1) {
          global.ClientTokens.splice(clientTokenIndex, 1);
        }

        const client_token: any = await tokenCreation.CreateClient(
          client_id,
          grant_type,
          4,
          req.ip,
          res
        );

        const client_decoded: any = app.jwt.decode(
          client_token.split("eg1~")[1]
        );

        const expires_at = new Date(
          new Date(client_decoded.created_at).getTime() +
            client_decoded.expires_in * 60 * 60 * 1000
        ).toISOString();
        const expires_in = Math.round(
          (new Date(expires_at).getTime() - new Date().getTime()) / 1000
        );

        return res.send({
          client_id,
          expires_at,
          expires_in,
          token_type: "bearer",
          internal_client: true,
          access_token: client_token,
          client_service: client_decoded.client_service,
        });
      }

      case "password": {
        if (!username || !password) {
          const err = error.auth_invalid_request(req);
          return res.headers(err.header).status(400).send(err.error);
        }

        const account = await Account.findOne({
          Email: username,
          Token: password,
        }).lean();

        if (!account) {
          const err = error.auth_invalid_request(req);
          return res.headers(err.header).status(400).send(err.error);
        }

        const device_id = crypto.randomUUID().replace(/-/gi, "");
        const access_token: any = await tokenCreation.CreateAccess(
          account,
          client_id,
          grant_type,
          device_id,
          8,
          res
        );

        const refresh_token: any = await tokenCreation.CreateRefresh(
          account,
          client_id,
          grant_type,
          device_id,
          24,
          res
        );

        const access_decoded: any = app.jwt.decode(
          access_token.split("eg1~")[1]
        );
        const refresh_decoded: any = app.jwt.decode(
          refresh_token.split("eg1~")[1]
        );

        const expires_in = Math.round(
          (new Date(access_decoded.created_at).getTime() +
            access_decoded.expires_in * 60 * 60 * 1000 -
            new Date().getTime()) /
            1000
        );
        const expires_at = new Date(
          new Date(access_decoded.created_at).getTime() +
            access_decoded.expires_in * 60 * 60 * 1000
        ).toISOString();
        const refresh_expires = Math.round(
          (new Date(refresh_decoded.created_at).getTime() +
            refresh_decoded.expires_in * 60 * 60 * 1000 -
            new Date().getTime()) /
            1000
        );
        const refresh_expires_at = new Date(
          new Date(refresh_decoded.created_at).getTime() +
            refresh_decoded.expires_in * 60 * 60 * 1000
        ).toISOString();

        // reset matchmaking key
        Athena.updateOne(
          { accountId: access_decoded.account.accountId },
          { $set: { CurrentCustomMatchmakingKey: undefined } }
        );

        return {
          access_token,
          refresh_token,
          client_id,
          device_id,
          expires_in,
          expires_at,
          refresh_expires,
          refresh_expires_at,
          internal_client: true,
          token_type: "bearer",
          client_service: "prod-fn",
          app: access_decoded.client_service,
          in_app_id: access_decoded.account.accountId,
          account_id: access_decoded.account.accountId,
          displayName: access_decoded.display_name,
        };
      }

      default: {
        const err = error.oauth_unsupported_grand_type(req);
        return res.headers(err.header).status(400).send(err.error);
      }
    }
  });

  app.get(
    "/api/public/account/:accountId",
    { preHandler: verifyToken },
    async (req, res) => {
      const header: any = req.headers["authorization"]?.split("eg1~")[1];
      const access_decoded: any = app.jwt.decode(header);

      return {
        id: access_decoded.accountId,
        displayName: access_decoded.display_name,
        name: access_decoded.display_name,
        email: `[hidden]@${access_decoded.account?.Email.split("@")[1]}`,
        failedLoginAttempts: 0,
        lastLogin: new Date().toISOString(),
        numberOfDisplayNameChanges: 0,
        ageGroup: "UNKNOWN",
        headless: false,
        country: "US",
        lastName: "Server",
        preferredLanguage: "en",
        canUpdateDisplayName: false,
        tfaEnabled: false,
        emailVerified: true,
        minorVerified: false,
        minorExpected: false,
        minorStatus: "NOT_MINOR",
        cabinedMode: false,
        hasHashedEmail: false,
      };
    }
  );

  app.get(
    "/api/public/account/:accountId/externalAuths",
    { preHandler: verifyToken },
    (req, res) => {
      return [];
    }
  );

  app.get(
    "/api/public/account",
    { preHandler: verifyToken },
    async (req, res) => {
      let response: any = [];

      const accountId = (req.query as { accountId: string })?.accountId;

      if (typeof accountId == "string") {
        const account = await Account.findOne({ accountId }).lean();

        if (account) {
          response.push({
            id: account.accountId,
            displayName: account.DisplayName,
            externalAuths: {},
          });
        }
      } else if (Array.isArray(accountId)) {
        const accounts = await Account.find({
          accountId: { $in: accountId },
        }).lean();

        if (accounts) {
          for (let account of accounts) {
            if (response.length >= 100) {
              break;
            }

            response.push({
              id: account.accountId,
              displayName: account.DisplayName,
              externalAuths: {},
            });
          }
        }
      }

      return response;
    }
  );

  app.get(
    "/api/public/account/displayName/:displayName",
    { preHandler: verifyToken },
    async (req, res) => {
      const account = await Account.findOne({
        DisplayName: (req.params as { displayName: string })?.displayName,
      });

      try {
        if (account?.accountId) {
          return {
            id: account?.accountId,
            displayName: account?.DisplayName,
            extrenalAuths: {},
          };
        } else {
          const err = error.account_not_found(req);
          return res.headers(err.header).status(404).send(err.error);
        }
      } catch {
        const err = error.account_not_found(req);
        return res.headers(err.header).status(404).send(err.error);
      }
    }
  );

  // Kill
  app.all(
    "/api/oauth/sessions/kill",
    { preHandler: verifyToken },
    async (req, res) => {
      if (req.method != "DELETE") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }
      // add logic here
      res.status(204).send();
    }
  );

  // Kill (2)
  app.all(
    "/api/oauth/sessions/kill/*",
    { preHandler: verifyGame },
    (req, res) => {
      if (req.method != "DELETE") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      // add logic here
      res.status(204).send();
    }
  );

  app.get(
    "/api/oauth/verify",
    { preHandler: verifyToken },
    async (req, res) => {
      const token: any = req.headers["authorization"]?.split("eg1~")[1];
      const access_decoded: any = app.jwt.decode(token);

      const expires_at = new Date(
        new Date(access_decoded.created_at).getTime() +
          access_decoded.expires_in * 60 * 60 * 1000
      ).toISOString();

      const expires_in = Math.round(
        (new Date(
          new Date(access_decoded.created_at).getTime() +
            access_decoded.expires_in * 60 * 60 * 1000
        ).getTime() -
          new Date().getTime()) /
          1000
      );

      return {
        token,
        expires_in,
        expires_at,
        app: "fortnite",
        token_type: "bearer",
        client_service: "prod-fn",
        internal_client: true,
        session_id: access_decoded.jti,
        in_app_id: access_decoded.accountId,
        device_id: access_decoded.device_id,
        client_id: access_decoded.client_id,
        account_id: access_decoded.accountId,
        auth_method: access_decoded.grand_type,
        display_name: access_decoded.display_name,
      };
    }
  );

  app.get(
    "/api/epicdomains/ssodomains",
    { preHandler: verifyGame },
    (req, res) => {
      return [
        "fortnite.com",
        "epicgames.com",
        "unrealengine.com",
        "unrealtournament.com",
        "fortnitevod.akamized.net",
        "vantage.lunarfn.org",
        "api.lunarfn.org",
        "auth.lunarfn.org",
        "status.lunarfn.org",
      ];
    }
  );

  app.all(
    "/api/public/account/:accountId/deviceAuth",
    { preHandler: verifyGame },
    (req, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      return {};
    }
  );

  app.setNotFoundHandler((req, res) => {
    const err = error.not_found(req);
    res.headers(err.header).status(404).send(err.error);
  });
};

export default account;
