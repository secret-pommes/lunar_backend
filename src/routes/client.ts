import { FastifyPluginAsync } from "fastify";

import Athena from "../../model/athena";
import Account from "../../model/account";
import Friends from "../../model/friends";
import Bans from "../../model/bans";
import * as error from "../utils/error";
import * as log from "../utils/log";

const client: FastifyPluginAsync = async (app) => {
  app.all("/api/launcher/v2/getProfile", async (req, res) => {
    if (req.method != "POST") {
      const err = error.method(req);
      return res.headers(err.header).status(405).send(err.error);
    }

    const accountId = (req.body as { accountId: string })?.accountId;
    const account = await Account.findOne({ accountId }).lean();
    const athena = await Athena.findOne({ accountId }).lean();

    const SeletedSkin = (
      athena?.Skin?.split(":")[1] || "CID_001_Athena_Commando_F_Default"
    ).toLowerCase();

    if (account?.accountId) {
      return {
        charater: {
          id: athena?.Skin,
          img: `https://fortnite-api.com/images/cosmetics/br/${SeletedSkin}/icon.png`,
        },
        user: {
          accountId,
          displayName: account?.DisplayName,
          created: account?.created,
        },
        stats: {
          currency: athena?.Currency,
          leaderboardScore: athena?.LeaderboardScore,
          matchedPlayed: athena?.MatchesPlayed,
          eliminations: athena?.Eliminations,
        },
      };
    }

    return {
      error: `A Profile with the accountId ${accountId} does not exist.`,
    };
  });

  app.all("/api/launcher/v2/getFriends", async (req, res) => {
    if (req.method != "POST") {
      const err = error.method(req);
      return res.headers(err.header).status(405).send(err.error);
    }

    const accountId = (req.body as { accountId: string })?.accountId;
    const friends = await Friends.findOne({ accountId }).lean();

    if (friends?.accountId) {
      return {
        accepted: friends?.Accepted,
        incoming: friends?.Incoming,
        outgoing: friends?.Outgoing,
        blocked: friends?.Blocked,
      };
    }

    return {
      error: `A Profile with the accountId ${accountId} does not exist.`,
    };
  });

  app.get("/api/launcher/v2/:accountId/check-hwid", async (req, res) => {
    const header: any = req.headers["authorization"]?.split(" ")[1];
    const decoded_token: any = app.jwt.decode(header);

    if (decoded_token.accountId) {
      const account = await Account.findOne({
        accountId: decoded_token.accountId,
      }).lean();

      if (account?.CurrentHardwareId != decoded_token.hwid) {
        log.debug(`${account?.accountId}'s HWID was not set or got changed.`);
        let Banned = false;

        const AllBans = await Bans.findOne({ branch: "main" }).lean();
        if (JSON.stringify(AllBans?.HWID).includes(decoded_token.hwid)) {
          log.debug(
            `${decoded_token.accountId}'s HWID is banned, Banning Account.`
          );

          Banned = true;

          await Account.updateOne(
            { accountId: decoded_token.accountId },
            { $set: { Banned: true } }
          );

          const token = await res.jwtSign({
            accountId: decoded_token.accountId,
            banned: true,
            msg: `${
              decoded_token.accountId
            } has been banned because of banned hwid. banned at: ${new Date().toISOString()}`,
          });

          return {
            accountId: decoded_token.accountId,
            token,
            response_created: new Date().toISOString(),
          };
        }

        await Account.updateOne(
          { accountId: decoded_token.accountId },
          { $set: { CurrentHardwareId: decoded_token.hwid, Banned } }
        );
      }

      const bannedAccounts = await Bans.findOne({ branch: "main" }).lean();
      if (bannedAccounts?.HWID.includes(account?.CurrentHardwareId)) {
        const token = await res.jwtSign({
          accountId: decoded_token.accountId,
          banned: true,
          msg: `${
            decoded_token.accountId
          } has been banned because of banned hwid. banned at: ${new Date().toISOString()}`,
        });

        return {
          accountId: decoded_token.accountId,
          token,
          response_created: new Date().toISOString(),
        };
      }

      const token = await res.jwtSign({
        accountId: decoded_token.accountId,
        banned: false,
        msg: `${
          decoded_token.accountId
        } is not banned. checked at: ${new Date().toISOString()}`,
      });

      return {
        accountId: decoded_token.accountId,
        token,
        response_created: new Date().toISOString(),
      };
    }

    const err = error.authorization_failed(req);
    return res.headers(err.header).status(401).send(err.error);
  });

  app.setNotFoundHandler((req, res) => {
    const err = error.not_found(req);
    res.headers(err.header).status(404).send(err.error);
  });
};

export default client;
