import * as SavedLevel from "../../resources/levelingData";

const LevelData = SavedLevel.default;

export function CalcLVL(TotalXP: number) {
  let resp = {
    CurrentLevel: 1,
    CurrentLevelXP: 0,
    NextLevelXP: 0,
  };

  for (let i = 0; i < LevelData.length; i++) {
    if (TotalXP >= LevelData[i].XpTotal) {
      resp.CurrentLevel = LevelData[i].Level;

      if (i < LevelData.length - 1) {
        resp.NextLevelXP = LevelData[i + 1].XpToNextLevel;
        resp.CurrentLevelXP = TotalXP - LevelData[i].XpTotal;
      } else {
        resp.NextLevelXP = 0;
        resp.CurrentLevelXP = TotalXP - LevelData[i].XpTotal;
      }
    } else {
      break;
    }
  }

  return resp;
}
