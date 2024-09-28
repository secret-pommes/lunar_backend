import { FastifyPluginAsync } from "fastify";

import * as error from "../utils/error";
import { verifyGame } from "../utils/preHandler";

import * as eula from "../../resources/eula";

const eulatracking: FastifyPluginAsync = async (app) => {
  app.all(
    "/api/public/agreements/fn/version/5/account/:accountId/accept",
    { preHandler: verifyGame },
    (req, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }
      return {};
    }
  );

  app.get(
    "/api/public/agreements/FortniteMobileAndroid/account/:accountId",
    { preHandler: verifyGame },
    (req, res) => {
      return eula.default;
    }
  );

  app.get(
    "/api/shared/agreements/fn",
    { preHandler: verifyGame },
    (req, res) => {
      return eula.default;
    }
  );

  app.setNotFoundHandler((req, res) => {
    const err = error.not_found(req);
    res.headers(err.header).status(404).send(err.error);
  });
};

export default eulatracking;
