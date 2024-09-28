import { FastifyPluginAsync } from "fastify";
import { config } from "dotenv";

import Friends from "../../model/friends";
import * as error from "../utils/error";
import * as utils from "../utils/utils";
import { verifyToken } from "../token/verify";

config();
const { API_KEY } = process.env;

const friends: FastifyPluginAsync = async (app) => {
  app.get(
    "/api/public/friends/:accountId",
    { preHandler: verifyToken },
    async (req, res) => {
      let final: any = [];

      const friends = await Friends.findOne({
        accountId: (req.params as { accountId: string })?.accountId,
      }).lean();

      friends?.Accepted.forEach((friend: any) => {
        final.push({
          accountId: friend.accountId,
          status: "ACCEPTED",
          direction: "OUTBOUND",
          created: "1337-01-01T00:00:00.000Z",
          favorite: false,
        });
      });

      friends?.Incoming.forEach((friend: any) => {
        final.push({
          accountId: friend.accountId,
          status: "PENDING",
          direction: "INBOUND",
          created: "1337-01-01T00:00:00.000Z",
          favorite: false,
        });
      });

      friends?.Outgoing.forEach((friend: any) => {
        final.push({
          accountId: friend.accountId,
          status: "PENDING",
          direction: "OUTBOUND",
          created: "1337-01-01T00:00:00.000Z",
          favorite: false,
        });
      });

      return final;
    }
  );

  app.all(
    "/api/public/friends/:senderId/:receiverId",
    { preHandler: verifyToken },
    async (req, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      const sender = await Friends.findOne({
        accountId: (req.params as { senderId: string }).senderId,
      }).lean();
      const receiver = await Friends.findOne({
        accountId: (req.params as { receiverId: string }).receiverId,
      }).lean();

      if (!sender?.accountId || !receiver?.accountId) {
        const err = error.custom(
          req,
          "bad_request",
          null,
          "Bad Request",
          "fortnite"
        );
        return res.headers(err.header).status(400).send(err.error);
      }

      if (sender.Incoming.find((x: any) => x.accountId == receiver.accountId)) {
        if (
          !(await utils.acceptFriendRequest(
            sender.accountId,
            receiver.accountId
          ))
        ) {
          const err = error.custom(
            req,
            "bad_request",
            null,
            "Bad Request",
            "fortnite"
          );
          return res.headers(err.header).status(400).send(err.error);
        }
      } else if (
        !sender.Outgoing.find((x: any) => x.accountId == receiver.accountId)
      ) {
        if (
          !(await utils.sendFriendRequest(sender.accountId, receiver.accountId))
        ) {
          const err = error.custom(
            req,
            "bad_request",
            null,
            "Bad Request",
            "fortnite"
          );
          return res.headers(err.header).status(400).send(err.error);
        }
      }

      return res.status(204).send();
    }
  );

  // idfk the route for deleting friends :/

  app.get(
    "/api/public/blocklist/:accountId",
    { preHandler: verifyToken },
    async (req, res) => {
      const friends = await Friends.findOne({
        accountId: (req.params as { accountId: string })?.accountId,
      }).lean();

      return { blockedUsers: friends?.Blocked.map((x: any) => x.accountId) };
    }
  );

  app.get(
    "/api/public/list/fortnite/:accountId/recentPlayers",
    { preHandler: verifyToken },
    (req, res) => {
      return [];
    }
  );

  app.get(
    "/api/v1/:accountId/settings",
    { preHandler: verifyToken },
    (req, res) => {
      return {};
    }
  );

  app.setNotFoundHandler((req, res) => {
    const err = error.not_found(req);
    res.headers(err.header).status(404).send(err.error);
  });
};

export default friends;
