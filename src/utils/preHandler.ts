import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from "fastify";
import * as error from "./error";

export function verifyGame(
  req: FastifyRequest,
  res: FastifyReply,
  next: HookHandlerDoneFunction
) {
  const agent = req.headers["user-agent"] || "";

  try {
    if (!agent.includes("Fortnite") && !agent.includes("EpicGamesLauncher")) {
      const err = error.authorization_failed(req);
      return res.headers(err.header).status(401).send(err.error);
    }
  } catch {
    const err = error.authorization_failed(req);
    return res.headers(err.header).status(401).send(err.error);
  }

  next();
}

export function verifyLauncher(
  req: FastifyRequest,
  res: FastifyReply,
  next: HookHandlerDoneFunction
) {
  const agent = req.headers["user-agent"] || "";

  try {
    if (!agent.includes("launcherv2") && !agent.includes("Electron")) {
      const err = error.authorization_failed(req);
      return res.headers(err.header).status(401).send(err.error);
    }
  } catch {
    const err = error.authorization_failed(req);
    return res.headers(err.header).status(401).send(err.error);
  }

  next();
}

export function verifyDedicated(
  req: FastifyRequest,
  res: FastifyReply,
  next: HookHandlerDoneFunction
) {
  try {
    if (req.headers["user-agent"]) {
      const err = error.authorization_failed(req);
      return res.headers(err.header).status(401).send(err.error);
    }
  } catch {
    const err = error.authorization_failed(req);
    return res.headers(err.header).status(401).send(err.error);
  }

  next();
}
