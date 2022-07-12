import { Achievement } from "../entities/achievement.model";

export class UserCard {
    name: string;
    avatar: string;
    age: string;
    timeZone: string;
    languages: string[];
    interests: string[];
    lookingFor: string;
    isUserOnline: boolean;
    achievements: Achievement[];
    userId: string;

    isNewCardAnimationActive: boolean;
    friendRequestButtonStatus: string;
}