export class GetUserCardsRequest {
    interests: string[];
    languages: string[];
    timezones: string[];
    isUserOnline: boolean | null;
    usernameOrEmail: string;

    constructor() {
        this.interests = [];
        this.languages = [];
        this.timezones = [];
        this.isUserOnline = false;
        this.usernameOrEmail = '';
    }
}