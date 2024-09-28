import { FastifyPluginAsync } from "fastify";

import * as error from "../utils/error";

const waitingroom: FastifyPluginAsync = async (app) => {
  app.get("/api/waitingroom", async (req, res) => {
    res.status(204);
  });

  app.setNotFoundHandler((req, res) => {
    const err = error.not_found(req);
    res.headers(err.header).status(404).send(err.error);
  });
};

export default waitingroom;
