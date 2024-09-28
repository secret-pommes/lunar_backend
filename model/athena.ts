import mongoose from "mongoose";

export default mongoose.model(
  "Athena",
  new mongoose.Schema(
    {
      accountId: { type: String, required: true },
      created: { type: String, default: new Date().toISOString() },

      // Locker
      HasAllAthenaItems: { type: Boolean, default: false },
      AthenaItems: { type: Array, default: [] },
      Skin: { type: String, default: undefined },
      SkinVar: { type: String, default: undefined },
      Backbling: { type: String, default: undefined },
      BackblingVar: { type: String, default: undefined },
      Pickaxe: { type: String, default: undefined },
      PickaxeVar: { type: String, default: undefined },
      Glider: { type: String, default: undefined },
      Contrail: { type: String, default: undefined },
      Music: { type: String, default: undefined },
      Banner: { type: String, default: undefined },
      BannerColor: { type: String, default: undefined },
      LoadingScreen: { type: String, default: undefined },
      Emotes: { type: Array, default: ["", "", "", "", "", ""] },
      ItemWraps: { type: Array, default: ["", "", "", "", "", "", ""] },

      // Profile Stats
      BookbPurchased: { type: Boolean, default: false },
      BookLevel: { type: Number, default: 1 },
      XP: { type: Number, default: 0 },
      BookXP: { type: Number, default: 0 },
      AccountLevel: { type: Number, default: 1 },
      MatchXPBoost: { type: Number, default: 0 },
      MatchXPBoostForFriends: { type: Number, default: 0 },
      CurrentSupportACreatorCode: { type: String, default: undefined },
      CurrentMatchmakingPlaylist: { type: String, default: undefined },
      CurrentBuildUniqueId: { type: String, default: "0" },
      Currency: { type: Number, default: 0 },
      ProfileRevision: {
        type: Object,
        default: {
          athena: { type: Number, default: 0 },
          campaign: { type: Number, default: 0 },
          collection_book_people0: { type: Number, default: 0 },
          collection_book_schematics0: { type: Number, default: 0 },
          collections: { type: Number, default: 0 },
          common_core: { type: Number, default: 0 },
          common_public: { type: Number, default: 0 },
          creative: { type: Number, default: 0 },
          metadata: { type: Number, default: 0 },
          outpost0: { type: Number, default: 0 },
          profile0: { type: Number, default: 0 },
          theater0: { type: Number, default: 0 },
        },
      },
      ProfileCommandRevision: {
        type: Object,
        default: {
          athena: { type: Number, default: 0 },
          campaign: { type: Number, default: 0 },
          collection_book_people0: { type: Number, default: 0 },
          collection_book_schematics0: { type: Number, default: 0 },
          collections: { type: Number, default: 0 },
          common_core: { type: Number, default: 0 },
          common_public: { type: Number, default: 0 },
          creative: { type: Number, default: 0 },
          metadata: { type: Number, default: 0 },
          outpost0: { type: Number, default: 0 },
          profile0: { type: Number, default: 0 },
          theater0: { type: Number, default: 0 },
        },
      },

      // Profile & Leaderboard
      LeaderboardScore: { type: Number, default: 0 },
      Eliminations: { type: Number, default: 0 },
      AmountOfDeaths: { type: Number, default: 0 },
      MatchesPlayed: { type: Number, default: 0 },

      SolosWins: { type: Number, default: 0 },
      SolosTop10: { type: Number, default: 0 },
      SolosTop25: { type: Number, default: 0 },

      DuosWins: { type: Number, default: 0 },
      DuosTop5: { type: Number, default: 0 },
      DuosTop12: { type: Number, default: 0 },

      SquadsWins: { type: Number, default: 0 },
      SquadsTop3: { type: Number, default: 0 },
      SquadsTop6: { type: Number, default: 0 },

      LTMWins: { type: Number, default: 0 },
      LTMScore: { type: Number, default: 0 },
      LTMPlayersOutlived: { type: Number, default: 0 },

      // Matchmaking
      CurrentSelectedServer: { type: String, default: undefined },
      CurrentCustomMatchmakingKey: { type: String, default: undefined },

      // Leveling & Quests
      CurrentQuests: { type: Object, default: {} },
    },
    {
      collection: "Athena",
    }
  )
);
