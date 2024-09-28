import { FastifyReply } from "fastify";
import crypto from "crypto";
import * as global from "../global";

export async function CreateClient(
  client_id: number,
  grant_type: string,
  expires_in: number,
  ip: string,
  res: FastifyReply
) {
  const token = `eg1~${await res.jwtSign({
    client_id,
    grant_type,
    expires_in,
    client_service: "fortnite",
    jti: crypto.randomUUID().replace(/-/gi, ""),
    created_at: new Date().toISOString(),
  })}`;

  global.ClientTokens.push({ ip, token });
  return token;
}

export async function CreateAccess(
  account: any,
  client_id: string,
  grant_type: string,
  device_id: string,
  expires_in: number,
  res: FastifyReply
) {
  const token = `eg1~${await res.jwtSign({
    account,
    client_id,
    grant_type,
    device_id,
    expires_in,
    client_service: "fortnite",
    accountId: account.accountId,
    display_name: account.DisplayName,
    jti: crypto.randomUUID().replace(/-/gi, ""),
    created_at: new Date().toISOString(),
  })}`;

  global.AccessTokens.push({ accountId: account.accountId, token });
  return token;
}

export async function CreateRefresh(
  account: any,
  client_id: string,
  grant_type: string,
  device_id: string,
  expires_in: number,
  res: FastifyReply
) {
  const token = `eg1~${await res.jwtSign({
    account,
    client_id,
    grant_type,
    device_id,
    expires_in,
    client_service: "fortnite",
    accountId: account.accountId,
    jti: crypto.randomUUID().replace(/-/gi, ""),
    created_at: new Date().toISOString(),
  })}`;

  global.RefreshTokens.push({ accountId: account.accountId, token });
  return token;
}
