import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, OnInit } from "@angular/core"
import { faWindowClose, faTrophy, faUser, faPen, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { faTelegram, faDiscord } from "@fortawesome/free-brands-svg-icons";
import { UserDetailsService } from "../../../../../../services/api/user-details.service";
import { UserService } from "../../../../../../services/api/user.service";
import { Constants } from "../../../../../constants";
import { User } from "../../../../../../models/entities/user.model";
import { animate, sequence, state, style, transition, trigger } from "@angular/animations";
import { AchievementTypeRate } from "src/models/enums/achievement-type-rate.enum";
import { UserDetailsHub } from "src/services/hubs/user-details.hub";
import { Achievement } from "src/models/entities/achievement.model";

@Component({
    selector: 'profile',
    templateUrl: 'profile.component.html',
    styleUrls: ['profile.component.css'],
    animations: [
        trigger('changeClosePopupButtonState', [
            transition('* => true', [
                sequence([
                    animate('0.25s ease',
                        style({ transform: 'translateY(-5px)' }))
                ])
            ]),
            state('true', style({ transform: 'translateY(-5px)' })),
            transition('true => false', [
                sequence([
                    animate('0.25s ease',
                        style({ transform: 'translateY(0px)' }))
                ]),
                state('false', style({ transform: 'translateY(0px)' }))
            ])
        ])
    ]
})
export class ProfileComponent implements OnInit {
    @Input() set receivedCurrentUser(value: User) {
        if (value) {
            this.currentUser = value;
            if (this.currentUser && this.currentUser.userDetails) {
                if (this.currentUser.userDetails.interests?.indexOf(';') >= 0) {
                    this.currentUser.userDetails.interestsArray = value.userDetails.interests.split(', ');
                } else this.currentUser.userDetails.interestsArray = [];

                if (this.currentUser.userDetails.languages?.indexOf(';') >= 0) {
                    this.currentUser.userDetails.languagesArray = value.userDetails.languages.split(', ');
                } else this.currentUser.userDetails.languagesArray = [];

                for (let index = 0; index < this.currentUser.userDetails.achievements.length; index++) {
                    this.currentUser.userDetails.achievements[index].isDetailsVisible = false;
                }

                let userAchievements = this.currentUser.userDetails.achievements;
                this.currentUser.userDetails.achievements = this.getSortedAchievements(userAchievements);

                this.setProfilePicturePath();
            }
        }
    }

    @Input() isComponentVisible: boolean;
    @Output() isComponentShouldBeHidden: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() updatedCurrentUser: EventEmitter<User> = new EventEmitter<User>();

    @ViewChild('profileName') profileNameElement: ElementRef;
    @ViewChild('profileAge') profileAgeElement: ElementRef;
    @ViewChild('profilePictureStatus') profilePictureStatusElement: ElementRef;

    currentUser: User;

    closePopupIcon = faWindowClose;
    telegramIcon = faTelegram;
    discordIcon = faDiscord;
    achievementIcon = faTrophy;
    friendIcon = faUser;
    editIcon = faPen;
    confirmEditIcon = faCheck;
    cancelEditIcon = faTimes;

    timeStamp: number;
    profilePicturePath: string;

    isDOMContainsNewInterestFormClass: boolean;

    isProfileNameEditable: boolean;
    isProfileAgeEditable: boolean;

    isDiscordTagAnimationVisible: boolean;
    isTelegramAnimationVisible: boolean;

    isTimeZonePickerVisible: boolean;
    isToastNotificationVisible: boolean;
    toastNotificationWidth: number;
    toastNotificationContent: string;

    playClosePopupButtonAnimation: boolean;

    isDiscordEditorVisible: boolean;
    isTelegramEditorVisible: boolean;

    constructor(private userDetailsHub: UserDetailsHub, private userService: UserService, private profileService: UserDetailsService) {
        this.currentUser = new User();

        this.isDOMContainsNewInterestFormClass = false;

        this.isProfileNameEditable = false;
        this.isProfileAgeEditable = false;

        this.isDiscordTagAnimationVisible = false;
        this.isTelegramAnimationVisible = false;

        this.isTimeZonePickerVisible = false;
        this.toastNotificationContent = '';
        this.isToastNotificationVisible = false;

        this.playClosePopupButtonAnimation = false;

        this.isDiscordEditorVisible = false;
        this.isTelegramAnimationVisible = false;
    }

    ngOnInit(): void {
        this.userDetailsHub.startConnection();
        this.activateReceiveUpdatedAchievementListener();
    }

    activateReceiveUpdatedAchievementListener = () => {
        this.userDetailsHub.hubConnection.on('receiveUpdatedAchievement', (updatedAchievementJSON: string) => {
            let updatedAchievement = JSON.parse(updatedAchievementJSON) as Achievement;
            if (updatedAchievement) {
                updatedAchievement.isDetailsVisible = false;

                let index = this.currentUser.userDetails.achievements.findIndex(x => x.id === updatedAchievement.id);
                if (index >= 0) {
                    this.currentUser.userDetails.achievements[index] = updatedAchievement;

                    let userAchievements = this.currentUser.userDetails.achievements;

                    this.currentUser.userDetails.achievements = this.getSortedAchievements(userAchievements);

                    if (updatedAchievement.value === updatedAchievement.type.goal) {
                        let displayName = this.getAchievementDisplayName(updatedAchievement.id);

                        this.toastNotificationWidth = 350;
                        this.toastNotificationContent = 'New achievement "' + displayName + '" unlocked!';
                        this.activateToastNotification();
                    }
                }
            }
        });
    }

    activateToastNotification() {
        this.isToastNotificationVisible = true;

        setTimeout(() => {
            this.isToastNotificationVisible = false;
        }, 3000);
    }

    changeProfilePictureStatus(statusType: number) {
        let parentElement = this.profilePictureStatusElement.nativeElement.parentElement;

        switch (statusType) {
            case 0:
                this.profilePictureStatusElement.nativeElement.innerHTML = '';
                parentElement.firstChild.style.filter = 'brightness(100%)';
                break;
            case 1:
                this.profilePictureStatusElement.nativeElement.innerHTML = 'Change profile picture';
                parentElement.firstChild.style.filter = 'brightness(50%)';
                break;
        }
    }

    updateProfilePicture(event: any) {
        let fileList: FileList = event.target.files;
        if (fileList.length > 0) {
            let file: File = fileList[0];
            let formData = new FormData();
            formData.append(file.name.split('.')[0], file, file.name);

            let imageType = file.type.substring(file.type.indexOf('/') + 1) == 'jpeg'
                ? 'jpg' : file.type.substring(file.type.indexOf('/') + 1);

            if (imageType == 'png' || imageType == 'jpg' || imageType == 'gif') {
                this.profileService.updateProfilePicture(formData).subscribe(() => {
                    this.currentUser.userDetails.avatar = Constants.userStorageUrl + this.currentUser.id
                        + '/avatar.' + imageType;

                    this.setProfilePicturePath();
                    this.updatedCurrentUser.emit(this.currentUser);
                }, error => {
                    this.toastNotificationWidth = 350;
                    this.toastNotificationContent = 'An error occurred while loading. Try again later.';
                    this.isToastNotificationVisible = true;
                    setTimeout(() => {
                        this.isToastNotificationVisible = false;
                    }, 3000);
                });
            } else {
                this.toastNotificationWidth = 350;
                this.toastNotificationContent = 'Incorrect image type. Only PNG, JPEG and GIF are supported.';
                this.isToastNotificationVisible = true;
                setTimeout(() => {
                    this.isToastNotificationVisible = false;
                }, 3000);
            }
        }
    }

    setProfilePicturePath() {
        this.timeStamp = (new Date()).getTime();
        this.profilePicturePath = this.currentUser.userDetails.avatar;
    }

    getProfilePicturePath(): string {
        if (this.timeStamp) {
            return this.profilePicturePath + '?' + this.timeStamp;
        }

        return this.profilePicturePath;
    }

    applyUserDetailsChanges() {
        this.currentUser.userDetails.languages = this.currentUser.userDetails.languagesArray.join(', ');
        this.updatedCurrentUser.emit(this.currentUser);
        this.profileService.updateUserDetails(this.currentUser.userDetails).subscribe();

        this.isProfileAgeEditable = false;
        this.toastNotificationWidth = 350;
        this.toastNotificationContent = 'All changes were saved';
        this.isToastNotificationVisible = true;
        setTimeout(() => {
            this.isToastNotificationVisible = false;
        }, 2000);
    }

    applyUserChanges() {
        this.currentUser.name = this.profileNameElement.nativeElement.value;
        this.userService.updateUser(this.currentUser).subscribe(() => {
            this.updatedCurrentUser.emit(this.currentUser);
        });

        this.isProfileNameEditable = false;
        this.profileNameElement.nativeElement.blur();
    }

    addSpecifyInterestElement() {
        let newInterestFormElement = document.getElementsByClassName('new-interest-form');
        if (newInterestFormElement.length > 0) {
            // @ts-ignore
            let newInterest = newInterestFormElement[0].value;
            this.addNewInterest(newInterest);
        } else {
            if (!this.isDOMContainsNewInterestFormClass) {
                let addInterestButtonElement = document.getElementById('addInterestButton');

                let htmlElement = '<input placeholder="specify" class="new-interest-form">';
                if (addInterestButtonElement) {
                    addInterestButtonElement.insertAdjacentHTML('beforebegin', htmlElement);
                }

                this.isDOMContainsNewInterestFormClass = true;
            }
        }
    }

    removeInterest(interestToRemove: string, index: number) {
        this.currentUser.userDetails.interestsArray.splice(index, 1);
        this.currentUser.userDetails.interests = this.currentUser.userDetails.interestsArray.join(', ');

        this.applyUserDetailsChanges();
    }

    removeNewInterestFormFromDOM() {
        let activeElement = document.getElementsByClassName('new-interest-form');
        if (activeElement) activeElement[0].remove();
        this.isDOMContainsNewInterestFormClass = false;
    }

    rollbackNameChanges() {
        this.profileNameElement.nativeElement.value = this.currentUser.name;
        this.isProfileNameEditable = false;
    }

    rollbackAgeChanges() {
        let userDetails = this.currentUser.userDetails;

        this.profileAgeElement.nativeElement.value = userDetails.age ? userDetails.age : '';
        this.isProfileAgeEditable = false;
    }

    addNewInterest(newInterest: string | null) {
        if (newInterest) {
            this.currentUser.userDetails.interestsArray.push(newInterest);
            this.currentUser.userDetails.interests = this.currentUser.userDetails.interestsArray.join(', ');

            this.applyUserDetailsChanges();
            this.removeNewInterestFormFromDOM();
        }
    }

    getSortedAchievements(achievements: Achievement[]): Achievement[] {
        let filteredAchievements: Achievement[] = [];

        achievements.forEach(achievement => {
            if (achievement.value === achievement.type.goal) {
                filteredAchievements.unshift(achievement);

                let index = achievements.findIndex(x => x.id === achievement.id);
                if (index >= 0) achievements.splice(index, 1);
            }
        });

        achievements.forEach(achievement => filteredAchievements.push(achievement));
        return filteredAchievements;
    }

    getAchievementDisplayName(achievementId: number): string {
        let achievement = this.currentUser.userDetails.achievements.find(x => x.id === achievementId);
        if (!achievement) return '';

        let displayName = achievement.type.name;
        switch (achievement.type.rate) {
            case AchievementTypeRate.Ordinary:
                break;
            case AchievementTypeRate.Bronze:
                displayName += ' Tier 1';
                break;
            case AchievementTypeRate.Silver:
                displayName += ' Tier 2';
                break;
            case AchievementTypeRate.Gold:
                displayName += ' Tier 3';
                break;
        }

        return displayName;
    }

    selectLanguage(selectedLanguage: string) {
        let index = this.currentUser.userDetails.languagesArray.indexOf(selectedLanguage);
        if (index >= 0) this.currentUser.userDetails.languagesArray.splice(index, 1);
        else this.currentUser.userDetails.languagesArray.push(selectedLanguage);
    }
}
