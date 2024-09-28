import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from "fastify";

import * as error from "../utils/error";
import * as global from "../global";
import * as decode from "./decode";

export async function verifyToken(
  req: FastifyRequest,
  res: FastifyReply,
  next: HookHandlerDoneFunction
) {
  const authFailed = () => {
    const err = error.authorization_failed(req);
    return res.headers(err.header).status(401).send(err.error);
  };
  const header: any = req.headers["authorization"]?.split("eg1~")[1];
  if (!header) authFailed();
  try {
    const access_decoded: any = await decode.decodeToken(req.server, header);

    if (
      !access_decoded ||
      access_decoded.account.Banned ||
      new Date(
        new Date(access_decoded.created_at).getTime() +
          access_decoded.expires_in * 60 * 60 * 1000
      ).getTime() <= new Date().getTime()
    ) {
      authFailed();
    }

    next();
  } catch {
    authFailed();
  }
}

export async function verifyClient(
  req: FastifyRequest,
  res: FastifyReply,
  next: HookHandlerDoneFunction
) {
  const err = () => {
    const err = error.authorization_failed(req);
    return res.headers(err.header).status(401).send(err.error);
  };

  const header: any = req.headers["authorization"]?.split("eg1~")[1];
  const token = `eg1~${header}`; // add it back here

  try {
    const client_decoded: any = decode.decodeToken(req.server, header);
    const client_token = global.AccessTokens.find((x: any) => x.token == token);

    if (
      !client_token ||
      new Date(
        new Date(client_decoded.created_at).getTime() +
          client_decoded.expires_in * 60 * 60 * 1000
      ).getTime() <= new Date().getTime()
    ) {
      return err();
    }

    next();
  } catch {
    const access_token = global.AccessTokens.findIndex(
      (x: any) => x.token == token
    );
    const client_token = global.ClientTokens.findIndex(
      (x: any) => x.token == token
    );

    if (access_token != -1) global.AccessTokens.splice(access_token, 1);
    if (client_token != -1) global.ClientTokens.splice(client_token, 1);

    return err();
  }
  next();
}
