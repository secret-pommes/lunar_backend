import { FastifyPluginAsync } from "fastify";

import * as error from "../utils/error";

const waitingroom: FastifyPluginAsync = async (app) => {
  app.get("/", async (req, res) => {
    res.redirect("https://discord.gg/mQ59p5KD6f");
  });

  app.setNotFoundHandler((req, res) => {
    const err = error.not_found(req);
    res.headers(err.header).status(404).send(err.error);
  });
};

export default waitingroom;
