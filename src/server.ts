// ProjectLunarFN - Backend (ArisaVurr02)
// https://github.com/LunarFN/Backend

import fastify from "fastify";
import formBodyPlugin from "@fastify/formbody";
import fastifyRateLimit from "@fastify/rate-limit";
import multipart from "@fastify/multipart";
import fastifyJwt from "@fastify/jwt";
import mongoose from "mongoose";
import { config } from "dotenv";

import * as log from "./utils/log";
import * as error from "./utils/error";
import * as global from "./global";
import * as filters from "../resources/filters";
import * as catalogManager from "./utils/catalogManager";

/*import athena from "../model/athena";
UpdateCALL();
async function UpdateCALL() {
  const result = await athena.updateMany(
    { AmountOfDeaths: { $exists: false } },
    { $set: { AmountOfDeaths: 0 } }
  );
  console.log(result.matchedCount);
}*/

config();
log.boot();

const { Host, Port, MongoURI, user, pass, dbName } = process.env;
const app = fastify({ logger: false });

app.listen({ host: String(Host), port: Number(Port) }, () => {
  log.backend(`Started listening on port ${Port}!`);
  catalogManager.ConvertShop();
  import("./discord/bot");
});

mongoose
  .connect(MongoURI as string, { user, pass, dbName })
  .then(() => log.backend("Connected to database!"))
  .catch((err) =>
    log.warning(`Error while connecting backend with database!\nErr: ${err}`)
  );

app.register(formBodyPlugin);
app.register(multipart, { attachFieldsToBody: true });
app.register(fastifyJwt, { secret: global.JWTSecret });
app.register(fastifyRateLimit, { global: true, max: 150 });

app.addContentTypeParser("*", function (request, payload, done) {
  let data = "";
  payload.on("data", (chunk) => {
    data += chunk.toString("latin1");
  });
  payload.on("end", () => {
    done(null, data);
  });
});

app.addHook("onRequest", (request, reply, done) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  reply.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (request.method === "OPTIONS") {
    reply.status(200).send();
  } else {
    done();
  }
});

app.addHook("preParsing", (req, res, payload, done) => {
  if (
    ["POST", "DELETE"].includes(req.method) &&
    req.headers["content-type"] == "application/json" &&
    req.headers["content-length"] == "0"
  ) {
    filters.default.forEach((endpoint: string) => {
      if (req.originalUrl.includes(endpoint)) {
        delete req.headers["content-type"];
      }
    });
  }

  done();
});

registerRoutes();
function registerRoutes() {
  app.register(import("./routes/account"), { prefix: "/account" });
  app.register(import("./routes/affiliates"), { prefix: "/affiliates" });
  app.register(import("./routes/api"), { prefix: "/api" });
  app.register(import("./routes/auth"), { prefix: "/auth" });
  app.register(import("./routes/client"), { prefix: "/client" });
  app.register(import("./routes/content"), { prefix: "/content" });
  app.register(import("./routes/datarouter"), { prefix: "/datarouter" });
  app.register(import("./routes/dedicated"), { prefix: "/dedicated" });
  app.register(import("./routes/discord"), { prefix: "/discord" });
  app.register(import("./routes/eulatracking"), { prefix: "/eulatracking" });
  app.register(import("./routes/fortnite"), { prefix: "/fortnite" });
  app.register(import("./routes/friends"), { prefix: "/friends" });
  app.register(import("./routes/launcher"), { prefix: "/launcher" });
  app.register(import("./routes/launcher-resources"), {
    prefix: "/launcher-resources",
  });
  app.register(import("./routes/lightswitch"), { prefix: "/lightswitch" });
  app.register(import("./routes/party"), { prefix: "/party" });
  app.register(import("./routes/statsproxy"), { prefix: "/statsproxy" });
  app.register(import("./routes/voice"), { prefix: "/voice" });
  app.register(import("./routes/waitingroom"), { prefix: "/waitingroom" });
}

app.setErrorHandler((err, req, res) => {
  if (err.statusCode === 429) {
    const err = error.rate_limited(req);
    res.headers(err.header).status(429).send(err.error);
  }
});

app.setNotFoundHandler((req, res) => {
  const err = error.not_found(req);
  res.headers(err.header).status(404).send(err.error);
});
