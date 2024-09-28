import { FastifyInstance } from "fastify";

export async function decodeToken(app: FastifyInstance, token: string) {
  try {
    const decoded = await app.jwt.decode(token);
    return decoded;
  } catch {
    return null;
  }
}
