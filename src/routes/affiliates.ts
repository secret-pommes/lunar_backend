import { FastifyPluginAsync } from "fastify";
import { config } from "dotenv";

import Account from "../../model/account";
import * as error from "../utils/error";
import { verifyGame } from "../utils/preHandler";

config();

const affiliates: FastifyPluginAsync = async (app) => {
  /*app.get(
    "/api/public/affiliates/slug/:slug",
    { preHandler: verifyGame },
    async (req, res) => {
      const slug = (req.params as { slug?: string })?.slug || "";

      try {
        const code = ServerCfg.sacs[slug.toLowerCase()];
        const account = await Account.findOne({
          accountId: code.accountId,
        }).lean();

        if (code.accountId && account?.accountId && code.active) {
          return {
            id: code.accountId,
            slug: slug,
            displayName: account?.DisplayName,
            status: "ACTIVE",
            verified: true,
          };
        }
      } catch {
        const err = error.not_found(req);
        return res.headers(err.header).status(404).send(err.error);
      }
    }
  );*/

  app.setNotFoundHandler((req, res) => {
    const err = error.not_found(req);
    res.headers(err.header).status(404).send(err.error);
  });
};

export default affiliates;
