import { FastifyPluginAsync } from "fastify";

import * as error from "../utils/error";
import { verifyClient } from "../token/verify";

const launcher_resources: FastifyPluginAsync = async (app) => {
  app.get(
    "/waitingroom/Fortnite/retryconfig.json",
    { preHandler: verifyClient },
    async (req, res) => {
      return {
        maxRetryCount: 3,
        retryInterval: 5,
        retryJitter: 10,
        failAction: "ABORT",
      };
    }
  );

  app.get(
    "/waitingroom/retryconfig.json",
    { preHandler: verifyClient },
    async (req, res) => {
      return {
        maxRetryCount: 3,
        retryInterval: 5,
        retryJitter: 10,
        failAction: "ABORT",
      };
    }
  );

  app.setNotFoundHandler((req, res) => {
    const err = error.not_found(req);
    res.headers(err.header).status(404).send(err.error);
  });
};

export default launcher_resources;
