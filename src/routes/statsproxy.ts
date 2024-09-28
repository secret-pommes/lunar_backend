import { FastifyPluginAsync } from "fastify";

import * as error from "../utils/error";
import { verifyToken } from "../token/verify";

const statsproxy: FastifyPluginAsync = async (app) => {
  app.get(
    "/api/statsv2/account/:accountId",
    { preHandler: verifyToken },
    (req, res) => {
      return {
        accountId: (req.params as { accountId: string })?.accountId,
        startTime: 0,
        endTime: 0,
        stats: {
          br_kills_keyboardmouse_m0_playlist_DefaultDuo: 0,
          br_kills_keyboardmouse_m0_playlist_DefaultSolo: 0,
          br_kills_keyboardmouse_m0_playlist_DefaultSquad: 0,
          br_matchesplayed_keyboardmouse_m0_playlist_DefaultDuo: 0,
          br_matchesplayed_keyboardmouse_m0_playlist_DefaultSolo: 0,
          br_matchesplayed_keyboardmouse_m0_playlist_DefaultSquad: 0,
          br_placetop10_keyboardmouse_m0_playlist_DefaultSolo: 0,
          br_placetop12_keyboardmouse_m0_playlist_DefaultDuo: 0,
          br_placetop1_keyboardmouse_m0_playlist_DefaultDuo: 0,
          br_placetop1_keyboardmouse_m0_playlist_DefaultSolo: 0,
          br_placetop1_keyboardmouse_m0_playlist_DefaultSquad: 0,
          br_placetop25_keyboardmouse_m0_playlist_DefaultSolo: 0,
          br_placetop3_keyboardmouse_m0_playlist_DefaultSquad: 0,
          br_placetop5_keyboardmouse_m0_playlist_DefaultDuo: 0,
          br_placetop6_keyboardmouse_m0_playlist_DefaultSquad: 0,
          br_score_keyboardmouse_m0_playlist_DefaultDuo: 0,
          br_score_keyboardmouse_m0_playlist_DefaultSolo: 0,
          br_score_keyboardmouse_m0_playlist_DefaultSquad: 0,
        },
      };
    }
  );

  app.setNotFoundHandler((req, res) => {
    const err = error.not_found(req);
    res.headers(err.header).status(404).send(err.error);
  });
};

export default statsproxy;
