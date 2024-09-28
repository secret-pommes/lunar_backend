import { FastifyPluginAsync, FastifyReply } from "fastify";
import fs from "fs";
import path from "path";
import crypto from "crypto";

import Account from "../../model/account";
import Athena from "../../model/athena";
import Friends from "../../model/friends";

import * as CatalogManager from "../utils/catalogManager";
import * as utils from "../utils/utils";
import * as error from "../utils/error";
import * as keychain from "../../resources/keychain";
import * as worldInfo from "../../resources/worldInfo";

import { SendBackendReport } from "../discord/bot";
import { verifyToken, verifyClient } from "../token/verify";
import { verifyGame } from "../utils/preHandler";
import axios from "axios";

const fortnite: FastifyPluginAsync = async (app) => {
  app.register(import("./mcp"));

  app.all(
    "/api/game/v2/tryPlayOnPlatform/account/:accountId",
    { preHandler: verifyToken },
    async (req, res) => {
      if (req.method != "POST") {
        return res.status(405);
      }

      res.send("true");
    }
  );

  app.get(
    "/api/game/v2/enabled_features",
    { preHandler: verifyToken },
    async (req, res) => {
      return [];
    }
  );

  app.get(
    "/api/storefront/v2/keychain",
    { preHandler: verifyToken },
    async (req, res) => {
      return keychain.default;
    }
  );

  app.get(
    "/api/calendar/v1/timeline",
    { preHandler: verifyGame },
    async (req, res) => {
      const { season } = utils.FNVersion(req);
      const storefrontEnd = utils.GetEndOfDayAsISOString(new Date());

      // LawinServer Flags: https://github.com/Lawin0129/LawinServer/blob/main/structure/timeline.js
      // Neonite Flags: https://github.com/HybridFNBR/Neonite/blob/270bcf2951c4412af45c7541979efed9dbd9c0e6/api/controllers/TimelineController.js

      return {
        channels: {
          "client-matchmaking": {
            states: [],
            cacheExpire: "2025-12-31T00:00:00.000Z",
          },
          "client-events": {
            states: [
              {
                validFrom: "1337-01-01T00:00:00.000Z",
                activeEvents: [
                  {
                    eventType: "EventFlag.Mayday",
                    activeUntil: "2025-12-31T00:00:00.000Z",
                    activeSince: "1337-01-01T00:00:00.000Z",
                  },
                  {
                    eventType: "EventFlag.Season10.Phase2",
                    activeUntil: "2025-12-31T00:00:00.000Z",
                    activeSince: "1337-01-01T00:00:00.000Z",
                  },
                  {
                    eventType: "EventFlag.Season10.Phase3",
                    activeUntil: "2025-12-31T00:00:00.000Z",
                    activeSince: "1337-01-01T00:00:00.000Z",
                  },
                  {
                    eventType: "EventFlag.LTE_BlackMonday",
                    activeUntil: "2025-12-31T00:00:00.000Z",
                    activeSince: "1337-01-01T00:00:00.000Z",
                  },
                  {
                    eventType: "EventFlag.S10_Oak",
                    activeUntil: "2025-12-31T00:00:00.000Z",
                    activeSince: "1337-01-01T00:00:00.000Z",
                  },
                  {
                    eventType: "EventFlag.S10_Mystery",
                    activeUntil: "2025-12-31T00:00:00.000Z",
                    activeSince: "1337-01-01T00:00:00.000Z",
                  },
                  {
                    eventType: "EventFlag.Season10_UrgentMission_1",
                    activeUntil: "2025-12-31T00:00:00.000Z",
                    activeSince: "1337-01-01T00:00:00.000Z",
                  },
                  {
                    eventType: "EventFlag.Season10_UrgentMission_2",
                    activeUntil: "2025-12-31T00:00:00.000Z",
                    activeSince: "1337-01-01T00:00:00.000Z",
                  },
                  {
                    eventType: "EventFlag.Season10_UrgentMission_3",
                    activeUntil: "2025-12-31T00:00:00.000Z",
                    activeSince: "1337-01-01T00:00:00.000Z",
                  },
                  {
                    eventType: "EventFlag.Season10_UrgentMission_4",
                    activeUntil: "2025-12-31T00:00:00.000Z",
                    activeSince: "1337-01-01T00:00:00.000Z",
                  },
                  {
                    eventType: "EventFlag.Season10_UrgentMission_5",
                    activeUntil: "2025-12-31T00:00:00.000Z",
                    activeSince: "1337-01-01T00:00:00.000Z",
                  },
                  {
                    eventType: "EventFlag.Season10_UrgentMission_6",
                    activeUntil: "2025-12-31T00:00:00.000Z",
                    activeSince: "1337-01-01T00:00:00.000Z",
                  },
                  {
                    eventType: "EventFlag.Season10_UrgentMission_7",
                    activeUntil: "2025-12-31T00:00:00.000Z",
                    activeSince: "1337-01-01T00:00:00.000Z",
                  },
                  {
                    eventType: "EventFlag.Season10_UrgentMission_8",
                    activeUntil: "2025-12-31T00:00:00.000Z",
                    activeSince: "1337-01-01T00:00:00.000Z",
                  },
                  {
                    eventType: "EventFlag.Season10_UrgentMission_9",
                    activeUntil: "2025-12-31T00:00:00.000Z",
                    activeSince: "1337-01-01T00:00:00.000Z",
                  },
                  {
                    eventType: "EventFlag.Season10_UrgentMission_10",
                    activeUntil: "2025-12-31T00:00:00.000Z",
                    activeSince: "1337-01-01T00:00:00.000Z",
                  },
                ],
                state: {
                  activeStorefronts: [],
                  eventNamedWeights: {},
                  seasonNumber: season,
                  seasonTemplateId: `AthenaSeason:athenaseason${season}`,
                  matchXpBonusPoints: 0,
                  seasonBegin: "1337-12-01T07:30:00Z",
                  seasonEnd: "2024-09-27T00:15:00.000Z",
                  seasonDisplayedEnd: "2024-09-27T00:15:00.000Z",
                  weeklyStoreEnd: storefrontEnd,
                  sectionStoreEnds: { Featured: storefrontEnd },
                  dailyStoreEnd: storefrontEnd,
                  stwEventStoreEnd: storefrontEnd,
                  stwWeeklyStoreEnd: storefrontEnd,
                },
              },
            ],
            cacheExpire: "2025-12-31T00:00:00.000Z",
          },
        },
        eventsTimeOffsetHrs: 0,
        cacheIntervalMins: 15,
        currentTime: new Date().toISOString(),
      };
    }
  );

  app.get(
    "/api/v2/versioncheck/:platform",
    { preHandler: verifyGame },
    async (req, res) => {
      return { type: "NO_UPDATE" };
    }
  );

  app.get("/api/versioncheck", { preHandler: verifyGame }, (req, res) => {
    return { type: "NO_UPDATE" };
  });

  app.get(
    "/api/receipts/v1/account/:accountId/receipts",
    { preHandler: verifyGame },
    async (req, res) => {
      return [
        {
          appStore: "EpicPurchasingService",
          appStoreId: "9a6d478ff378450bb0fef2023953f700",
          receiptId: "9a110f75cf6745199d290d59e952630e",
          receiptInfo: "ENTITLEMENT",
        },
      ];
    }
  );

  app.all(
    "/api/game/v2/privacy/account/:accountId",
    { preHandler: verifyToken },
    (req, res) => {
      if (req.method != "POST" && req.method != "GET") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      const accountId = (req.params as { accountId: string })?.accountId;

      return {
        accountId: accountId,
        optOutOfPublicLeaderboards: false,
      };
    }
  );

  app.get(
    "/api/cloudstorage/system",
    { preHandler: verifyGame },
    (req, res) => {
      let location = path.join(__dirname, "../../resources/hotfixes");
      let files: any = [];

      fs.readdirSync(location).forEach((file) => {
        if (file.toLowerCase().endsWith(".ini")) {
          files.push({
            uniqueFilename: file,
            filename: file,
            hash: crypto
              .createHash("sha1")
              .update(fs.readFileSync(path.join(location, file).toString()))
              .digest("hex"),
            hash256: crypto
              .createHash("sha256")
              .update(fs.readFileSync(path.join(location, file).toString()))
              .digest("hex"),
            length: (path.join(location, file), "utf-8").length,
            contentType: "application/octet-stream",
            uploaded: fs.statSync(path.join(location, file)).mtime,
            storageType: "S3",
            storageIds: {},
            doNotCache: true,
          });
        }
      });

      return files;
    }
  );

  // download server hotfixes
  app.get(
    "/api/cloudstorage/system/:file",
    { preHandler: verifyGame },
    (req, res) => {
      const fileParam = (req.params as { file: string })?.file;
      if (fileParam.includes("..") || fileParam.includes("~")) {
        const err = error.custom(
          req,
          "invalid_request",
          null,
          "Request cannot include .. in it.",
          "fortnite"
        );
        return res.headers(err.header).status(400).send(err.error);
      }

      let file = path.join(__dirname, `../../resources/hotfixes/${fileParam}`);

      if (fs.existsSync(file)) {
        return res.type("application/octet-stream").send(fs.readFileSync(file));
      }

      const err = error.not_found(req);
      res.headers(err.header).status(404).send(err.error);
    }
  );

  // Get avaiable saves on server.
  app.get(
    "/api/cloudstorage/user/:accountId",
    { preHandler: verifyClient },
    (req, res) => {
      const accountId = (req.params as { accountId: string }).accountId;
      const platform = utils.ClientPlatform(req);
      const saveDir = path.join(
        __dirname,
        `../../ClientSettings/${accountId}/ClientSettings.Sav`
      );

      if (fs.existsSync(saveDir)) {
        switch (platform) {
          case "windows": {
            return [
              {
                uniqueFilename: "ClientSettings.Sav",
                filename: "ClientSettings.Sav",
                hash: crypto
                  .createHash("sha1")
                  .update(fs.readFileSync(saveDir, "latin1"))
                  .digest("hex"),
                hash256: crypto
                  .createHash("sha256")
                  .update(fs.readFileSync(saveDir, "latin1"))
                  .digest("hex"),
                length: Buffer.byteLength(fs.readFileSync(saveDir, "latin1")),
                contentType: "application/octet-stream",
                uploaded: fs.statSync(saveDir).mtime,
                storageType: "S3",
                storageIds: {},
                accountId: accountId,
                doNotCache: false,
              },
            ];
          }
          case "switch": {
            return [
              {
                uniqueFilename: "ClientSettingsSwitch.Sav",
                filename: "ClientSettingsSwitch.Sav",
                hash: crypto
                  .createHash("sha1")
                  .update(fs.readFileSync(saveDir, "latin1"))
                  .digest("hex"),
                hash256: crypto
                  .createHash("sha256")
                  .update(fs.readFileSync(saveDir, "latin1"))
                  .digest("hex"),
                length: Buffer.byteLength(fs.readFileSync(saveDir, "latin1")),
                contentType: "application/octet-stream",
                uploaded: fs.statSync(saveDir).mtime,
                storageType: "S3",
                storageIds: {},
                accountId: accountId,
                doNotCache: false,
              },
            ];
          }
          case "android": {
            return [
              {
                uniqueFilename: "ClientSettingsAndroid.Sav",
                filename: "ClientSettingsAndroid.Sav",
                hash: crypto
                  .createHash("sha1")
                  .update(fs.readFileSync(saveDir, "latin1"))
                  .digest("hex"),
                hash256: crypto
                  .createHash("sha256")
                  .update(fs.readFileSync(saveDir, "latin1"))
                  .digest("hex"),
                length: Buffer.byteLength(fs.readFileSync(saveDir, "latin1")),
                contentType: "application/octet-stream",
                uploaded: fs.statSync(saveDir).mtime,
                storageType: "S3",
                storageIds: {},
                accountId: accountId,
                doNotCache: false,
              },
            ];
          }
          case "ios": {
            return [
              {
                uniqueFilename: "ClientSettingsIOS.Sav",
                filename: "ClientSettingsIOS.Sav",
                hash: crypto
                  .createHash("sha1")
                  .update(fs.readFileSync(saveDir, "latin1"))
                  .digest("hex"),
                hash256: crypto
                  .createHash("sha256")
                  .update(fs.readFileSync(saveDir, "latin1"))
                  .digest("hex"),
                length: Buffer.byteLength(fs.readFileSync(saveDir, "latin1")),
                contentType: "application/octet-stream",
                uploaded: fs.statSync(saveDir).mtime,
                storageType: "S3",
                storageIds: {},
                accountId: accountId,
                doNotCache: false,
              },
            ];
          }
          case "ps4": {
            return [
              {
                uniqueFilename: "ClientSettingsPS4.Sav",
                filename: "ClientSettingsPS4.Sav",
                hash: crypto
                  .createHash("sha1")
                  .update(fs.readFileSync(saveDir, "latin1"))
                  .digest("hex"),
                hash256: crypto
                  .createHash("sha256")
                  .update(fs.readFileSync(saveDir, "latin1"))
                  .digest("hex"),
                length: Buffer.byteLength(fs.readFileSync(saveDir, "latin1")),
                contentType: "application/octet-stream",
                uploaded: fs.statSync(saveDir).mtime,
                storageType: "S3",
                storageIds: {},
                accountId: accountId,
                doNotCache: false,
              },
            ];
          }
        }
      } else {
        return [];
      }
    }
  );

  // Save File to Server & Send file to server.
  app.all(
    "/api/cloudstorage/user/:accountId/:file",
    { preHandler: verifyToken },
    async (req, res: FastifyReply) => {
      const accountId = (req.params as { accountId: string })?.accountId;
      const saveDir = path.join(__dirname, `../../ClientSettings/${accountId}`);

      switch (req.method) {
        case "PUT": {
          if (!fs.existsSync(saveDir)) {
            fs.mkdirSync(saveDir);
          }

          const body: any = req.body;
          const file = path.join(saveDir, `ClientSettings.Sav`);

          fs.writeFileSync(file, body, "latin1");
          return res.status(204).send();
        }

        case "GET": {
          const file = path.join(
            __dirname,
            `../../ClientSettings/${accountId}/ClientSettings.Sav`
          );

          if (fs.existsSync(file)) {
            return res
              .type("application/octet-stream")
              .send(fs.readFileSync(file));
          } else {
            return res.status(204).send();
          }
        }

        default: {
          const err = error.method(req);
          return res.headers(err.header).status(405).send(err.error);
        }
      }
    }
  );

  app.get("/api/storefront/v2/catalog", (req, res) => {
    const catalog = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "../../resources/shop/finalCatalog.json"),
        "utf8"
      )
    );
    return catalog;
  });

  app.get(
    "/api/game/v2/friendcodes/:accountId/epic",
    { preHandler: verifyToken },
    (req, res) => {
      return {};
    }
  );

  app.get(
    "/api/game/v2/matchmakingservice/ticket/player/:accountId",
    { preHandler: verifyToken },
    async (req, res) => {
      let playlist = (req.query as { bucketId: string })?.bucketId.split(
        ":"
      )[3];
      const region = (req.query as { bucketId: string })?.bucketId
        .split(":")[2]
        .split(":")[0]
        .toLowerCase();
      const accountId = (req.params as { accountId: string })?.accountId;

      // For versions under 4.5 (atleast for 4.2)
      const LagacyPlaylistIndex: any = {
        2: "playlist_defaultsolo",
        10: "playlist_defaultduo",
        9: "playlist_defaultsquad",
      };

      // replace with proper playlist name.
      if (utils.FNVersion(req).version < 4.5) {
        playlist =
          LagacyPlaylistIndex[
            (req.query as { bucketId: string })?.bucketId.split(":")[3]
          ];
      }

      await Athena.updateOne(
        {
          accountId,
        },
        {
          CurrentBuildUniqueId: (
            req.query as { bucketId: string }
          )?.bucketId.split(":")[0],
        }
      );

      return {
        serviceUrl: "wss://titanium.lunarfn.org:443",
        ticketType: "mms-player",
        payload: app.jwt.sign({ accountId, region, playlist }),
        signature: "account",
      };
    }
  );

  app.get(
    "/api/matchmaking/session/:sessionId",
    {
      preHandler: verifyToken,
    },
    async (req, res) => {
      const sessionId = (req.params as { sessionId: string })?.sessionId;

      const header: any = req.headers["authorization"]?.split("eg1~")[1];
      const decoded_token: any = app.jwt.decode(header);
      const { accountId } = decoded_token.account;

      const [athena, account] = await Promise.all([
        Athena.findOne({ accountId }).lean(),
        Account.findOne({ accountId }).lean(),
      ]);

      const { data } = await axios.get(
        `https://titanium.lunarfn.org/dedicated/api/server_info/${sessionId}`
      );

      const { server } = data;

      if (!data.success) {
        const err = error.custom(
          req,
          "server_information_invalid",
          null,
          "Sorry while trying to get the server information from our matchmaking service and error occurred. Please try again.",
          "fortnite"
        );
        return res.headers(err.header).status(500).send(err.error);
      }

      if (account?.Banned) {
        const err = error.account_banned(req);
        return res
          .headers(err.header as any)
          .status(400)
          .send(err.error);
      }

      await Athena.updateOne({ accountId }, { $inc: { MatchesPlayed: 1 } });

      return {
        id: sessionId,
        ownerId: crypto
          .randomBytes(16)
          .toString("hex")
          .replace(/-/gi, "")
          .toUpperCase(),
        ownerName: "[DS]lunarfn-liveservers-prod02-latania",
        serverName: "[DS]lunarfn-liveservers-prod02-latania",
        serverAddress: server.ip,
        serverPort: Number(server.port),
        maxPublicPlayers: 220,
        openPublicPlayers: 175,
        maxPrivatePlayers: 0,
        openPrivatePlayers: 0,
        attributes: {
          REGION_s: String(server.region).toUpperCase(),
          GAMEMODE_s: "FORTATHENA",
          ALLOWBROADCASTING_b: true,
          SUBREGION_s: "DE",
          DCID_s: "LUNARFN-LIVESERVERS-PROD02-LATANIA",
          tenant_s: "Fortnite",
          MATCHMAKINGPOOL_s: "Any",
          STORMSHIELDDEFENSETYPE_i: 0,
          HOTFIXVERSION_i: 0,
          PLAYLISTNAME_s: server.playlist,
          SESSIONKEY_s: crypto
            .randomBytes(16)
            .toString("hex")
            .replace(/-/gi, "")
            .toUpperCase(),
          TENANT_s: "Fortnite",
          BEACONPORT_i: 15009,
        },
        publicPlayers: [],
        privatePlayers: [],
        totalPlayers: Number(server.player_counter),
        allowJoinInProgress: false,
        shouldAdvertise: false,
        isDedicated: false,
        usesStats: false,
        allowInvites: true,
        usesPresence: true,
        allowJoinViaPresence: true,
        allowJoinViaPresenceFriendsOnly: false,
        buildUniqueId: athena?.CurrentBuildUniqueId,
        lastUpdated: new Date().toISOString(),
        started: server.started,
      };
    }
  );

  app.get(
    "/api/game/v2/matchmaking/account/:accountId/session/:sessionId",
    {
      preHandler: verifyToken,
    },
    (req, res) => {
      return {
        accountId: (req.params as { accountId: string })?.accountId,
        sessionId: (req.params as { sessionId: string })?.sessionId,
        key: "none",
      };
    }
  );

  app.all(
    "/api/matchmaking/session/:sessionId/join",
    {
      preHandler: verifyToken,
    },
    async (req, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      res.status(204).send();
    }
  );

  app.all(
    "/api/game/v2/chat/:accountId/:chat_type/:chapter_type/:platform",
    { preHandler: verifyToken },
    (req, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      return { GlobalChatRooms: [{ roomName: "fortnite" }] };
    }
  );

  app.get("/api/stats/accountId/:accountId/bulk/window/:window", (req, res) => {
    return {
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
      accountId: (req.params as { accountId: string })?.accountId,
    };
  });

  app.get("/api/statsv2/*", { preHandler: verifyToken }, (req, res) => {
    const header: any = req.headers["authorization"]?.split("eg1~")[1];
    const accountId = (app.jwt.decode(header) as any).account.accountId;

    return {
      accountId,
      startTime: 0,
      endTime: 0,
      stats: {
        br_kills_keyboardmouse_m0_playlist_bots_defaultsolo: 0,
        br_matchesplayed_keyboardmouse_m0_playlist_playgroundv2: 0,
        br_score_keyboardmouse_m0_playlist_bots_defaultduo: 0,
        br_playersoutlived_touch_m0_playlist_bots_defaultsolo: 0,
        br_playersoutlived_keyboardmouse_m0_playlist_bots_defaultsolo: 0,
        br_matchesplayed_touch_m0_playlist_bots_nobuildbr_solo: 0,
        br_playersoutlived_keyboardmouse_m0_playlist_bots_defaultduo: 0,
        br_lastmodified_touch_m0_playlist_creative_mms_12_player_no_mms: 0,
        br_lastmodified_touch_m0_playlist_bots_nobuildbr_solo: 0,
        s22_social_bp_level: 0,
        br_kills_keyboardmouse_m0_playlist_bots_defaultsquad: 0,
        br_lastmodified_keyboardmouse_m0_playlist_bots_defaultduo: 0,
        br_lastmodified_touch_m0_playlist_bots_defaultsolo: 0,
        br_minutesplayed_keyboardmouse_m0_playlist_bots_defaultsquad: 0,
        br_minutesplayed_touch_m0_playlist_bots_nobuildbr_solo: 0,
        br_score_keyboardmouse_m0_playlist_playgroundv2: 0,
        br_matchesplayed_touch_m0_playlist_creative_mms_12_player_no_mms: 0,
        br_matchesplayed_touch_m0_playlist_bots_defaultsolo: 0,
        br_score_touch_m0_playlist_bots_defaultsolo: 0,
        br_playersoutlived_keyboardmouse_m0_playlist_bots_defaultsquad: 0,
        br_minutesplayed_keyboardmouse_m0_playlist_bots_defaultduo: 0,
        br_minutesplayed_touch_m0_playlist_bots_defaultsolo: 0,
        br_lastmodified_keyboardmouse_m0_playlist_bots_defaultsolo: 0,
        br_kills_touch_m0_playlist_bots_defaultsolo: 0,
        br_score_touch_m0_playlist_creative_mms_12_player_no_mms: 0,
        br_score_keyboardmouse_m0_playlist_bots_defaultsquad: 0,
        br_minutesplayed_keyboardmouse_m0_playlist_bots_defaultsolo: 0,
        br_matchesplayed_keyboardmouse_m0_playlist_bots_defaultsolo: 0,
        br_kills_keyboardmouse_m0_playlist_bots_defaultduo: 0,
        br_score_touch_m0_playlist_bots_nobuildbr_solo: 0,
        s20_social_bp_level: 0,
        br_matchesplayed_keyboardmouse_m0_playlist_bots_defaultsquad: 0,
        br_lastmodified_keyboardmouse_m0_playlist_playgroundv2: 0,
        br_score_keyboardmouse_m0_playlist_bots_defaultsolo: 0,
        br_minutesplayed_touch_m0_playlist_creative_mms_12_player_no_mms: 0,
        br_lastmodified_keyboardmouse_m0_playlist_bots_defaultsquad: 0,
        br_matchesplayed_keyboardmouse_m0_playlist_bots_defaultduo: 0,
        s21_social_bp_level: 0,
      },
    };
  });

  app.all(
    "/api/feedback/:type",
    { preHandler: verifyToken },
    async (req, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      res.status(200).send();
    }
  );

  app.all("/api/game/v2/profileToken/verify/:accountId", (req, res) => {
    if (req.method != "POST") {
      const err = error.method(req);
      return res.headers(err.header).status(405).send(err.error);
    }

    res.status(204).send();
  });

  app.get(
    "/api/game/v2/leaderboards/cohort/:accountId",
    { preHandler: verifyToken },
    async (req, res) => {
      const accountId = (req.params as { accountId: string })?.accountId;
      const playlist = (req.query as { playlist: string })?.playlist;
      const friends = await Friends.findOne({ accountId }).lean();

      let cohortAccounts: any = [];

      // add yourself
      cohortAccounts.push(accountId);

      // add friends
      friends?.Accepted.forEach(async ({ accountId }) => {
        cohortAccounts.push(accountId);
      });

      return {
        accountId,
        cohortAccounts,
        playlist,
        expiresAt: "2024-05-01T00:15:00.000Z", // Season 5 Start
      };
    }
  );

  app.all(
    "/api/leaderboards/type/group/stat/:statName/window/:statWindow",
    { preHandler: verifyToken },
    async (req, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      const statName = (req.params as { statName: string })?.statName;
      const statWindow = (req.params as { statWindow: string })?.statWindow;
      const body = req.body as string[];

      const accounts = await Account.find({ accountId: { $in: body } }).lean();
      const athenas = await Athena.find({ accountId: { $in: body } }).lean();

      const accountMap = new Map();
      accounts.forEach((account) => {
        accountMap.set(account.accountId, account);
      });

      const athenaMap = new Map();
      athenas.forEach((athena) => {
        athenaMap.set(athena.accountId, athena);
      });

      const entries = body.map((accountId) => {
        const account = accountMap.get(accountId);
        const athena = athenaMap.get(accountId);
        return {
          accountId: account?.accountId,
          value: athena?.LeaderboardScore,
        };
      });

      return { entries, statName, statWindow };
    }
  );

  app.all(
    "/api/leaderboards/type/global/stat/:statName/window/:statWindow",
    { preHandler: verifyToken },
    async (req, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      const statName = (req.params as { statName: string })?.statName;
      const statWindow = (req.params as { statWindow: string })?.statWindow;

      return { entries: [], statName, statWindow };
    }
  );

  app.get("/api/matchmaking/session/findPlayer/:sessionId", (req, res) => {
    res.status(204).send();
  });

  app.get("/api/game/v2/world/info", (req, res) => {
    return worldInfo.default;
  });

  app.all("/api/matchmaking/session/matchMakingRequest", async (req, res) => {
    const err = error.custom(
      req,
      "matchmaking_disabled",
      null,
      "Sorry but matchmaking in Save The World is not available on Lunar.",
      "fortnite"
    );
    res.headers(err.header).status(400).send(err.error);
  });

  app.get("/api/game/v2/twitch/:accountId", (req, res) => {
    res.status(204).send();
  });

  app.get("/api/version", (req, res) => {
    return {
      app: "fortnite",
      serverDate: new Date().toISOString(),
      overridePropertiesVersion: "unknown",
      cln: "2870186",
      build: "OT6.5",
      moduleName: "Fortnite-Core",
      buildDate: "2016-02-16T00:00:00.000Z",
      version: "OT6.5",
      branch: "OnlineTesting-6.5",
      modules: {},
    };
  });

  app.all(
    "/api/statsv2/query",
    { preHandler: verifyToken },
    async (req, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      const owners = (req.body as { owners: any }).owners;
      let entries: any = [];

      if (Array.isArray(owners)) {
        entries = await Promise.all(
          owners.map(async (accountId: string) => {
            const athena = await Athena.findOne({ accountId }).lean();

            return {
              account: accountId,
              value: athena?.LeaderboardScore, // we dont really have a correct point sys so we use that.
            };
          })
        );
      }

      return {
        entries,
        maxSize: 1000,
      };
    }
  );

  app.all(
    "/api/game/v2/toxicity/account/:accountId/report/:reportedId",
    { preHandler: verifyToken },
    // http://127.0.0.1:8443/fortnite/api/game/v2/toxicity/account/015a1b35e80325ebf80630e239115663/report/f0856ebace061b77da5927887265f0c2
    // data: https://cdn.discordapp.com/attachments/1186049010151198750/1247627136060227704/image.png?ex=6660b6d1&is=665f6551&hm=2233b5e2d851c56b869376b98c59a655ac2ae62e054fe1cb74be8caa160c3f72&

    (req, res) => {
      res.status(204).send();
    }
  );

  app.setNotFoundHandler((req, res) => {
    const err = error.not_found(req);
    res.headers(err.header).status(404).send(err.error);
  });
};

export default fortnite;
