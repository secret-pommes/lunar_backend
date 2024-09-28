import { FastifyRequest } from "fastify";
import * as utils from "../utils/utils";

const content: any = {
  de: {
    br: {
      title: "100-Spieler-PvP",
      description:
        "Battle Royale, 100-Spieler-PvP.\n\nFortschritte im PvE haben keinen Einfluss auf Battle Royale.",
    },
    stw: {
      title: "Koop-PvE",
      description: "PVE-Modus, in dem du den Sturm kooperativ bekämpfst!",
    },
    creative: {
      title: "Kreativmodus",
      description: "Deine Inseln. Deine Freunde. Deine Regeln",
    },
  },
  en: {
    br: {
      title: "100 Player PvP",
      description:
        "100 Player PvP Battle Royale.\n\nPvE progress does not affect Battle Royale.",
    },
    stw: {
      title: "Co-op PvE",
      description: "Cooperative PvE storm-fighting adventure!",
    },
    creative: {
      title: "Creative",
      description: "Your Islands. Your Friends. Your Rules.",
    },
  },
  ru: {
    br: {
      title: "PvP-режим на 100 игроков",
      description:
        "PvP-режим на 100 игроков «Королевская битва».\n\nПрогресс в кампании не затрагивает «Королевскую битву».",
    },
    stw: {
      title: "Сюжетная PvE-кампания",
      description: "Совместное сражение с Бурей!",
    },
    creative: {
      title: "Творческийрежим",
      description: "Ваши острова. Ваши друзья. Ваши правила.",
    },
  },
  ko: {
    br: {
      title: "100명의 플레이어와 함께하는 PvP",
      description:
        "100명의 플레이어와 함께하는 PvP 모드, 배틀로얄.\n\nPvE 모드의 진행 상황은 배틀로얄 플레이에 영향을 주지 않습니다.",
    },
    stw: {
      title: "팀과 함께 플레이하는 PvE",
      description:
        '배틀로얄을 플레이하려면 상단의 "배틀로얄" 버튼을 클릭하세요.\n\n팀과 함께하는 PvE 모드, 폭풍과 싸우는 어드벤처!',
    },
    creative: {
      title: "포크리",
      description: "나의 섬. 나의 친구. 나의 규칙.",
    },
  },
  it: {
    br: {
      title: "PvP a 100 giocatori",
      description:
        "Battaglia reale PvP a 100 giocatori.\n\nI progressi in PvE non sono trasferiti nella Battaglia reale.",
    },
    stw: {
      title: "PvE co-op",
      description: "Avventura tempestosa cooperativa PvE!",
    },
    creative: {
      title: "Modalità creativa",
      description: "Le tue isole. I tuoi amici. Le tue regole.",
    },
  },
  fr: {
    br: {
      title: "JcJ à 100 joueurs",
      description:
        "Un Battle Royale à 100 en JcJ.\n\nLa progression du mode JcE n'affecte pas Battle Royale.",
    },
    stw: {
      title: "JcE coopératif",
      description: "Une aventure en JcE coopératif pour combattre la tempête !",
    },
    creative: {
      title: "Mode Créatif",
      description: "Vos îles, vos amis, vos règles.",
    },
  },
  es: {
    br: {
      title: "JcJ de 100 jugadores",
      description:
        "Battle Royale JcJ de 100 jugadores.\n\nEl progreso JcE no afecta a Battle Royale.",
    },
    stw: {
      title: "JcE cooperativo",
      description: "¡Aventura cooperativa JcE de lucha contra la tormenta!",
    },
    creative: {
      title: "Modo Creativo",
      description: "Tus islas. Tus amigos. Tus reglas.",
    },
  },
  ar: {
    br: {
      title: "100 Player PvP",
      description:
        "100 Player PvP Battle Royale.\n\nPvE progress does not affect Battle Royale.",
    },
    stw: {
      title: "Co-op PvE",
      description: "Cooperative PvE storm-fighting adventure!",
    },
    creative: {
      title: "Creative",
      description: "جزرك. أصدقاؤك. قواعدك.",
    },
  },
  ja: {
    br: {
      title: "100人参加のPvP",
      description:
        "100人参加のPvPバトルロイヤル。\n\nPvEモードの進行状況はバトルロイヤルに影響しません。",
    },
    stw: {
      title: "協力PvE",
      description: "PvE協力プレイでストームに立ち向かえ！",
    },
    creative: {
      title: "クリエイティブ",
      description: "自分の島。自分のフレンド。自分のルール。",
    },
  },
  pl: {
    br: {
      title: "PvP dla 100 graczy",
      description:
        "Battle Royale: PvP dla 100 graczy\n\nPostępy w kampanii nie wpływają na grę w Battle Royale.",
    },
    stw: {
      title: "Kooperacyjny tryb PvE",
      description: "Kooperacyjne zmagania PvE z burzą i pustakami!",
    },
    creative: {
      title: "Tryb kreatywny",
      description: "Twoje wyspa, twoi znajomi, twoje zasady.",
    },
  },
  "es-419": {
    br: {
      title: "JcJ de 100 jugadores",
      description:
        "Batalla campal JcJ de 100 jugadores.\n\nEl progreso de JcE no afecta Batalla campal.",
    },
    stw: {
      title: "JcE cooperativo",
      description:
        "¡Aventura de lucha contra la tormenta en un JcE cooperativo!",
    },
    creative: {
      title: "Modo Creativo",
      description: "Tus islas. Tus amigos. Tus reglas.",
    },
  },
  tr: {
    br: {
      title: "100 Oyunculu PvP",
      description:
        "100 Oyunculu PvP Battle Royale. PvE ilerlemesi Battle Royale'i etkilemez.",
    },
    stw: {
      title: "Oyuncularla Birlikte PvE",
      description:
        "Diğer oyuncularla birlikte PvE fırtınayla savaşma macerası!",
    },
    creative: {
      title: "Kreatif",
      description: "Senin Adaların. Senin Dostların. Senin Kuralların.",
    },
  },
};

export function GetSelectedContent(req: FastifyRequest) {
  const clientLang: string = utils.ClientLang(req) || "en"
  return content[clientLang];
}
