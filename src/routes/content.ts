import { FastifyPluginAsync } from "fastify";

import * as utils from "../utils/utils";
import * as error from "../utils/error";
import * as contentManager from "../utils/contentManager";

const content: FastifyPluginAsync = async (app) => {
  app.get("/api/pages/fortnite-game", async (req, res) => {
    const { season, version } = utils.FNVersion(req);

    let dynamicbackgroundsStage: string = `season${season}`;

    if (season == 10) {
      dynamicbackgroundsStage = "seasonx";
    } else if (version == 6.2 || version == 6.21) {
      dynamicbackgroundsStage = "fortnitemares";
    }

    const selectedContent: any = contentManager.GetSelectedContent(req);

    return {
      _activeDate: "2024-01-01T00:00:00.000Z",
      lastModified: "2024-01-01T00:00:00.000Z",
      _locale: "en-us",
      _suggestedPrefetch: [],
      _title: "Fortnite Game",
      emergencynotice: {
        _activeDate: "2024-01-01T00:00:00.000Z",
        _locale: "en-us",
        _noIndex: false,
        _title: "emergencynotice",
        alwaysShow: true,
        lastModified: new Date().toISOString(),
        news: {
          _type: "Battle Royale News",
          messages: [
            {
              _type: "CommonUI Simple Message Base",
              title: "LUNAR MULTIPLAYER",
              body: "Website: www.lunarfn.org\nDiscord: discord.gg/lunarmp\nX: x.com/projectlunarfn",
              hidden: false,
              spotlight: true,
            },
          ],
        },
      },
      battleroyalenews: {
        news: {
          _type: "Battle Royale News",
          messages: [
            {
              image:
                "https://cdn.lunarfn.org/game/news/news_4d38e21e-b3ac-4497-95aa-a0dcc039bcbb.png",
              hidden: true,
              _type: "CommonUI Simple Message Base",
              adspace: "NEW!",
              title: "Season X Battle Pass",
              body: "The Season X Battle Pass is available now! Unlock exclusive Outfits, Emotes, Wraps and more as you play through Season X.",
              spotlight: false,
            },
            {
              image:
                "https://cdn.lunarfn.org/game/news/news_cc0404ec-157c-4947-8c5e-8da8be034afc.jpg",
              hidden: true,
              _type: "CommonUI Simple Message Base",
              adspace: "PLAY WHERE YOU WANT!",
              title: "Android, Switch and PS4!",
              body: "We now have Android, Switch and PS4 support so you can play everywhere you want!",
              spotlight: false,
            },
            {
              image:
                "https://cdn.lunarfn.org/game/news/news_f0120368-906a-4c9a-91bc-da98b70493f4.jpg",
              hidden: true,
              _type: "CommonUI Simple Message Base",
              adspace: "SAFETY FIRST!",
              title: "There is only one official downlad of Lunar",
              body: "There is only one official downlad of Lunar, dont download any third-party or from other people to stay safe!",
              spotlight: false,
            },
          ],
        },
        _title: "battleroyalenews",
        header: "",
        style: "None",
        _noIndex: false,
        _activeDate: "2024-01-01T00:00:00.000Z",
        lastModified: "2024-01-01T00:00:00.000Z",
        _locale: "en-US",
      },
      playlistinformation: {
        frontend_matchmaking_header_style: "None",
        _title: "playlistinformation",
        frontend_matchmaking_header_text: "",
        playlist_info: {
          _type: "Playlist Information",
          playlists: [
            {
              image:
                "https://cdn.lunarfn.org/game/playlists/Season10_SoloLobbyArt.jpg",
              playlist_name: "Playlist_DefaultSolo",
              special_border: "None",
              hidden: false,
              _type: "FortPlaylistInfo",
            },
            {
              image:
                "https://cdn.lunarfn.org/game/playlists/Season10_DuoLobbyArt.jpg",
              playlist_name: "Playlist_DefaultDuo",
              special_border: "None",
              hidden: false,
              _type: "FortPlaylistInfo",
            },
            {
              image:
                "https://cdn.lunarfn.org/game/playlists/Season10_TriosLobbyArt.jpg",
              playlist_name: "Playlist_Trios",
              special_border: "None",
              hidden: false,
              _type: "FortPlaylistInfo",
            },
            {
              image:
                "https://cdn.lunarfn.org/game/playlists/Season10_SquadLobbyArt.jpg",
              playlist_name: "Playlist_DefaultSquad",
              special_border: "None",
              hidden: false,
              _type: "FortPlaylistInfo",
            },
            {
              image: "https://cdn.lunarfn.org/game/playlists/50V50.png",
              playlist_name: "Playlist_50v50",
              special_border: "None",
              hidden: false,
              _type: "FortPlaylistInfo",
            },
            {
              image: "https://cdn.lunarfn.org/game/playlists/Playground.jpg",
              playlist_name: "Playlist_Playground",
              special_border: "None",
              hidden: false,
              _type: "FortPlaylistInfo",
            },
            {
              image: "https://cdn.lunarfn.org/game/playlists/LateGame.jpg",
              playlist_name: "Playlist_Vamp_Solo",
              special_border: "None",
              hidden: false,
              _type: "FortPlaylistInfo",
            },
          ],
        },
        _noIndex: false,
        _activeDate: "2024-01-01T00:00:00.000Z",
        lastModified: new Date().toISOString(),
        _locale: "en-US",
      },
      subgameselectdata: {
        battleRoyale: {
          _type: "CommonUI Simple Message",
          message: {
            image: "",
            hidden: false,
            messagetype: "normal",
            _type: "CommonUI Simple Message Base",
            title: selectedContent.br.title || "100 Player PvP",
            body:
              selectedContent.br.description ||
              "100 Player PvP Battle Royale.\n\nPvE progress does not affect Battle Royale.",
            spotlight: false,
          },
        },
        saveTheWorldUnowned: {
          _type: "CommonUI Simple Message",
          message: {
            image: "",
            hidden: false,
            messagetype: "normal",
            _type: "CommonUI Simple Message Base",
            title: selectedContent.stw.title || "Not Supported!",
            body:
              selectedContent.stw.description ||
              "Save The World is not supported in Lunar!",
            spotlight: false,
          },
        },
        saveTheWorld: {
          _type: "CommonUI Simple Message",
          message: {
            image: "",
            hidden: false,
            messagetype: "normal",
            _type: "CommonUI Simple Message Base",
            title: selectedContent.stw.title || "Not Supported!",
            body:
              selectedContent.stw.description ||
              "Save The World is not supported in Lunar!",
            spotlight: false,
          },
        },
        creative: {
          _type: "CommonUI Simple Message",
          message: {
            image: "",
            body:
              selectedContent.creative.description ||
              "Your Island. Your Friends. Your Rules.\n\nDiscover new ways to play Fortnite, play community made games with friends and build your dream island.",
            hidden: true,
            messagetype: "normal",
            spotlight: false,
            title: selectedContent.creative.title || "New Featured Islands!",
          },
        },
        _activeDate: "2024-01-01T00:00:00.000Z",
        lastModified: "2024-01-01T00:00:00.000Z",
        _locale: "en-US",
        _templateName: "SubgameInfo",
      },
      dynamicbackgrounds: {
        _activeDate: "2024-01-01T00:00:00.000Z",
        _locale: "en-US",
        _title: "dynamicbackgrounds",
        lastModified: "2024-01-01T00:00:00.000Z",
        news: null,
        backgrounds: {
          _type: "DynamicBackgroundList",
          backgrounds: [
            {
              _type: "DynamicBackground",
              key: "lobby",
              stage: "worldcup", // summer
            },
            {
              _type: "DynamicBackground",
              key: "vault",
              stage: "worldcup", // summer
            },
          ],
        },
      },
      battlepassaboutmessages: {
        news: {
          _type: "Battle Royale News",
          messages: [
            {
              layout: "Right Image",
              image:
                "https://cdn.lunarfn.org/game/battlepass/Season10_BattlePass_HowDoesItWork.png",
              hidden: false,
              _type: "CommonUI Simple Message Base",
              title: "HOW DOES IT WORK?",
              body: "Play to level up your Battle Pass. The more you play, the more rewards you earn. Level up faster by completing Weekly Challenges. Earn more than 100 rewards worth over 25,000 V-Bucks (typically takes 75 to 150 hours of play). You can purchase the Battle Pass anytime during the season for 950 V-Bucks.",
              spotlight: false,
            },
            {
              layout: "Left Image",
              image:
                "https://cdn.lunarfn.org/game/battlepass/Season10_BattlePass_WhatsInside.png",
              hidden: false,
              _type: "CommonUI Simple Message Base",
              title: "WHAT’S INSIDE?",
              body: "When you buy the Battle Pass, you’ll instantly receive two exclusive outfits - X-Lord and Catalyst! You can also earn exclusive rewards including Emotes, Outfits, Wraps, Pets, Pickaxes, loading screens and new surprises. You’ll receive a reward each time you level up. 100 tiers total for over 100 rewards. \n",
              spotlight: false,
            },
            {
              layout: "Left Image",
              image:
                "https://cdn.lunarfn.org/game/battlepass/Season10_BattlePass_Introducing.png",
              hidden: false,
              _type: "CommonUI Simple Message Base",
              title: "INTRODUCING MISSIONS!",
              body: "A brand new way to progress through the Battle Pass. Complete thematic objectives to earn Battle Stars, XP, and extra cosmetic items! Some Missions can be repeated once you have completed all the objectives, rewarding you with even more rewards for completing harder objectives.",
              spotlight: false,
            },
          ],
        },
        _title: "BattlePassAboutMessages",
        _activeDate: "2024-01-01T00:00:00.000Z",
        lastModified: "2024-01-01T00:00:00.000Z",
        _noIndex: false,
        _locale: "en-US",
      },
      tournamentinformation: {
        conversion_config: {
          containerName: "tournament_info",
          _type: "Conversion Config",
          enableReferences: true,
          contentName: "tournaments",
        },
        "jcr:isCheckedOut": true,
        tournament_info: {
          tournaments: [],
          _type: "Tournaments Info",
        },
        _title: "tournamentinformation",
        _noIndex: false,
        "jcr:baseVersion": "0",
        _activeDate: "2024-01-01T00:00:00.000Z",
        lastModified: "2024-01-01T00:00:00.000Z",
        _locale: "en-US",
      },
    };
  });

  app.setNotFoundHandler((req, res) => {
    const err = error.not_found(req);
    res.headers(err.header).status(404).send(err.error);
  });
};

export default content;
