import { FastifyPluginAsync } from "fastify";

import * as error from "../utils/error";
import { verifyGame } from "../utils/preHandler";

const datarouter: FastifyPluginAsync = async (app) => {
  app.all(
    "/api/v1/public/data",
    { preHandler: verifyGame },
    async (req, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      res.status(204);
    }
  );

  app.setNotFoundHandler((req, res) => {
    const err = error.not_found(req);
    res.headers(err.header).status(404).send(err.error);
  });
};

export default datarouter;
