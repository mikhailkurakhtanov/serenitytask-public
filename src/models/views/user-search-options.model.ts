import { User } from "../entities/user.model";
import { GetUserCardsRequest } from "../requests/user/get-user-cards-request.model";
import { UserSearchOption } from "./user-search-option.model";

export class UserSearchOptions {
    usernameOrEmail: string;

    languages: UserSearchOption[];

    interests: UserSearchOption[];
    otherInterests: string[];

    timezones: UserSearchOption[];
    otherTimezones: string[];

    activities: UserSearchOption[];

    constructor(languages: UserSearchOption[], interests: UserSearchOption[],
        timezones: UserSearchOption[], activities: UserSearchOption[]) {
        this.usernameOrEmail = '';

        this.languages = languages;

        this.interests = interests;
        this.otherInterests = [];

        this.timezones = timezones;
        this.otherTimezones = [];

        this.activities = activities;
    }

    map(currentUser: User): GetUserCardsRequest {
        let newGetUserCardsRequestData = new GetUserCardsRequest();

        let selectedInterests = this.interests.find(x => x.selected);
        if (selectedInterests?.name == 'Like mine' && currentUser.userDetails.interests?.length > 0) {
            newGetUserCardsRequestData.interests = currentUser.userDetails.interests.split(', ');
        } else if (selectedInterests?.name == 'Other' && this.otherInterests?.length > 0) {
            newGetUserCardsRequestData.interests = this.otherInterests;
        }

        let selectedTimezones = this.timezones.find(x => x.selected);
        if (selectedTimezones?.name == 'Like mine' && currentUser.userDetails.timeZone) {
            newGetUserCardsRequestData.timezones.push(currentUser.userDetails.timeZone.timeZoneId);
        } else if (selectedTimezones?.name == 'Other' && this.otherTimezones?.length > 0) {
            newGetUserCardsRequestData.timezones = this.otherTimezones;
        }

        let selectedLanguages = this.languages.filter(x => x.selected);
        if (selectedLanguages.length > 0) {
            for (let language of selectedLanguages) newGetUserCardsRequestData.languages.push(language.name);
        }

        let selectedActivity = this.activities.find(x => x.selected);
        newGetUserCardsRequestData.isUserOnline = selectedActivity != undefined ? true : null;
        newGetUserCardsRequestData.usernameOrEmail = this.usernameOrEmail;

        return newGetUserCardsRequestData;
    }
}

export enum UserSearchOptionsTypes {
    Interests = 0,
    Timezone = 1
}