import { trigger, transition, style, sequence, animate, state } from "@angular/animations";
import { Component, Input, OnInit } from "@angular/core";
import { faChevronRight, faUndo, faUserPlus, faCheck, faTimes, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { UserNotification, UserNotificationType } from "src/models/entities/user-notification.model";
import { User } from "src/models/entities/user.model";
import { UserCard } from "src/models/views/user-card.model";
import { UserSearchOption } from "src/models/views/user-search-option.model";
import { UserSearchOptions, UserSearchOptionsTypes } from "src/models/views/user-search-options.model";
import { UserNotificationService } from "src/services/api/user-notification.service";
import { UserService } from "src/services/api/user.service";

@Component({
    selector: 'user-cards',
    templateUrl: 'user-cards.component.html',
    styleUrls: ['user-cards.component.css'],
    animations: [
        trigger('changeButtonState', [
            transition('* => true', [
                sequence([
                    animate('0.25s ease',
                        style({ transform: 'translateY(-5px)' }))
                ])
            ]),
            transition('true => false', [
                sequence([
                    animate('0.25s ease',
                        style({ transform: 'translateY(0px)' }))
                ])
            ]),
            state('true', style({ transform: 'translateY(-5px)' })),
            state('false', style({ transform: 'translateY(0px)' }))
        ]),
        trigger('changeSearchOptionsState', [
            transition('* => true', [
                style({ opacity: 0, height: 0, 'margin-top': 0, transform: 'translateY(-5px)' }),
                sequence([
                    animate('0.25s ease',
                        style({ opacity: 1, height: '*', 'margin-top': '15px', transform: 'translateY(0px)' }))
                ])
            ]),
            transition('true => false', [
                style({ opacity: 1, height: '*', 'margin-top': '15px', transform: 'translateY(0px)' }),
                sequence([
                    animate('0.25s ease',
                        style({ opacity: 0, 'margin-top': 0 }))
                ]),
                sequence([
                    animate('0.25s ease',
                        style({ height: 0, transform: 'translateY(-5px)' }))
                ])
            ]),
            state('true', style({ opacity: 1, height: '*', 'margin-top': '15px', transform: 'translateY(0px)' })),
            state('false', style({ opacity: 0, height: 0, transform: 'translateY(-5px)' }))
        ]),
        trigger('changeUserCardState', [
            transition('* => true', [
                style({ opacity: 0 }),
                sequence([
                    animate('0.25s ease',
                        style({ opacity: 1 }))
                ])
            ]),
            transition('true => false', [
                style({ opacity: 1 }),
                sequence([
                    animate('0.25s ease',
                        style({ opacity: 0 }))
                ])
            ]),
            state('true', style({ opacity: 1 })),
            state('false', style({ opacity: 0 }))
        ])
    ]
})
export class UserCardsComponent implements OnInit {
    @Input() currentUser: User;

    get userSearchOptionsTypesBase(): typeof UserSearchOptionsTypes {
        return UserSearchOptionsTypes;
    }

    searchQuery: string;
    searchRollbackIcon = faUndo;

    isApplyButtonAnimated: boolean;
    isApplyButtonActive: boolean;
    isRollbackButtonAnimated: boolean;

    isDOMContainsNewInterestFormClass: boolean;

    searchOptions: UserSearchOptions;
    searchOptionsToggleIcon: IconDefinition;
    areSearchOptionsVisible: boolean;

    sendFriendRequestIcon = faUserPlus;
    completeActionIcon = faCheck;
    closeIcon = faTimes;

    isNothingFoundErrorVisible: boolean;

    userCards: UserCard[];

    constructor(private userService: UserService, private userNotificationService: UserNotificationService) {
        this.userCards = [];
        this.isApplyButtonAnimated = false;
        this.isApplyButtonActive = true;
        this.isRollbackButtonAnimated = false;
        this.isNothingFoundErrorVisible = false;

        this.isDOMContainsNewInterestFormClass = false;

        this.areSearchOptionsVisible = false;
        this.searchOptionsToggleIcon = faChevronRight;
    }

    updateSearchOptionsToggleIcon(searchOptionsToggle: any) {
        this.areSearchOptionsVisible = !this.areSearchOptionsVisible;
        searchOptionsToggle.firstChild.firstChild.style.transform = this.areSearchOptionsVisible
            ? 'rotate(90deg)' : 'rotate(0deg)';
    }

    rollbackSearchOptions(searchInput: any) {
        searchInput.value = '';

        this.searchOptions.otherInterests = [];
        this.searchOptions.otherTimezones = [];

        for (let i = 0; i < this.searchOptions.languages.length; i++) {
            this.searchOptions.languages[i].updateSelectedState(false);
        }

        for (let i = 0; i < this.searchOptions.interests.length; i++) {
            this.searchOptions.interests[i].updateSelectedState(false);
        }

        for (let i = 0; i < this.searchOptions.timezones.length; i++) {
            this.searchOptions.timezones[i].updateSelectedState(false);
        }

        for (let i = 0; i < this.searchOptions.activities.length; i++) {
            this.searchOptions.activities[i].updateSelectedState(false);
        }

        this.isApplyButtonActive = true;
    }

    async ngOnInit(): Promise<void> {
        await this.initializeSearchOptions();
    }

    async initializeSearchOptions() {
        let languages = [new UserSearchOption('English'), new UserSearchOption('Russian')];
        let interests = [new UserSearchOption('Like mine'), new UserSearchOption('Other')];
        let timezones = [new UserSearchOption('Like mine')];
        let activities = [new UserSearchOption('Online')];

        this.searchOptions = new UserSearchOptions(languages, interests, timezones, activities);
    }

    changeApplyButtonState() { //make universal method for any button by #...
        this.isApplyButtonAnimated = !this.isApplyButtonAnimated;
    }

    changeRollbackButtonState() {
        this.isRollbackButtonAnimated = !this.isRollbackButtonAnimated;
    }

    searchUsers(searchInputValue: string) {
        this.isApplyButtonActive = false;

        searchInputValue.length > 0 ? this.searchOptions.usernameOrEmail = searchInputValue
            : this.searchOptions.usernameOrEmail = '';
        let newGetUserCardsRequestData = this.searchOptions.map(this.currentUser);

        if (this.userCards.length > 0) {
            for (let i = 0; i < this.userCards.length; i++) {
                this.userCards[i].isNewCardAnimationActive = false;
            }
        }

        this.userService.getUserCards(newGetUserCardsRequestData).subscribe(x => {
            this.userCards = [];
            if (x.length > 0) {
                this.isNothingFoundErrorVisible = false;

                for (let item of x) {
                    item.isNewCardAnimationActive = true;
                    item.friendRequestButtonStatus = 'Send friend request';
                    this.userCards.push(item);
                }
            } else this.isNothingFoundErrorVisible = true;

            this.isApplyButtonActive = true;
        });
    }

    checkOnOtherOptions(item: UserSearchOption, index: number, type: UserSearchOptionsTypes | null = null) {
        if (item.name == 'Other') {
            if (!item.selected) this.searchOptions.otherInterests = [];
            else if (type != null) {
                switch (type) {
                    case this.userSearchOptionsTypesBase.Interests:
                        if (this.searchOptions.otherInterests.length == 0) this.searchOptions.interests[index].updateSelectedState();
                        break;
                }
            }
        }
    }

    removeCustomInterest(newInterestInput: any) {
        this.searchOptions.otherInterests.push(newInterestInput.value);
        newInterestInput.value = '';
        newInterestInput.focus()
    }

    sendFriendRequest(index: number) {
        let newUserNotification = new UserNotification;
        newUserNotification.senderId = this.currentUser.id;
        newUserNotification.receiverId = this.userCards[index].userId;
        newUserNotification.type = UserNotificationType.FriendRequest;

        this.userNotificationService.create(newUserNotification).subscribe(x => {
            this.userCards[index].friendRequestButtonStatus = 'Sent';
        });
    }
}
