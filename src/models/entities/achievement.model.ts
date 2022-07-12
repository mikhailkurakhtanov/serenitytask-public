import { AchievementType } from "./achievement-type.model";

export class Achievement {
    id: number;
    value: number;
    userDetailsId: string;
    type: AchievementType;

    // not related to entity properties
    isDetailsVisible: boolean;
    isTooltipVisible: boolean = false;
}