import Athena from "../../model/athena";

import * as log from "./log";
import * as utils from "./utils";
import * as QuestIds from "../../resources/quests";

export async function ApplyQuestToUser(accountId: string, questType: string) {
  const athena = await Athena.findOne({ accountId }).lean();

  const CurrentQuests: any = athena?.CurrentQuests;

  let bFirstLogin: boolean = false;
  let bShouldGiveDailyQuests: boolean = false;
  let bShouldGiveBRQuests: boolean = false;

  let Daily: string[] = [];
  let BattleRoyale: string[] = [];

  try {
    Daily = CurrentQuests.Active.Daily;
    BattleRoyale = CurrentQuests.Active.BattleRoyale;

    if (Daily.length !== 3) bShouldGiveDailyQuests = true;
    if (BattleRoyale.length === 0) bShouldGiveBRQuests = true;
  } catch {
    bFirstLogin = true;
  }

  // DAILY
  let SelectedDaily: string[] = [];
  let FinalDaily: any = [];

  // BATTLE ROYALE
  let SelectedBR: string[] = [];
  let FinalBR: any = [];

  switch (questType) {
    case "Daily": {
      const quests = [...QuestIds.default.Daily];

      if (bFirstLogin || bShouldGiveDailyQuests) {
        // Apply 3x new Quests for new user.
        for (let i = quests.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [quests[i], quests[j]] = [quests[j], quests[i]];
        }

        SelectedDaily = quests.slice(0, 3);
        SelectedDaily.forEach((questId: string) => {
          FinalDaily.push({
            [questId]: {
              current: 0,
              target: (QuestIds.default.DailyInformation as any)[questId]
                .target,
              max: (QuestIds.default.DailyInformation as any)[questId].max,
              created_at: new Date().toISOString(),
              completed: false,
              complted_at: null,
            },
          });
        });

        // hopefully we dont kill our db with this.
        await Athena.updateOne(
          { accountId },
          {
            CurrentQuests: {
              Active: {
                Daily: FinalDaily,
                BattleRoyale: [],
              },
            },
          }
        );
      } else {
        Daily.forEach(async (questMetadata: any, index: number) => {
          const questKey = Object.keys(questMetadata)[0];
          const questData = questMetadata[questKey];

          try {
            if (questData.current == questData.max) {
              log.debug(`${accountId} complted quest: ${questKey}`);
              if (utils.check24gAgo(questData.complted_at)) {
                FinalDaily = athena?.CurrentQuests.Active.Daily; // Update the Var.

                const availableQuests = quests.filter(
                  (questId: string) =>
                    !Daily.some((q: any) => Object.keys(q)[0] === questId)
                );

                for (let i = availableQuests.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  [availableQuests[i], availableQuests[j]] = [
                    availableQuests[j],
                    availableQuests[i],
                  ];
                }

                const newQuestToApply: any = availableQuests.slice(0, 1);
                const newQuest: any = {
                  [newQuestToApply]: {
                    newQuestToApply: 0,
                    target: (QuestIds.default.DailyInformation as any)[
                      newQuestToApply
                    ].target,
                    max: (QuestIds.default.DailyInformation as any)[
                      newQuestToApply
                    ].max,
                    created_at: new Date().toISOString(),
                    completed: false,
                    complted_at: null,
                  },
                };

                Daily.splice(index, 1);
                Daily.push(newQuest);

                await Athena.updateOne(
                  { accountId },
                  {
                    CurrentQuests: {
                      Active: {
                        Daily,
                        BattleRoyale: [],
                      },
                    },
                    $inc: { XP: 1000 },
                  }
                );
              } else {
                Daily.splice(index, 1);
                await Athena.updateOne(
                  { accountId },
                  {
                    CurrentQuests: {
                      Active: {
                        Daily,
                        BattleRoyale: [],
                      },
                    },
                    $inc: { XP: 1000 },
                  }
                );
              }
            }
          } catch {}
        });
      }

      break;
    }

    case "BattleRoyale": {
      // this will be harder.
    }

    default: {
      console.warn("Invalid quest type");
    }
  }
}

export async function rerollQuestOnUser(questId: string, accountId: string) {
  // Reroll quest logic
}

export async function sendQuestsToClient(accountId: string) {
  try {
    const athena = await Athena.findOne({ accountId }).lean();
    const activeDaily = athena?.CurrentQuests?.Active?.Daily || [];

    if (activeDaily.length === 0) return [];

    return activeDaily.map((questMetadata: any) => {
      const questKey = Object.keys(questMetadata)[0];
      const questTarget = questMetadata[questKey];

      return {
        changeType: "itemAdded",
        itemId: `Quest:${questKey}`,
        item: {
          templateId: `Quest:${questKey}`,
          attributes: {
            creation_time: questTarget.created,
            level: -1,
            item_seen: true,
            sent_new_notification: true,
            xp_reward_scalar: 1,
            quest_state: "Active",
            last_state_change_time: new Date().toISOString(),
            max_level_bonus: 0,
            xp: 0,
            quest_rarity: "uncommon",
            favorite: false,
            [`completion_${questTarget.target}`]: questTarget.current,
          },
          quantity: 1,
        },
      };
    });
  } catch (err) {
    return [];
  }
}

export async function checkQuestChanges(
  accountId: string,
  interaction: string
) {
  const athena = await Athena.findOne({ accountId }).lean();
  const currentDailyQuests = athena?.CurrentQuests?.Active?.Daily || [];
  const currentQuestStates = athena?.CurrentQuests || {};
  const questsToDelete: number[] = [];

  currentDailyQuests.forEach((questMetadata: any, index: number) => {
    const questKey = Object.keys(questMetadata)[0];
    const questData = questMetadata[questKey];

    switch (questKey) {
      case "AthenaDailyQuest_InteractTreasureChest":
        if (interaction.includes("chest")) {
          if (questData.current === questData.max) {
            questsToDelete.push(index);
          } else {
            questData.current++;
            currentQuestStates.Active.Daily[index][questKey] = questData;
          }
        }
        break;

      case "AthenaDailyQuest_InteractAmmoCrate":
        if (interaction.includes("ammo")) {
          console.log("Ammo Box opened, Valid Quest.");
        }
        break;
    }
  });

  questsToDelete.reverse().forEach((index: any) => {
    currentQuestStates.Active.Daily.splice(index, 1);
  });

  await Athena.updateOne(
    { accountId },
    { $set: { CurrentQuests: currentQuestStates } }
  );
}
