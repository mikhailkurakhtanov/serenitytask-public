import { Achievement } from "./achievement.model";
import { TimeZoneType } from "./time-zone-type.model";
export class UserDetails {
    id: number;
    avatar: string;
    age: string;
    interests: string;
    languages: string;
    discordTag: string;
    telegramUsername: string;
    timeZone: TimeZoneType;
    userId: string;

    achievements: Achievement[];

    // not entity related properties

    interestsArray: string[];
    languagesArray: string[];
    isNewCardAnimationActive: boolean;
    isLanguagesSelectorVisible: boolean;
    friendRequestButtonStatus: string;

    constructor() {
        this.isLanguagesSelectorVisible = false;
        this.isNewCardAnimationActive = false;
    }
}