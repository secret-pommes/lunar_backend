import { FastifyPluginAsync } from "fastify";
import { config } from "dotenv";

import Account from "../../model/account";
import Athena from "../../model/athena";
import * as error from "../utils/error";
import * as log from "../utils/log";
import * as questManager from "../utils/questManager";

config();
const { API_KEY } = process.env;

const amountOfVBucks: any = {
  elimination: 150,
  victory: 500,
};

const XPInteraction: any = {
  chest: 140,
  ammo_box: 95,
  supply_drop: 190,
  llama: 1000,
  elimination: 150,
  victory: 230, // EL + WIN
  placing: 0,
};

const dedicated: FastifyPluginAsync = async (app) => {
  app.get("/api/change_currency/:serverId", async (req, res) => {
    const ApiKey = (req.query as { api_key: string })?.api_key;

    if (ApiKey != API_KEY) {
      const err = error.authorization_failed(req);
      return res.headers(err.header).status(401).send(err.error);
    }

    const DisplayName = (req.query as { display_name: string })?.display_name;
    const type = (req.query as { type: string })?.type.toLowerCase();
    const amount: number = amountOfVBucks[type];
    const account = await Account.findOne({ DisplayName }).lean();

    await Athena.updateOne(
      { accountId: account?.accountId },
      { $inc: { Currency: amount, LeaderboardScore: 50, Eliminations: 1 } }
    );

    log.debug(`Gave ${DisplayName} ${amount} of Vbucks due ${type}`);
    res.status(204).send();
  });

  // i hate this code btw.
  app.get("/api/change_levels/:serverId", async (req, res) => {
    const ApiKey = (req.query as { api_key: string })?.api_key;

    if (ApiKey != API_KEY) {
      const err = error.authorization_failed(req);
      return res.headers(err.header).status(401).send(err.error);
    }

    const DisplayName = (req.query as { display_name: string })?.display_name;
    const type = (req.query as { type: string })?.type.toLowerCase(); // actually we dont really need this cuz we got ActorName
    const actor = (
      req.query as { actor_name: string }
    )?.actor_name.toLowerCase();
    const amount: number = XPInteraction[type];
    const account = await Account.findOne({ DisplayName }).lean();


    console.log(`type: ${type}`);
    console.log(`actor: ${actor}`);
    console.log(`XP Amount: ${amount}`);
    let itemsToUpdate: any[] = [];

    await Promise.all([
      Athena.updateOne(
        { accountId: account?.accountId },
        { $inc: { XP: amount }, $push: { AthenaItems: itemsToUpdate } }
      ),
      questManager.checkQuestChanges(String(account?.accountId), actor),
    ]);

    res.status(204).send();
  });

  app.get("/api/ban/:serverid", async (req, res) => {
    const ApiKey = (req.query as { api_key: string })?.api_key;
    const DisplayName = (req.query as { display_name: string })?.display_name;

    if (ApiKey != API_KEY) {
      const err = error.authorization_failed(req);
      return res.headers(err.header).status(401).send(err.error);
    }

    await Account.updateOne({ DisplayName }, { $set: { Banned: true } });

    res.status(204).send();
  });

  // slow ass route
  app.get("/api/setup_user/:serverId", async (req, res) => {
    const ApiKey = (req.query as { api_key: string })?.api_key;
    const DisplayName = (req.query as { display_name: string })?.display_name;

    if (ApiKey != API_KEY) {
      const err = error.authorization_failed(req);
      return res.headers(err.header).status(401).send(err.error);
    }

    const account = await Account.findOne({ DisplayName }).lean();
    await Athena.updateOne({ accountId: account?.accountId }, { $inc: { MatchesPlayed: 1, LeaderboardScore: 5 } });

    if (account?.Banned) return res.status(400).send("User does not have the required permissions to play.");
    res.status(204).send();
  });
};

export default dedicated;
