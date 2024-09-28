import { FastifyPluginAsync } from "fastify";

import * as utils from "../utils/utils";
import * as error from "../utils/error";
import * as tournaments from "../../resources/tournaments";
import { verifyToken } from "../token/verify";

const api: FastifyPluginAsync = async (app) => {
  app.get(
    "/v1/events/Fortnite/download/:accountId",
    { preHandler: verifyToken },
    (req, res) => {
      return tournaments.default;
    }
  );

  app.all("/v1/user/setting", { preHandler: verifyToken }, async (req, res) => {
    if (req.method != "POST") {
      const err = error.method(req);
      return res.headers(err.header).status(405).send(err.error);
    }

    return {};
  });

  app.get("/v1/epic-settings/public/users/:accountId/values", (req, res) => {
    return {};
  });

  app.get("/v1/players/Fortnite/:accountId", (req, res) => {
    return {
      result: true,
      region: "ALL",
      lang: utils.ClientLang(req).includes("-")
        ? utils.ClientLang(req).split("-")[0]
        : utils.ClientLang(req),
      season: utils.FNVersion(req).season,
      events: [],
    };
  });

  app.get("/v1/events/Fortnite/:eventId/history/:accountId", (req, res) => {
    return [];
  });

  app.get(
    "/v1/events/Fortnite/:eventId/:window/history/:accountId",
    (req, res) => {
      return [];
    }
  );

  app.setNotFoundHandler((req, res) => {
    const err = error.not_found(req);
    res.headers(err.header).status(404).send(err.error);
  });
};

export default api;
