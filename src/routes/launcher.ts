import { FastifyPluginAsync } from "fastify";

import * as error from "../utils/error";

const launcher: FastifyPluginAsync = async (app) => {
  app.get("/api/public/distributionpoints*", (req, res) => {
    return {
      distributions: [
        "https://epicgames-download1.akamaized.net/",
        "https://download.epicgames.com/",
        "https://download2.epicgames.com/",
        "https://download3.epicgames.com/",
        "https://download4.epicgames.com/",
      ],
    };
  });

  app.setNotFoundHandler((req, res) => {
    const err = error.not_found(req);
    res.headers(err.header).status(404).send(err.error);
  });
};

export default launcher;
