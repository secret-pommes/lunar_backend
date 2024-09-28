import { FastifyPluginAsync } from "fastify";

import * as error from "../utils/error";
import { verifyToken } from "../token/verify";
import { verifyGame } from "../utils/preHandler";

const party: FastifyPluginAsync = async (app) => {
  app.get(
    "/api/v1/Fortnite/user/:accountId",
    { preHandler: verifyToken },
    (req, res) => {
      return { current: [], pending: [], invites: [], pings: [] };
    }
  );

  app.get(
    "/v1/Fortnite/user/:accountId/notifications/undelivered/count",
    { preHandler: verifyToken },
    (req, res) => res.status(204).send()
  );

  // todo: get method of this route.
  app.all(
    "/api/v1/Fortnite/parties/:partyId/members/:accountId",
    { preHandler: verifyToken },
    (req, res) => res.status(204).send()
  );

  app.all(
    "/api/v1/Fortnite/parties",
    { preHandler: verifyGame },
    (req, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      res.status(204).send();
    }
  );

  app.all(
    "/api/v1/Fortnite/parties/:partyId/members/:accountId/meta",
    { preHandler: verifyToken },
    (req, res) => {
      if (req.method != "PATCH") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      res.status(204).send();
    }
  );

  app.setNotFoundHandler((req, res) => {
    const err = error.not_found(req);
    res.headers(err.header).status(404).send(err.error);
  });
};

export default party;
