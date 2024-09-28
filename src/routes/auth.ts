import { FastifyPluginAsync } from "fastify";
import { config } from "dotenv";
import axios from "axios";
import crypto from "crypto";

import Account from "../../model/account";
import Athena from "../../model/athena";
import Friends from "../../model/friends";
import * as error from "../utils/error";
import * as log from "../utils/log";
import * as discord from "../discord/bot";
import * as exchange from "../utils/exchange";

config();
const { appRedirect, appRedirect2 } = process.env;

const auth: FastifyPluginAsync = async (app) => {
  app.get("/api/discord/v2/redirect", (req, res) => {
    res.redirect(String(appRedirect));
  });

  app.get("/api/discord/v2/redirect/other-device", (req, res) => {
    res.redirect(String(appRedirect2));
  });

  // auth-v2: over website
  app.get("/api/discord/v2/create", async (req, res) => {
    const code = (req.query as { code?: string })?.code;
    const otherDevice = (req.query as { "other-device": string })?.[
      "other-device"
    ];

    if (!code) {
      const err = error.bad_request(req);
      return res.headers(err.header).status(400).send(err.error);
    }

    let response: any;

    try {
      response = await axios.post(
        "https://discord.com/api/v10/oauth2/token",
        {
          client_id: "1194032828753653832",
          client_secret: "eUA2MP0FT-Dp0Lnj9L5vmLCzX7nVlpsn",
          grant_type: "authorization_code",
          redirect_uri: otherDevice
            ? "https://auth.lunarfn.org/discord_callback/other-device"
            : "https://auth.lunarfn.org/discord_callback",
          code,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
    } catch {
      const err = error.bad_request(req);
      return res.headers(err.header).status(400).send(err.error);
    }

    const usrResponse = await axios.get("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${response.data.access_token}`,
      },
    });

    if (usrResponse.status !== 200) {
      return {
        success: false,
        error: "unexpected status code from discord api.",
      };
    }

    const { id, username, email } = usrResponse.data;

    if (!discord.IsInServerCheck(id)) {
      return {
        success: false,
        error:
          "You are not in the Lunar discord server! - Join here: https://discord.lunarfn.org",
      };
    }

    if (!id || !username || !email) {
      return {
        success: false,
        error:
          "Please make sure that you have an email address added to your discord account.",
      };
    }

    const check = await Account.findOne({ Email: email }).lean();
    if (check?.accountId) {
      const athena = await Athena.findOne({
        accountId: check.accountId,
      }).lean();
      const exchange_code: string = exchange.CreateExchange(check?.accountId);
      const SeletedSkin =
        athena?.Skin?.split(":")[1] || "CID_001_Athena_Commando_F_Default";
      let account_info: object = {};

      if (otherDevice) {
        account_info = { email: check.Email, pwd: check.Token };
      }

      return {
        success: true,
        exchange_code,
        account_info,
        profile: {
          avatar: `https://fortnite-api.com/images/cosmetics/br/${SeletedSkin}/icon.png`,
          displayName: check.DisplayName,
          accountId: check.accountId,
        },
      };
    }

    const accountId: string = crypto.randomBytes(16).toString("hex");

    try {
      const account = new Account({
        accountId,
        DiscordId: id,
        DisplayName: username,
        Email: email,
        Token: crypto.randomBytes(10).toString("hex"),
      });

      const athena = new Athena({ accountId });
      const friends = new Friends({ accountId });

      account.save();
      athena.save();
      friends.save();

      log.account(`${username} successfully created an account!`);

      const exchange_code: string = exchange.CreateExchange(accountId);
      const SelectedAccount = await Account.findOne({ accountId }).lean();
      const SeletedSkin =
        athena?.Skin?.split(":")[1] || "CID_001_Athena_Commando_F_Default";
      return {
        success: true,
        exchange_code,
        profile: {
          avatar: `https://fortnite-api.com/images/cosmetics/br/${SeletedSkin}/icon.png`,
          displayName: SelectedAccount?.DisplayName,
          accountId,
        },
      };
    } catch {
      const err = error.server_error(req);
      return res.headers(err.header).status(500).send(err.error);
    }
  });

  app.all("/api/launcher/auth-request", async (req, res) => {
    if (req.method != "POST") {
      const err = error.method(req);
      return res.headers(err.header).status(405).send(err.error);
    }

    let response;
    let accountId;
    let account;

    const code = (req.body as { code: string })?.code;
    try {
      accountId = exchange.useExchange(code).accountId;
      account = await Account.findOne({ accountId }).lean();
    } catch {
      return {
        success: false,
        server_time: new Date().toISOString(),
      };
    }

    if (accountId && account) {
      response = {
        success: true,
        accountId: accountId,
        email: account.Email,
        password: account.Token,
        displayName: account.DisplayName,
        banned: account.Banned,
        created: account.created,
        server_time: new Date().toISOString(),
      };
    } else {
      response = {
        success: false,
        server_time: new Date().toISOString(),
      };
    }

    return response;
  });

  app.all("/api/launcher/verify-login", async (req, res) => {
    if (req.method != "POST") {
      const err = error.method(req);
      return res.headers(err.header).status(405).send(err.error);
    }

    const accountId = (req.body as { accountId: string })?.accountId;
    const Email = (req.body as { email: string })?.email;
    const Token = (req.body as { password: string })?.password;

    const account = await Account.findOne({ accountId, Email, Token }).lean();

    // we cant really get the access_token of the user here so this must be enough.
    if (account?.accountId) {
      if (!discord.IsInServerCheck(account.DiscordId)) {
        return {
          success: false,
          server_time: new Date().toISOString(),
          message: "Login refresh failed, user left our discord server.",
        };
      }

      return {
        success: true,
        server_time: new Date().toISOString(),
        message: "Login was successfully refreshed.",
      };
    }

    return {
      success: false,
      server_time: new Date().toISOString(),
      message: "Login refresh failed, account data was not valid.",
    };
  });
};

export default auth;
