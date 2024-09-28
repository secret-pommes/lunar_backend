import { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import crypto from "crypto";

import Athena from "../../model/athena";
import * as error from "../utils/error";
import * as log from "../utils/log";
import * as utils from "../utils/utils";
import * as profiles from "../../resources/profiles";
import * as CatalogManager from "../utils/catalogManager";
import * as QuestManager from "../utils/questManager";
import * as BattlePass from "../../resources/battlepass";
import * as LevelingManager from "../utils/levelingManager";
import { verifyToken } from "../token/verify";

const mcp: FastifyPluginAsync = async (app) => {
  app.all(
    "/api/game/v2/profile/:accountId/dedicated_server/QueryProfile",
    async (req: FastifyRequest, res: FastifyReply) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      const profileId: string = (req.query as { profileId: string })?.profileId;
      const accountId: string = (req.params as { accountId: string }).accountId;

      if (profileId != "athena") {
        const err = error.custom(
          req,
          "invalid_command",
          12801,
          `QueryProfile is not valid on ${profileId} profile`,
          "fortnite"
        );
        return res.headers(err.header).status(400).send(err.error);
      }

      const [athena, questResponse] = await Promise.all([
        Athena.findOne({ accountId }).lean(),
        QuestManager.sendQuestsToClient(accountId),
      ]);

      const { season } = utils.FNVersion(req);
      const Revision = athena?.ProfileRevision[profileId];
      let CommandRevision = athena?.ProfileCommandRevision;
      let profile: any = profiles.athena;

      (athena?.HasAllAthenaItems as boolean)
        ? (profile = profiles.adminAthena)
        : (profile = profiles.athena);

      if (questResponse !== 0) {
        questResponse.forEach((response: any) => {
          const questId = Object.keys(response)[0];
          const questDetails = response[questId];
          profile.items = {
            ...profile.items,
            [questId]: questDetails,
          };
        });
      }

      if (athena?.AthenaItems.length !== 0) {
        athena?.AthenaItems.forEach((response: any) => {
          const itemId = Object.keys(response)[0];
          const itemDetails = response[itemId];
          profile.items = {
            ...profile.items,
            [itemId]: itemDetails,
          };
        });
      }

      profile.stats.attributes.season_match_boost = athena?.MatchXPBoost;
      profile.stats.attributes.season_friend_match_boost =
        athena?.MatchXPBoostForFriends;
      profile.stats.attributes.book_level = athena?.BookLevel;
      profile.stats.attributes.book_purchased = athena?.BookbPurchased;
      profile.stats.attributes.level = athena?.AccountLevel;
      profile.stats.attributes.season_num = season;
      profile.stats.attributes.favorite_character = athena?.Skin;
      profile.stats.attributes.favorite_backpack = athena?.Backbling;
      profile.stats.attributes.favorite_skydivecontrail = athena?.Contrail;
      profile.stats.attributes.favorite_pickaxe = athena?.Pickaxe;
      profile.stats.attributes.favorite_glider = athena?.Glider;
      profile.stats.attributes.favorite_loadingscreen = athena?.LoadingScreen;
      profile.stats.attributes.favorite_musicpack = athena?.Music;
      profile.stats.attributes.banner_icon = athena?.Banner;
      profile.stats.attributes.banner_color = athena?.BannerColor;
      profile.stats.attributes.favorite_dance = athena?.Emotes;
      profile.stats.attributes.favorite_itemwraps = athena?.ItemWraps;

      profile.created = athena?.created;
      profile.updated = new Date().toISOString();
      profile.rvn = Revision;
      profile.commandRevision = CommandRevision;
      profile.accountId = accountId;

      return {
        profileRevision: Revision,
        profileId,
        profileChangesBaseRevision: Revision,
        profileChanges: [
          {
            changeType: "fullProfileUpdate",
            profile,
          },
        ],
        profileCommandRevision: CommandRevision,
        serverTime: new Date().toISOString(),
        responseVersion: 1,
      };
    }
  );

  app.all(
    "/api/game/v2/profile/:accountId/client/QueryProfile",
    { preHandler: verifyToken },
    async (req: FastifyRequest, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      const profileId: string = (req.query as { profileId: string })?.profileId;
      const accountId: string = (req.params as { accountId: string }).accountId;
      const athena = await Athena.findOne({ accountId }).lean();

      const { season } = utils.FNVersion(req);
      const Revision = athena?.ProfileRevision[profileId];
      let CommandRevision = athena?.ProfileCommandRevision[profileId];
      const QueryRevision = (req.query as { rvn: any })?.rvn;
      let profile: any;

      switch (profileId) {
        case "athena":
          profile = profiles.athena;
        case "common_public":
          profile = profiles.common_public;
        case "common_core":
          profile = profiles.common_core;
        case "campaign":
          profile = profiles.campaign;
        case "collection_book_people0":
          profile = profiles.collection_book_people0;
        case "collection_book_schematics0":
          profile = profiles.collection_book_schematics0;
        case "collections":
          profile = profiles.collections;
        case "creative":
          profile = profiles.creative;
        case "metadata":
          profile = profiles.metadata;
        case "outpost0":
          profile = profiles.outpost0;
        case "profile0":
          profile = profiles.profile0;
        case "theater0":
          profile = profiles.theater0;
      }

      if (profileId == "athena") {
        (athena?.HasAllAthenaItems as boolean)
          ? (profile = profiles.adminAthena)
          : (profile = profiles.athena);

        const [arisa, questResponse] = await Promise.all([
          QuestManager.ApplyQuestToUser(accountId, "Daily"),
          QuestManager.sendQuestsToClient(accountId),
        ]);

        questResponse.forEach((response: any) => {
          const questId = Object.keys(response)[0];
          const questDetails = response[questId];
          profile.items = {
            ...profile.items,
            [questId]: questDetails,
          };
        });

        if (athena?.AthenaItems.length != 0) {
          athena?.AthenaItems.forEach((response: any) => {
            const itemId = Object.keys(response)[0];
            const itemDetails = response[itemId];
            profile.items = {
              ...profile.items,
              [itemId]: itemDetails,
            };
          });
        }

        const PlayerXP = LevelingManager.CalcLVL(athena?.XP as number);

        profile.stats.attributes.season_match_boost = athena?.MatchXPBoost;
        profile.stats.attributes.season_friend_match_boost =
          athena?.MatchXPBoostForFriends;
        profile.stats.attributes.book_xp = athena?.BookXP;
        profile.stats.attributes.book_level = athena?.BookLevel;
        profile.stats.attributes.book_purchased = athena?.BookbPurchased;
        profile.stats.attributes.season_num = season;
        profile.stats.attributes.favorite_character = athena?.Skin;
        profile.stats.attributes.favorite_backpack = athena?.Backbling;
        profile.stats.attributes.favorite_skydivecontrail = athena?.Contrail;
        profile.stats.attributes.favorite_pickaxe = athena?.Pickaxe;
        profile.stats.attributes.favorite_glider = athena?.Glider;
        profile.stats.attributes.favorite_loadingscreen = athena?.LoadingScreen;
        profile.stats.attributes.favorite_musicpack = athena?.Music;
        profile.stats.attributes.banner_icon = athena?.Banner;
        profile.stats.attributes.banner_color = athena?.BannerColor;
        profile.stats.attributes.favorite_dance = athena?.Emotes;
        profile.stats.attributes.favorite_itemwraps = athena?.ItemWraps;
        profile.stats.attributes.xp = PlayerXP.CurrentLevelXP;
        profile.stats.attributes.level = PlayerXP.CurrentLevel;
      } else if (profileId == "common_public") {
        profile.stats.attributes.banner_color = athena?.BannerColor;
        profile.stats.attributes.banner_icon = athena?.Banner;
      } else if (profileId == "common_core") {
        const platformMap: { [key: string]: string } = {
          android: "EpicAndroid",
          ios: "IOSAppStore",
          windows: "EpicPC",
          switch: "nintendo",
          playstation: "PSN",
        };

        const platform = platformMap[utils.ClientPlatform(req)] || "shared";

        profile.stats.attributes.current_mtx_platform = platform;
        profile.stats.attributes.mtx_affiliate =
          athena?.CurrentSupportACreatorCode;

        profile.items.Currency = {
          templateId: "Currency:MtxPurchased",
          attributes: { platform: platform },
          quantity: athena?.Currency,
        };
      }

      profile.created = athena?.created;
      profile.updated = new Date().toISOString();
      profile.rvn = Revision;
      profile.commandRevision = Revision;
      profile.accountId = accountId;

      return {
        profileRevision: Revision,
        profileId,
        profileChangesBaseRevision: Revision,
        profileChanges: [
          {
            changeType:
              QueryRevision !== Revision ? "fullProfileUpdate" : "statModified",
            profile,
          },
        ],
        profileCommandRevision: CommandRevision,
        serverTime: new Date().toISOString(),
        responseVersion: 1,
      };
    }
  );

  app.all(
    "/api/game/v2/profile/:accountId/public/QueryPublicProfile",
    { preHandler: verifyToken },
    async (req: FastifyRequest, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      const profileId: string = (req.query as { profileId: string })?.profileId;
      const accountId: string = (req.params as { accountId: string }).accountId;

      const athena = await Athena.findOne({ accountId }).lean();
      const { season } = utils.FNVersion(req);
      const ProfileRevision = athena?.ProfileRevision[profileId];
      const CommandRevision = athena?.ProfileCommandRevision[profileId];
      const QueryRevision = (req.query as { rvn: any })?.rvn;

      let profile = (profiles as any)[profileId];

      if (profileId == "athena") {
        profile = profiles.adminAthena;

        profile.stats.attributes.season_match_boost = athena?.MatchXPBoost;
        profile.stats.attributes.season_friend_match_boost =
          athena?.MatchXPBoostForFriends;
        profile.stats.attributes.book_level = athena?.BookLevel;
        profile.stats.attributes.book_purchased = athena?.BookbPurchased;
        profile.stats.attributes.level = athena?.AccountLevel;
        profile.stats.attributes.season_num = season;
        profile.stats.attributes.favorite_character = athena?.Skin;
        profile.stats.attributes.favorite_backpack = athena?.Backbling;
        profile.stats.attributes.favorite_skydivecontrail = athena?.Contrail;
        profile.stats.attributes.favorite_pickaxe = athena?.Pickaxe;
        profile.stats.attributes.favorite_glider = athena?.Glider;
        profile.stats.attributes.favorite_loadingscreen = athena?.LoadingScreen;
        profile.stats.attributes.favorite_musicpack = athena?.Music;
        profile.stats.attributes.banner_icon = athena?.Banner;
        profile.stats.attributes.banner_color = athena?.BannerColor;
        profile.stats.attributes.favorite_dance = athena?.Emotes;
        profile.stats.attributes.favorite_itemwraps = athena?.ItemWraps;
      } else if (profileId == "common_public") {
        profile.stats.attributes.banner_color = athena?.BannerColor;
        profile.stats.attributes.banner_icon = athena?.Banner;
      }

      profile.created = athena?.created;
      profile.updated = new Date().toISOString();
      profile.rvn = ProfileRevision;
      profile.commandRevision = CommandRevision;
      profile.accountId = accountId;

      return {
        profileRevision: ProfileRevision,
        profileId,
        profileChangesBaseRevision: ProfileRevision,
        profileChanges: [
          {
            changeType:
              QueryRevision != ProfileRevision
                ? "fullProfileUpdate"
                : "statModified",
            profile,
          },
        ],
        profileCommandRevision: CommandRevision,
        serverTime: new Date().toISOString(),
        responseVersion: 1,
      };
    }
  );

  app.all(
    "/api/game/v2/profile/:accountId/client/EquipBattleRoyaleCustomization",
    { preHandler: verifyToken },
    async (req: FastifyRequest, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      const profileId: string = (req.query as { profileId: string })?.profileId;
      const accountId: string = (req.params as { accountId: string }).accountId;

      if (profileId != "athena") {
        const err = error.custom(
          req,
          "invalid_command",
          12801,
          `EquipBattleRoyaleCustomization is not valid on ${profileId}`,
          "fortnite"
        );
        return res.headers(err.header).status(400).send(err.error);
      }

      const athena = await Athena.findOne({ accountId }).lean();
      const QueryRevision = (req.query as { rvn: any })?.rvn;
      const ProfileRevision = athena?.ProfileRevision.athena;
      const CommandRevision = athena?.ProfileCommandRevision.athena;

      const slotName = (req.body as { slotName: string })?.slotName;
      const variantUpdates = (req.body as { variantUpdates: any })
        ?.variantUpdates;
      const indexWithinSlot = (req.body as { indexWithinSlot: number })
        ?.indexWithinSlot;

      let itemToSlot = (req.body as { itemToSlot: any })?.itemToSlot;

      let variantsChanged: boolean = false;
      let active: string = "";
      let channel: string = "";

      switch (slotName) {
        case "Character": {
          await Athena.updateOne({ accountId }, { $set: { Skin: itemToSlot } });

          if (variantUpdates[0]) {
            variantsChanged = true;
            active = variantUpdates[0].active;
            channel = variantUpdates[0].channel;
          }

          break;
        }
        case "Backpack": {
          await Athena.updateOne(
            { accountId },
            { $set: { Backbling: itemToSlot } }
          );
          break;
        }
        case "Pickaxe": {
          await Athena.updateOne(
            { accountId },
            { $set: { Pickaxe: itemToSlot } }
          );
          break;
        }
        case "Glider": {
          await Athena.updateOne(
            { accountId },
            { $set: { Glider: itemToSlot } }
          );
          break;
        }
        case "Dance": {
          await Athena.updateOne(
            { accountId },
            { $set: { [`Emotes.${indexWithinSlot}`]: itemToSlot } }
          );

          // reload profile
          const updatedAthena = await Athena.findOne({ accountId }).lean();
          itemToSlot = updatedAthena?.Emotes;

          break;
        }
        case "ItemWrap": {
          // Apply to all
          if (indexWithinSlot == -1) {
            await Athena.updateOne(
              { accountId },
              {
                $set: {
                  "ItemWraps.0": itemToSlot,
                  "ItemWraps.1": itemToSlot,
                  "ItemWraps.2": itemToSlot,
                  "ItemWraps.3": itemToSlot,
                  "ItemWraps.4": itemToSlot,
                  "ItemWraps.5": itemToSlot,
                  "ItemWraps.6": itemToSlot,
                },
              }
            );
          } else {
            await Athena.updateOne(
              { accountId },
              { $set: { [`ItemWraps.${indexWithinSlot}`]: itemToSlot } }
            );
          }

          const updatedAthena = await Athena.findOne({ accountId }).lean();
          itemToSlot = updatedAthena?.ItemWraps;

          break;
        }
        case "MusicPack": {
          await Athena.updateOne(
            { accountId },
            { $set: { Music: itemToSlot } }
          );
          break;
        }
        case "SkyDiveContrail": {
          await Athena.updateOne(
            { accountId },
            { $set: { Contrail: itemToSlot } }
          );
          break;
        }
        case "LoadingScreen": {
          await Athena.updateOne(
            { accountId },
            { $set: { LoadingScreen: itemToSlot } }
          );
          break;
        }

        default: {
          const err = error.custom(
            req,
            "invalid_commanad",
            null,
            "While setting the slotname to database the server failed to get you selected item.",
            "fortnite"
          );
          return res.headers(err.header).status(400).send(err.error);
        }
      }

      await Athena.updateOne(
        {
          accountId,
        },
        {
          $set: {
            ["ProfileRevision.athena"]: ProfileRevision + 1,
            ["ProfileCommandRevision.athena"]: CommandRevision + 1,
          },
        }
      );

      return {
        profileChanges: [
          {
            changeType:
              QueryRevision != ProfileRevision
                ? "fullProfileUpdate"
                : "statModified",
            name:
              slotName == "ItemWrap"
                ? "favorite_itemwraps"
                : `favorite_${slotName.toLowerCase()}`,
            value: itemToSlot,
          },
          variantsChanged
            ? {
                // may not work on other then character.
                changeType: "itemAttrChanged",
                itemId: itemToSlot,
                attributeName: "variants",
                attributeValue: [
                  {
                    channel,
                    active,
                    owned: [
                      // idfk if works on v4.5+
                      "Stage0",
                      "Stage1",
                      "Stage2",
                      "Stage3",
                      "Stage4",
                      "Stage5",
                    ],
                  },
                  {
                    // idfk if works on v4.5+
                    channel: "Emissive",
                    active: "Emissive0",
                    owned: ["Emissive0", "Emissive1", "Emissive2", "Emissive3"],
                  },
                ],
              }
            : null,
        ].filter(Boolean), // fix fn crash lmfao
        profileChangesBaseRevision: ProfileRevision,
        profileCommandRevision: CommandRevision + 1,
        profileId,
        profileRevision: ProfileRevision + 1,
        responseVersion: 1,
        serverTime: new Date().toISOString(),
      };
    }
  );

  app.all(
    "/api/game/v2/profile/:accountId/client/VerifyRealMoneyPurchase",
    { preHandler: verifyToken },
    async (req: FastifyRequest, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      const profileId: string = (req.query as { profileId: string })?.profileId;
      const accountId: string = (req.params as { accountId: string }).accountId;

      const athena = await Athena.findOne({ accountId }).lean();
      const QueryRevision = Number((req.query as { rvn: string }).rvn);
      const ProfileRevision: number = athena?.ProfileRevision[profileId];
      const CommandRevision = athena?.ProfileCommandRevision[profileId];

      if (profileId != "common_core") {
        const err = error.custom(
          req,
          "invalid_command",
          12801,
          `VerifyRealMoneyPurchase is not valid on ${profileId}`,
          "fortnite"
        );
        return res.headers(err.header).status(400).send(err.error);
      }

      return {
        profileRevision: ProfileRevision,
        profileId,
        profileChangesBaseRevision: ProfileRevision,
        profileChanges: [],
        profileCommandRevision: CommandRevision,
        serverTime: new Date().toISOString(),
        responseVersion: 1,
      };
    }
  );

  app.all(
    "/api/game/v2/profile/:accountId/client/ClientQuestLogin",
    { preHandler: verifyToken },
    async (req: FastifyRequest, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      const profileId: string = (req.query as { profileId: string })?.profileId;
      const accountId: string = (req.params as { accountId: string }).accountId;

      const [athena, profileChanges] = await Promise.all([
        Athena.findOne({ accountId }).lean(),
        QuestManager.sendQuestsToClient(accountId),
      ]);

      const QueryRevision = Number((req.query as { rvn: string }).rvn);
      const ProfileRevision: number = athena?.ProfileRevision[profileId];
      const CommandRevision = athena?.ProfileCommandRevision[profileId];

      if (
        profileId != "common_core" &&
        profileId != "campaign" &&
        profileId != "athena"
      ) {
        const err = error.custom(
          req,
          "invalid_command",
          12801,
          `ClientQuestLogin is not valid on ${profileId}`,
          "fortnite"
        );
        return res.headers(err.header).status(400).send(err.error);
      }

      await Promise.all([
        Athena.updateOne(
          {
            accountId,
          },
          {
            $set: {
              ["ProfileRevision.athena"]: ProfileRevision + 1,
              ["ProfileCommandRevision.athena"]: CommandRevision + 1,
            },
          }
        ),
        QuestManager.ApplyQuestToUser(accountId, "Daily"),
      ]);

      return {
        profileRevision: ProfileRevision + 1,
        profileId,
        profileChangesBaseRevision: ProfileRevision,
        profileChanges,
        profileCommandRevision: CommandRevision + 1,
        serverTime: new Date().toISOString(),
        responseVersion: 1,
      };
    }
  );

  app.all(
    "/api/game/v2/profile/:accountId/client/ClaimMfaEnabled",
    { preHandler: verifyToken },
    async (req: FastifyRequest, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      const profileId: string = (req.query as { profileId: string })?.profileId;
      const accountId: string = (req.params as { accountId: string }).accountId;

      const athena = await Athena.findOne({ accountId }).lean();
      const QueryRevision = Number((req.query as { rvn: string }).rvn);
      const ProfileRevision: number = athena?.ProfileRevision[profileId];
      const CommandRevision = athena?.ProfileCommandRevision[profileId];
      if (profileId != "common_core") {
        const err = error.custom(
          req,
          "invalid_command",
          12801,
          `ClaimMfaEnabled is not valid on ${profileId}`,
          "fortnite"
        );
        return res.headers(err.header).status(400).send(err.error);
      }

      await Athena.updateOne(
        {
          accountId,
        },
        {
          $set: {
            ["ProfileRevision.common_core"]: ProfileRevision + 1,
            ["ProfileCommandRevision.common_core"]: CommandRevision + 1,
          },
        }
      );

      return {
        profileRevision: ProfileRevision + 1,
        profileId,
        profileChangesBaseRevision: ProfileRevision,
        profileChanges: [],
        profileCommandRevision: CommandRevision + 1,
        serverTime: new Date().toISOString(),
        responseVersion: 1,
      };
    }
  );

  app.all(
    "/api/game/v2/profile/:accountId/client/SetItemFavoriteStatusBatch",
    { preHandler: verifyToken },
    async (req: FastifyRequest, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      const profileId: string = (req.query as { profileId: string })?.profileId;
      const accountId: string = (req.params as { accountId: string }).accountId;

      const athena = await Athena.findOne({ accountId }).lean();
      const QueryRevision = Number((req.query as { rvn: string }).rvn);
      const ProfileRevision: number = athena?.ProfileRevision[profileId];
      const CommandRevision = athena?.ProfileCommandRevision[profileId];

      if (profileId != "athena") {
        const err = error.custom(
          req,
          "invalid_command",
          12801,
          `SetItemFavoriteStatusBatch is not valid on ${profileId}`,
          "fortnite"
        );
        return res.headers(err.header).status(400).send(err.error);
      }

      const [arisa, profileChanges] = await Promise.all([
        Athena.updateOne(
          {
            accountId,
          },
          {
            $set: {
              ["ProfileRevision.athena"]: ProfileRevision + 1,
              ["ProfileCommandRevision.athena"]: CommandRevision + 1,
            },
          }
        ),
        QuestManager.sendQuestsToClient(accountId),
      ]);

      return {
        profileRevision: ProfileRevision + 1,
        profileId,
        profileChangesBaseRevision: ProfileRevision,
        profileChanges: profileChanges || [],
        profileCommandRevision: CommandRevision + 1,
        serverTime: new Date().toISOString(),
        responseVersion: 1,
      };
    }
  );

  app.all(
    "/api/game/v2/profile/:accountId/client/SetMtxPlatform",
    { preHandler: verifyToken },
    async (req: FastifyRequest, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      const profileId: string = (req.query as { profileId: string })?.profileId;
      const accountId: string = (req.params as { accountId: string }).accountId;

      const athena = await Athena.findOne({ accountId }).lean();
      const QueryRevision = Number((req.query as { rvn: string }).rvn);
      const ProfileRevision: number = athena?.ProfileRevision[profileId];
      const CommandRevision = athena?.ProfileCommandRevision[profileId];

      if (profileId != "common_core") {
        const err = error.custom(
          req,
          "invalid_command",
          12801,
          `SetMtxPlatform is not valid on ${profileId}`,
          "fortnite"
        );
        return res.headers(err.header).status(400).send(err.error);
      }

      let profile: any = profiles.common_core;

      const platformMap: { [key: string]: string } = {
        android: "EpicAndroid",
        ios: "IOSAppStore",
        windows: "EpicPC",
        switch: "Nintendo",
        playstation: "PSN",
      };

      const platform = platformMap[utils.ClientPlatform(req)] || "shared";

      profile.created = athena?.created;
      profile.updated = new Date().toISOString();
      profile.rvn = ProfileRevision;
      profile.commandRevision = CommandRevision;
      profile.accountId = accountId;
      profile.stats.attributes.current_mtx_platform = platform;

      await Athena.updateOne(
        { accountId },
        {
          $set: {
            ["ProfileRevision.common_core"]: ProfileRevision + 1,
            ["ProfileCommandRevision.common_core"]: CommandRevision + 1,
          },
        }
      );

      return {
        profileRevision: ProfileRevision + 1,
        profileId,
        profileChangesBaseRevision: ProfileRevision,
        profileChanges: [
          {
            changeType: "statModified",
            name: "setmtxplatform",
            value: platform,
          },
        ],
        profileCommandRevision: CommandRevision + 1,
        serverTime: new Date().toISOString(),
        responseVersion: 1,
      };
    }
  );

  app.all(
    "/api/game/v2/profile/:accountId/client/SetReceiveGiftsEnabled",
    { preHandler: verifyToken },
    async (req: FastifyRequest, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      const profileId: string = (req.query as { profileId: string })?.profileId;
      const accountId: string = (req.params as { accountId: string }).accountId;

      const athena = await Athena.findOne({ accountId }).lean();
      const QueryRevision = Number((req.query as { rvn: string }).rvn);
      const ProfileRevision: number = athena?.ProfileRevision[profileId];
      const CommandRevision = athena?.ProfileCommandRevision[profileId];
      if (profileId != "common_core") {
        const err = error.custom(
          req,
          "invalid_command",
          12801,
          `SetReceiveGiftsEnabled is not valid on ${profileId}`,
          "fortnite"
        );
        return res.headers(err.header).status(400).send(err.error);
      }

      await Athena.updateOne(
        {
          accountId,
        },
        {
          $set: {
            ["ProfileRevision.common_core"]: ProfileRevision + 1,
            ["ProfileCommandRevision.common_core"]: CommandRevision + 1,
          },
        }
      );

      return {
        profileRevision: ProfileRevision + 1,
        profileId,
        profileChangesBaseRevision: ProfileRevision,
        profileChanges: [],
        profileCommandRevision: CommandRevision + 1,
        serverTime: new Date().toISOString(),
        responseVersion: 1,
      };
    }
  );

  app.all(
    "/api/game/v2/profile/:accountId/client/MarkItemSeen",
    { preHandler: verifyToken },
    async (req: FastifyRequest, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      const profileId: string = (req.query as { profileId: string }).profileId;
      const accountId: string = (req.params as { accountId: string }).accountId;
      const itemIds: string[] = (req.body as { itemIds: string[] }).itemIds;

      const athena = await Athena.findOne({ accountId }).lean();
      const QueryRevision = Number((req.query as { rvn: string }).rvn);
      const ProfileRevision: number = athena?.ProfileRevision[profileId];
      const CommandRevision = athena?.ProfileCommandRevision[profileId];
      let profileChanges: string[] = [];

      if (profileId != "athena") {
        const err = error.custom(
          req,
          "invalid_command",
          12801,
          `MarkItemSeen is not valid on ${profileId}`,
          "fortnite"
        );
        return res.headers(err.header).status(400).send(err.error);
      }

      await Athena.updateOne(
        {
          accountId,
        },
        {
          $set: {
            ["ProfileRevision.athena"]: ProfileRevision + 1,
            ["ProfileCommandRevision.athena"]: CommandRevision + 1,
          },
        }
      );

      itemIds.forEach((itemId: string) => {
        profileChanges.push({
          changeType: "itemAttrChanged",
          itemId,
          attributeName: "item_seen",
          attributeValue: true,
        } as any);
      });

      return {
        profileRevision: ProfileRevision + 1,
        profileId,
        profileChanges,
        profileChangesBaseRevision: ProfileRevision,
        profileCommandRevision: CommandRevision + 1,
        serverTime: new Date().toISOString(),
        responseVersion: 1,
      };
    }
  );

  app.all(
    "/api/game/v2/profile/:accountId/client/PurchaseCatalogEntry",
    { preHandler: verifyToken },
    async (req: FastifyRequest, res) => {
      if (req.method !== "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      const profileId: string = (req.query as { profileId: string })?.profileId;
      const accountId: string = (req.params as { accountId: string })
        ?.accountId;

      if (profileId != "common_core") {
        const err = error.custom(
          req,
          "invalid_command",
          12801,
          `PurchaseCatalogEntry is not valid on ${profileId}`,
          "fortnite"
        );
        return res.headers(err.header).status(400).send(err.error);
      }

      const athena = await Athena.findOne({ accountId }).lean();
      /*const { season } = utils.FNVersion(req);*/

      const common_core = athena?.ProfileRevision.common_core;
      const common_core_command = athena?.ProfileCommandRevision.common_core;
      const athena_rvn = athena?.ProfileRevision.athena;
      const athena_command = athena?.ProfileCommandRevision.athena;

      const offerId = (req.body as { offerId: string })?.offerId;
      /*const purchaseQuantity = (req.body as { purchaseQuantity: number })
        ?.purchaseQuantity;*/
      const price = (req.body as { expectedTotalPrice: number })
        ?.expectedTotalPrice;

      /*let CurrentLvl: number = Number(athena?.BookLevel);*/
      let CurrentCurrency: number = Number(athena?.Currency);
      let profileChanges: any[] = [];
      let MultiUpdate: any[] = [];
      let Notifications: any[] = [];
      /*let MatchXPBoost: number = Number(athena?.MatchXPBoost);
      let MatchXPBoostForFriends: number = Number(
        athena?.MatchXPBoostForFriends
      );*/
      let UpdatedAthenaItems: any[] = athena?.AthenaItems as any[];

      switch (offerId) {
        /*case "BattlePass.Season5": {
          if (price > CurrentCurrency) {
            const err = error.not_enough_currency(req, price, CurrentCurrency);
            return res.headers(err.header).status(400).send(err.error);
          }

          if (athena?.BookbPurchased) {
            const err = error.already_purchased(req);
            return res.headers(err.header).status(400).send(err.error);
          }

          if (season !== 5) {
            const err = error.custom(
              req,
              "invalid_purchase",
              null,
              `You cannot buy the Season 5 battle pass inside of season ${season}.`,
              "fortnite"
            );
            return res.headers(err.header).status(400).send(err.error);
          }

          MultiUpdate.push({
            profileChanges: [
              {
                change_type: "statModified",
                name: "book_level",
                value: 1,
              },
              {
                change_type: "statModified",
                name: "book_purchased",
                value: true,
              },
            ],
            profileChangesBaseRevision: athena_rvn,
            profileCommandRevision: athena_command,
            profileRevision: athena_rvn + 1,
            profileId: "athena",
          } as any);

          let loot: any[] = [];

          for (let i = 0; i < CurrentLvl; i++) {
            const target: any = BattlePass.BattlePassData.paid[i];
            const key: string = Object.keys(target)[0];
            const data: any = target[key];

            data.forEach((obj: any) => {
              const templateId: string = obj.templateId.toLowerCase();
              const quantity: number = obj.quantity;

              // Vbucks
              if (templateId.includes("currency")) {
                CurrentCurrency += quantity;
              } else if (templateId.includes("athenaseasonxpboost")) {
                MatchXPBoost += quantity; // hope this works out

                MultiUpdate[0].profileChanges.push({
                  changeType: "statModified",
                  name: "season_match_boost",
                  value: MatchXPBoost,
                });
              } else if (templateId.includes("athenaseasonfriendxpboost")) {
                MatchXPBoostForFriends += quantity;

                MultiUpdate[0].profileChanges.push({
                  changeType: "statModified",
                  name: "season_friend_match_boost",
                  value: MatchXPBoostForFriends,
                });
              }

              if (templateId.startsWith("athena")) {
                // SKINS
                MultiUpdate[0].profileChanges.push({
                  changeType: "itemAttrChanged",
                  itemId: templateId,
                  attributeName: "item_seen",
                  attributeValue: false, // should be correct ig
                });

                UpdatedAthenaItems.push({
                  [templateId]: {
                    templateId,
                    attributes: {
                      max_level_bonus: 0,
                      level: 1,
                      item_seen: true,
                      xp: 0,
                      variants: [],
                      favorite: false,
                    },
                    quantity: 1,
                  },
                } as any);
              }

              loot.push({
                itemType: templateId,
                itemGuid: templateId,
                quantity: 1,
              });
            });

            profileChanges.push({
              changeType: "itemAdded",
              itemId: crypto.randomUUID().replace(/-/gi, ""),
              item: {
                templateId:
                  season <= 4
                    ? "GiftBox:gb_battlepass"
                    : "GiftBox:gb_battlepasspurchased",
                attributes: {
                  max_level_bonus: 0,
                  fromAccountId: "",
                  lootList: loot,
                },
              },
            } as any);
          }

          await Athena.updateOne(
            { accountId },
            {
              $set: {
                BookbPurchased: true,
                MatchXPBoost,
                MatchXPBoostForFriends,
              },
            }
          );
        }*/

        default: {
          if (
            CatalogManager.itemIsInStorefront(offerId) &&
            Number(CurrentCurrency) >= price &&
            !JSON.stringify(UpdatedAthenaItems).includes(offerId)
          ) {
            CurrentCurrency -= price;
            const newId = crypto.randomUUID();

            profileChanges.push({
              changeType: "itemQuantityChanged",
              itemId: "Currency",
              quantity: CurrentCurrency,
            } as any);

            Notifications.push({
              type: "CatalogPurchase",
              primary: true,
              lootResult: {
                items: [
                  {
                    itemType: offerId,
                    itemGuid: newId,
                    itemProfile: "athena",
                    quantity: 1,
                  },
                ],
              },
            } as any);

            MultiUpdate.push({
              profileId: "athena",
              profileChanges: [
                {
                  changeType: "itemAdded",
                  itemId: newId,
                  item: {
                    templateId: offerId,
                    attributes: {
                      item_seen: false,
                      variants: [],
                    },
                    quantity: 1,
                  },
                },
              ],
              profileChangesBaseRevision: athena_rvn,
              profileRevision: athena_rvn + 1,
              profileCommandRevision: athena_command,
            } as any);

            await Athena.updateOne(
              {
                accountId,
              },
              {
                $set: {
                  Currency: CurrentCurrency,
                  ["ProfileRevision.athena"]: athena_rvn + 1,
                  ["ProfileCommandRevision.athena"]: athena_command + 1,
                  ["ProfileRevision.common_core"]: common_core + 1,
                  ["ProfileCommandRevision.common_core"]:
                    common_core_command + 1,
                },
                $push: {
                  AthenaItems: {
                    [offerId]: {
                      templateId: offerId,
                      attributes: {
                        max_level_bonus: 0,
                        level: 1,
                        item_seen: true,
                        xp: 0,
                        variants: [],
                        favorite: false,
                      },
                      quantity: 1,
                    },
                  },
                },
              }
            );
          } else {
            let err = error.not_enough_currency(req, price, CurrentCurrency);
            /*Number(CurrentCurrency >= price)
              ? (err = error.not_enough_currency(req, price, CurrentCurrency))
              : (err = error.already_purchased(req));*/
            return res.headers(err.header).status(400).send(err.error);
          }
        }
      }

      return {
        profileId,
        profileChanges,
        notifications: Notifications,
        serverTime: new Date().toISOString(),
        multiUpdate: MultiUpdate,
        responseVersion: 1,
        profileRevision: common_core + 1,
        profileChangesBaseRevision: common_core_command,
        profileCommandRevision: common_core_command,
      };
    }
  );

  app.all(
    "/api/game/v2/profile/:accountId/client/RefundMtxPurchase",
    { preHandler: verifyToken },
    async (req: FastifyRequest, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      const profileId: string = (req.query as { profileId: string })?.profileId;
      const accountId: string = (req.params as { accountId: string }).accountId;

      const athena = await Athena.findOne({ accountId }).lean();
      const QueryRevision = Number((req.query as { rvn: string }).rvn);
      const ProfileRevision: number = athena?.ProfileRevision[profileId];
      const CommandRevision = athena?.ProfileCommandRevision[profileId];
      if (profileId != "common_core") {
        const err = error.custom(
          req,
          "invalid_command",
          12801,
          `RefundMtxPurchase is not valid on ${profileId}`,
          "fortnite"
        );
        return res.headers(err.header).status(400).send(err.error);
      }

      await Athena.updateOne(
        {
          accountId,
        },
        {
          $set: {
            ["ProfileRevision.common_core"]: ProfileRevision + 1,
            ["ProfileCommandRevision.common_core"]: CommandRevision + 1,
          },
        }
      );

      return {
        profileRevision: ProfileRevision + 1,
        profileId,
        profileChangesBaseRevision: ProfileRevision,
        profileChanges: [],
        profileCommandRevision: CommandRevision + 1,
        serverTime: new Date().toISOString(),
        responseVersion: 1,
      };
    }
  );

  app.all(
    "/api/game/v2/profile/:accountId/client/RemoveGiftBox",
    { preHandler: verifyToken },
    async (req: FastifyRequest, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      const profileId: string = (req.query as { profileId: string })?.profileId;
      const accountId: string = (req.params as { accountId: string }).accountId;

      const athena = await Athena.findOne({ accountId }).lean();
      const QueryRevision = Number((req.query as { rvn: string }).rvn);
      const ProfileRevision: number = athena?.ProfileRevision[profileId];
      const CommandRevision = athena?.ProfileCommandRevision[profileId];
      const itemId = (req.body as { giftBoxItemId: string })?.giftBoxItemId;

      if (profileId != "common_core") {
        const err = error.custom(
          req,
          "invalid_command",
          12801,
          `RemoveGiftBox is not valid on ${profileId}`,
          "fortnite"
        );
        return res.headers(err.header).status(400).send(err.error);
      }

      await Athena.updateOne(
        {
          accountId,
        },
        {
          $isetnc: {
            ["ProfileRevision.common_core"]: ProfileRevision + 1,
            ["ProfileCommandRevision.common_core"]: CommandRevision + 1,
          },
        }
      );

      return {
        profileRevision: ProfileRevision + 1,
        profileId,
        profileChangesBaseRevision: ProfileRevision,
        profileChanges: [
          {
            changeType: "ItemRemoved",
            itemId,
          },
        ],
        profileCommandRevision: CommandRevision + 1,
        serverTime: new Date().toISOString(),
        responseVersion: 1,
      };
    }
  );

  app.all(
    "/api/game/v2/profile/:accountId/client/SetAffiliateName",
    { preHandler: verifyToken },
    async (req: FastifyRequest, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      const profileId: string = (req.query as { profileId: string })?.profileId;
      const accountId: string = (req.params as { accountId: string }).accountId;

      const athena = await Athena.findOne({ accountId }).lean();
      const QueryRevision = Number((req.query as { rvn: string }).rvn);
      const ProfileRevision: number = athena?.ProfileRevision[profileId];
      const CommandRevision = athena?.ProfileCommandRevision[profileId];
      const AffiliateName = (req.body as { affiliateName: string })
        ?.affiliateName;

      if (profileId != "common_core") {
        const err = error.custom(
          req,
          "invalid_command",
          12801,
          `SetAffiliateName is not valid on ${profileId}`,
          "fortnite"
        );
        return res.headers(err.header).status(400).send(err.error);
      }

      await Athena.updateOne(
        {
          accountId,
        },
        {
          $set: {
            CurrentSupportACreatorCode: AffiliateName,
            ["ProfileRevision.common_core"]: ProfileRevision + 1,
            ["ProfileCommandRevision.common_core"]: CommandRevision + 1,
          },
        }
      );

      return {
        profileRevision: ProfileRevision + 1,
        profileId,
        profileChangesBaseRevision: ProfileRevision,
        profileChanges: [
          {
            changeType: "statModified",
            name: "mtx_affiliate",
            value: AffiliateName,
          },
        ],
        profileCommandRevision: CommandRevision + 1,
        serverTime: new Date().toISOString(),
        responseVersion: 1,
      };
    }
  );

  app.all(
    "/api/game/v2/profile/:accountId/client/RefreshExpeditions",
    { preHandler: verifyToken },
    async (req: FastifyRequest, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      const profileId: string = (req.query as { profileId: string })?.profileId;
      const accountId: string = (req.params as { accountId: string }).accountId;

      const athena = await Athena.findOne({ accountId }).lean();
      const QueryRevision = Number((req.query as { rvn: string }).rvn);
      const ProfileRevision: number = athena?.ProfileRevision[profileId];
      const CommandRevision = athena?.ProfileCommandRevision[profileId];
      if (profileId != "campaign") {
        const err = error.custom(
          req,
          "invalid_command",
          12801,
          `RefreshExpeditions is not valid on ${profileId}`,
          "fortnite"
        );
        return res.headers(err.header).status(400).send(err.error);
      }

      await Athena.updateOne(
        {
          accountId,
        },
        {
          $set: {
            ["ProfileRevision.campaign"]: ProfileRevision + 1,
            ["ProfileCommandRevision.campaign"]: CommandRevision + 1,
          },
        }
      );

      return {
        profileRevision: ProfileRevision + 1,
        profileId,
        profileChangesBaseRevision: ProfileRevision,
        profileChanges: [],
        profileCommandRevision: CommandRevision + 1,
        serverTime: new Date().toISOString(),
        responseVersion: 1,
      };
    }
  );

  app.all(
    "/api/game/v2/profile/:accountId/client/IncrementNamedCounterStat",
    { preHandler: verifyToken },
    async (req: FastifyRequest, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      const profileId: string = (req.query as { profileId: string })?.profileId;
      const accountId: string = (req.params as { accountId: string }).accountId;

      const athena = await Athena.findOne({ accountId }).lean();
      const QueryRevision = Number((req.query as { rvn: string }).rvn);
      const ProfileRevision: number = athena?.ProfileRevision[profileId];
      const CommandRevision = athena?.ProfileCommandRevision[profileId];
      if (profileId != "profile0") {
        const err = error.custom(
          req,
          "invalid_command",
          12801,
          `RefreshExpeditions is not valid on ${profileId}`,
          "fortnite"
        );
        return res.headers(err.header).status(400).send(err.error);
      }

      await Athena.updateOne(
        {
          accountId,
        },
        {
          $set: {
            ["ProfileRevision.profile0"]: ProfileRevision + 1,
            ["ProfileCommandRevision.profile0"]: CommandRevision + 1,
          },
        }
      );

      return {
        profileRevision: ProfileRevision + 1,
        profileId,
        profileChangesBaseRevision: ProfileRevision,
        profileChanges: [],
        profileCommandRevision: CommandRevision + 1,
        serverTime: new Date().toISOString(),
        responseVersion: 1,
      };
    }
  );

  app.all(
    "/api/game/v2/profile/:accountId/client/GetMcpTimeForLogin",
    { preHandler: verifyToken },
    async (req: FastifyRequest, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      const profileId: string = (req.query as { profileId: string })?.profileId;
      const accountId: string = (req.params as { accountId: string }).accountId;

      const athena = await Athena.findOne({ accountId }).lean();
      const QueryRevision = Number((req.query as { rvn: string }).rvn);
      const ProfileRevision: number = athena?.ProfileRevision[profileId];
      const CommandRevision = athena?.ProfileCommandRevision[profileId];
      if (profileId != "profile0") {
        const err = error.custom(
          req,
          "invalid_command",
          12801,
          `RefreshExpeditions is not valid on ${profileId}`,
          "fortnite"
        );
        return res.headers(err.header).status(400).send(err.error);
      }

      await Athena.updateOne(
        {
          accountId,
        },
        {
          $set: {
            ["ProfileRevision.profile0"]: ProfileRevision + 1,
            ["ProfileCommandRevision.profile0"]: CommandRevision + 1,
          },
        }
      );

      return {
        profileRevision: ProfileRevision + 1,
        profileId,
        profileChangesBaseRevision: ProfileRevision,
        profileChanges: [],
        profileCommandRevision: CommandRevision + 1,
        serverTime: new Date().toISOString(),
        responseVersion: 1,
      };
    }
  );

  app.all(
    "/api/game/v2/profile/:accountId/client/MarkNewQuestNotificationSent",
    { preHandler: verifyToken },
    async (req: FastifyRequest, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      const profileId: string = (req.query as { profileId: string })?.profileId;
      const accountId: string = (req.params as { accountId: string }).accountId;

      const athena = await Athena.findOne({ accountId }).lean();
      const QueryRevision = Number((req.query as { rvn: string }).rvn);
      const ProfileRevision: number = athena?.ProfileRevision[profileId];
      const CommandRevision = athena?.ProfileCommandRevision[profileId];

      const ItemIds = (req.body as { itemIds: any })?.itemIds;
      let ProfileChanges: any = [];

      if (profileId != "athena") {
        const err = error.custom(
          req,
          "invalid_command",
          12801,
          `MarkNewQuestNotificationSent is not valid on ${profileId}`,
          "fortnite"
        );
        return res.headers(err.header).status(400).send(err.error);
      }

      if (ItemIds) {
        for (let x in ItemIds) {
          ProfileChanges.push({
            changeType: "itemAttrChanged",
            itemId: ItemIds[x],
            attributeName: "sent_new_notification",
            attributeValue: true,
          });
        }
      }

      await Athena.updateOne(
        {
          accountId,
        },
        {
          $set: {
            ["ProfileRevision.athena"]: ProfileRevision + 1,
            ["ProfileCommandRevision.athena"]: CommandRevision + 1,
          },
        }
      );

      return {
        profileRevision: ProfileRevision + 1,
        profileId,
        profileChangesBaseRevision: ProfileRevision,
        profileChanges: ProfileChanges,
        profileCommandRevision: CommandRevision + 1,
        serverTime: new Date().toISOString(),
        responseVersion: 1,
      };
    }
  );

  app.all(
    "/api/game/v2/profile/:accountId/client/SetBattleRoyaleBanner",
    { preHandler: verifyToken },
    async (req: FastifyRequest, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      const profileId: string = (req.query as { profileId: string })?.profileId;
      const accountId: string = (req.params as { accountId: string }).accountId;

      const athena = await Athena.findOne({ accountId }).lean();
      const QueryRevision = Number((req.query as { rvn: string }).rvn);
      const ProfileRevision: number = athena?.ProfileRevision[profileId];
      const CommandRevision = athena?.ProfileCommandRevision[profileId];

      if (profileId != "athena") {
        const err = error.custom(
          req,
          "invalid_command",
          12801,
          `SetBattleRoyaleBanne is not valid on ${profileId}`,
          "fortnite"
        );
        return res.headers(err.header).status(400).send(err.error);
      }

      const Color = (req.body as { homebaseBannerColorId: string })
        ?.homebaseBannerColorId;
      const Icon = (req.body as { homebaseBannerIconId: string })
        ?.homebaseBannerIconId;

      await Athena.updateOne(
        {
          accountId,
        },
        {
          $set: {
            Banner: Icon,
            BannerColor: Color,
            ["ProfileRevision.athena"]: ProfileRevision,
            ["ProfileCommandRevision"]: CommandRevision,
          },
        }
      );

      return {
        profileRevision: ProfileRevision + 1,
        profileId,
        profileChangesBaseRevision: ProfileRevision,
        profileChanges: [
          {
            changeType: "statModified",
            name: "banner_color",
            value: Color,
          },
          {
            changeType: "statModified",
            name: "banner_icon",
            value: Icon,
          },
        ],
        profileCommandRevision: CommandRevision + 1,
        serverTime: new Date().toISOString(),
        responseVersion: 1,
      };
    }
  );

  app.all(
    "/api/game/v2/profile/:accountId/client/BulkEquipBattleRoyaleCustomization",
    { preHandler: verifyToken },
    async (req: FastifyRequest, res) => {
      if (req.method != "POST") {
        const err = error.method(req);
        return res.headers(err.header).status(405).send(err.error);
      }

      const profileId: string = (req.query as { profileId: string })?.profileId;
      const accountId: string = (req.params as { accountId: string }).accountId;

      const athena = await Athena.findOne({ accountId }).lean();
      const QueryRevision = Number((req.query as { rvn: string }).rvn);
      const ProfileRevision: number = athena?.ProfileRevision[profileId];
      const CommandRevision = athena?.ProfileCommandRevision[profileId];

      if (profileId != "athena") {
        const err = error.custom(
          req,
          "invalid_command",
          12801,
          `RefreshExpeditions is not valid on ${profileId}`,
          "fortnite"
        );
        return res.headers(err.header).status(400).send(err.error);
      }

      await Athena.updateOne(
        {
          accountId,
        },
        {
          $set: {
            ["ProfileRevision.athena"]: ProfileRevision + 1,
            ["ProfileCommandRevision.athena"]: CommandRevision + 1,
          },
        }
      );

      return {
        profileRevision: ProfileRevision + 1,
        profileId,
        profileChangesBaseRevision: ProfileRevision,
        profileChanges: [],
        profileCommandRevision: CommandRevision + 1,
        serverTime: new Date().toISOString(),
        responseVersion: 1,
      };
    }
  );
};

export default mcp;
