import { FastifyPluginAsync } from "fastify";

import * as error from "../utils/error";
import { verifyToken } from "../token/verify";

const lightswitch: FastifyPluginAsync = async (app) => {
  app.get(
    "/api/service/bulk/status",
    { preHandler: verifyToken },
    async (req, res) => {
      const header: any = req.headers["authorization"]?.split("eg1~")[1];
      const access_decoded: any = app.jwt.decode(header);

      return [
        {
          serviceInstanceId: "fortnite",
          status: "UP",
          message: null,
          maintenanceUri: null,
          overrideCatalogIds: ["a7f138b2e51945ffbfdacc1af0541053"],
          allowedActions: ["PLAY", "DOWNLOAD"],
          banned: access_decoded.account.Banned,
          launcherInfoDTO: {
            appName: "Fortnite",
            catalogItemId: "4fe75bbc5a674f4f9b356b5c90567da5",
            namespace: "fn",
          },
        },
      ];
    }
  );

  app.get(
    "/api/service/Fortnite/status",
    { preHandler: verifyToken },
    async (req, res) => {
      const header: any = req.headers["authorization"]?.split("eg1~")[1];
      const access_decoded: any = app.jwt.decode(header);

      return {
        serviceInstanceId: "fortnite",
        status: "UP",
        message: null,
        maintenanceUri: null,
        overrideCatalogIds: ["a7f138b2e51945ffbfdacc1af0541053"],
        allowedActions: [],
        banned: access_decoded.account.Banned,
        launcherInfoDTO: {
          appName: "Fortnite",
          catalogItemId: "4fe75bbc5a674f4f9b356b5c90567da5",
          namespace: "fn",
        },
      };
    }
  );

  app.setNotFoundHandler((req, res) => {
    const err = error.not_found(req);
    res.headers(err.header).status(404).send(err.error);
  });
};

export default lightswitch;
