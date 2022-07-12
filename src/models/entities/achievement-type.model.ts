import { AchievementTypeRate } from "../enums/achievement-type-rate.enum";

export class AchievementType {
    id: number;
    name: string;
    description: string;
    goal: number;
    icon: string;
    rate: AchievementTypeRate;
}