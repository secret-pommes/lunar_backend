/* Reminder for myself (secret)
 * to rewrite this whole catalogManager,
 * make it easier for Mr.Drico to modify the shop.
 */
import fs from "fs";
import path from "path";

import * as log from "./log";
import { FeaturedTemplate, SecondaryTemplate } from "./shopInterfaces";
import * as BattlePassData from "../../resources/battlepass";

import * as FeaturedTemplateData from "../../resources/shop/featured";
import * as SecondaryTemplateData from "../../resources/shop/secondary";
import * as shopRarities from "../../resources/shop/shopRarities";

let bSendErrorMessages = false;

export function ConvertShop() {
  const catalog = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../../resources/shop/catalog.json"),
      "utf-8"
    )
  );

  let Weekly: any = [];
  let Daily: any = [];
  const data = catalog.data.secondary;

  try {
    data.skins.forEach((itemObject: any) => {
      Weekly.push(MakeFeatured(itemObject));
    });
  } catch {
    if (!bSendErrorMessages) {
      log.debug("Failed to setup Skins in Item-Shop.");
      bSendErrorMessages = true;
    }
  }

  try {
    data.pickaxes.forEach((itemObject: any) => {
      Daily.push(MakeSecondary(itemObject));
    });
  } catch {
    if (!bSendErrorMessages) {
      log.debug("Failed to setup Pickaxes in Item-Shop.");
      bSendErrorMessages = true;
    }
  }

  try {
    data.gliders.forEach((itemObject: any) => {
      Daily.push(MakeSecondary(itemObject));
    });
  } catch {
    if (!bSendErrorMessages) {
      log.debug("Failed to setup Gliders in Item-Shop.");
      bSendErrorMessages = true;
    }
  }

  try {
    data.emotes.forEach((itemObject: any) => {
      Daily.push(MakeSecondary(itemObject));
    });
  } catch {
    if (!bSendErrorMessages) {
      log.debug("Failed to setup Emotes in Item-Shop.");
      bSendErrorMessages = true;
    }
  }

  try {
    data.backblings.forEach((itemObject: any) => {
      Daily.push(MakeSecondary(itemObject));
    });
  } catch {
    if (!bSendErrorMessages) {
      log.debug("Failed to setup Backblings in Item-Shop.");
      bSendErrorMessages = true;
    }
  }

  try {
    data.wraps.forEach((itemObject: any) => {
      Daily.push(MakeSecondary(itemObject));
    });
  } catch {
    if (!bSendErrorMessages) {
      log.debug("Failed to setup Wraps in Item-Shop.");
      bSendErrorMessages = true;
    }
  }

  log.debug("Saving Catalog to json file..");
  fs.writeFileSync(
    path.join(__dirname, "../../resources/shop/finalCatalog.json"),
    JSON.stringify(
      {
        refreshIntervalHrs: 24,
        dailyPurchaseHrs: 24,
        expiration: "2050-12-31T00:00:00.000Z",
        storefronts: [
          {
            name: "BRDailyStorefront",
            catalogEntries: Daily,
          },
          {
            name: "BRWeeklyStorefront",
            catalogEntries: Weekly,
          },
          {
            name: "BRSeason5",
            catalogEntries: BattlePassData.CatalogEntry,
          },
        ],
      },
      null,
      2
    ),
    "utf8"
  );
  log.debug("Saved catalog to json file.");
}

function translate(id: string): string {
  if (id == null) {
    return "";
  }

  const idx = String(id).toLowerCase();
  let selected: string;

  switch (true) {
    case /cid|character/.test(idx):
      selected = `AthenaCharacter:${id}`;
      break;
    case /bid|backpack/.test(idx):
      selected = `AthenaBackpack:${id}`;
      break;
    case /glider/.test(idx):
      selected = `AthenaGlider:${id}`;
      break;
    case /pickaxe/.test(idx):
      selected = `AthenaPickaxe:${id}`;
      break;
    case /dance|eid/.test(idx):
      selected = `AthenaDance:${id}`;
      break;
    default:
      selected = idx;
  }

  return selected;
}

export function itemIsInStorefront(id: string) {
  const current: string = JSON.stringify(
    fs.readFileSync(
      path.join(__dirname, "../../resources/shop/finalCatalog.json"),
      "utf8"
    )
  );

  if (current.includes(id)) return true;
  return false;
}

function MakePrice(itemObject: any): number {
  const itemId = itemObject.id;
  const rarity = String(itemObject.rarity).toLowerCase();
  const type = translate(itemId).split(":")[0];
  const rarities: any = shopRarities.default;
  let price = rarities[type][rarity];

  if (typeof price !== "number" || !price) {
    log.debug(`Rarity for ${itemId} was not defined!`);
    price = 0; // temp fix
  }

  return price;
}

function MakeFeatured(itemObject: any): FeaturedTemplate {
  const template: FeaturedTemplate = JSON.parse(
    JSON.stringify(FeaturedTemplateData.default)
  );

  const item = itemObject.id;
  const price = MakePrice(itemObject);

  template.devName = translate(item);
  template.offerId = translate(item);
  template.requirements[0].requiredId = translate(item);
  template.itemGrants[0].templateId = translate(item);

  template.prices[0].regularPrice = price;
  template.prices[0].finalPrice = price;
  template.prices[0].basePrice = price;

  return template;
}

function MakeSecondary(itemObject: any): SecondaryTemplate {
  const template: SecondaryTemplate = JSON.parse(
    JSON.stringify(SecondaryTemplateData.default)
  );

  const item = itemObject.id;
  const price = MakePrice(itemObject);

  template.devName = translate(item);
  template.offerId = translate(item);
  template.requirements[0].requiredId = translate(item);
  template.itemGrants[0].templateId = translate(item);

  template.prices[0].regularPrice = price;
  template.prices[0].finalPrice = price;
  template.prices[0].basePrice = price;

  return template;
}
