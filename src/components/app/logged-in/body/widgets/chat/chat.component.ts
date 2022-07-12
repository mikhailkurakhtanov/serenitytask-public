import { Component, Input, OnInit } from "@angular/core";
import {
    faBars, faChevronUp, faChevronDown, faChevronLeft, faChevronRight, faCommentAlt, faHandPaper, faThumbsUp, faThumbsDown,
    faCalendarDay, faQuestion, faClock, faEyeSlash, faUndo,
} from "@fortawesome/free-solid-svg-icons";

import { faTelegram, faDiscord } from "@fortawesome/free-brands-svg-icons";

import * as moment from "moment";

import { DxDateBoxComponent } from "devextreme-angular";
import { SessionRequest } from "src/models/entities/session-request.model";
import { ChatPreview } from "src/models/views/chat-preview.model";
import { FriendInfo } from "src/models/views/friend-info.model";
import { SelectedChat } from "src/models/views/selected-chat.model";
import { ChatHub } from "src/services/hubs/chat.hub";
import { User } from "src/models/entities/user.model";
import { UserNotification, UserNotificationType } from "src/models/entities/user-notification.model";
import { UserNotificationService } from "src/services/api/user-notification.service";
import { SessionService } from "src/services/api/session.service";
import { Session } from "src/models/entities/session.model";
import { TimerMode, TimerSettings } from "src/models/settings/timer-settings.model";
import { DateTimeHelper } from "src/services/helpers/date-time.helper";
import { UserService } from "src/services/api/user.service";

@Component({
    selector: 'chat',
    templateUrl: 'chat.component.html',
    styleUrls: ['chat.component.css']
})
export class ChatComponent implements OnInit {
    @Input() set receivedCurrentUser(value: User) {
        if (value && value.userDetails.timeZone) {
            this.currentUser = value;
            this.currentUserTimeZone = this.currentUser.userDetails.timeZone.timeZoneIdIANA;

            this.currentDate = this.dateTimeHelper.getCurrentDate(this.currentUserTimeZone);
            this.sessionDate = this.currentDate;

            this.sessionService.getFriendsAndSessionRequests().subscribe(x => {
                if (x) {
                    this.friendsInfo = x.friendsInfo as FriendInfo[];
                    this.chats = x.sessionRequests as SessionRequest[][];

                    if (this.chats.length > 0 && this.friendsInfo.length > 0) {
                        for (let index = 0; index < this.chats.length; index++) {
                            for (let requestIndex = 0; requestIndex < this.chats[index].length; requestIndex++) {
                                this.chats[index][requestIndex].sendingDate = this.dateTimeHelper
                                    .convertDateToUserTimeZone(new Date(this.chats[index][requestIndex].sendingDateString), this.currentUserTimeZone);

                                this.chats[index][requestIndex].start = this.dateTimeHelper
                                    .convertDateToUserTimeZone(new Date(this.chats[index][requestIndex].startString), this.currentUserTimeZone);

                                this.chats[index][requestIndex].end = this.dateTimeHelper
                                    .convertDateToUserTimeZone(new Date(this.chats[index][requestIndex].endString), this.currentUserTimeZone);
                            }

                            let sessionRequests = this.chats[index];

                            let friendInfo = sessionRequests[0].receiverId === this.currentUser.id
                                ? this.friendsInfo.find(x => x.friendId === sessionRequests[0].senderId)
                                : this.friendsInfo.find(x => x.friendId === sessionRequests[0].receiverId);

                            if (friendInfo && sessionRequests.length > 0) {
                                let chatPreview = new ChatPreview();
                                chatPreview.friendInfo = friendInfo;
                                chatPreview.sessionRequests = sessionRequests;

                                this.chatsPreviews.push(chatPreview);
                            }
                        }
                    }
                }

                this.isComponentLoaded = true;
            });
        }
    }

    currentUser: User;
    currentUserTimeZone: string;

    //#region Icons

    telegramIcon = faTelegram;
    discordIcon = faDiscord;

    hideWidgetIcon = faChevronRight;
    showWidgetIcon = faCommentAlt;

    closeActiveChatIcon = faChevronLeft;
    activeChatMenuIcon = faBars;

    sayHelloIcon = faHandPaper;
    chooseSessionDateIcon = faCalendarDay;
    askQuestionIcon = faQuestion;
    agreementIcon = faThumbsUp;
    disagreementIcon = faThumbsDown;
    clockIcon = faClock;
    sendMessageIcon = faChevronRight;

    riseTimeIcon = faChevronUp;
    reduceTimeIcon = faChevronDown;
    isSelectTimePickerVisible: boolean;

    unreadChatMessageIcon = faEyeSlash;
    undoIcon = faUndo;

    //#endregion

    isWidgetVisible: boolean;
    isComponentLoaded: boolean;

    sessionDate: Date;
    currentDate: Date;

    friendsInfo: FriendInfo[];
    chatsPreviews: ChatPreview[];

    chats: SessionRequest[][];

    selectedSessionHoursForRequest: number;
    selectedSessionMinutesForRequest: number;

    selectedChat: SelectedChat | undefined;

    newSessionRequest: SessionRequest;
    newSessionRequestConfirmationMessage: string;
    isNewSessionRequestConfirmationPopupVisible: boolean;

    toastNotificationContent: string;
    isToastNotificationVisible: boolean;

    constructor(private chatHub: ChatHub, private sessionService: SessionService, private userService: UserService,
        private userNotificationService: UserNotificationService, private dateTimeHelper: DateTimeHelper) {
        this.chats = [];
        this.friendsInfo = [];
        this.chatsPreviews = [];

        this.isSelectTimePickerVisible = false;
    }

    ngOnInit() {
        this.isWidgetVisible = false;
        this.isToastNotificationVisible = false;

        this.chatHub.startConnection();
        this.activateReceiveNewChatMessageListener();
        this.activateReceiveReadChatMessageListener();
        this.activateReceiveRejectedSessionRequestListener();
        this.activateReceiveFriendStatusChangesListener();
        this.activateReceiveNewFriendListener();
        this.activateReceiveRemovedFriendIdListener();
    }

    //#region ChatHub

    activateReceiveNewChatMessageListener = () => {
        this.chatHub.hubConnection.on('receiveNewSessionRequest', (newSessionRequestJson: string) => {
            let newSessionRequest = JSON.parse(newSessionRequestJson) as SessionRequest;

            newSessionRequest.sendingDate = this.dateTimeHelper
                .convertDateToUserTimeZone(new Date(newSessionRequest.sendingDateString), this.currentUserTimeZone);

            newSessionRequest.start = this.dateTimeHelper
                .convertDateToUserTimeZone(new Date(newSessionRequest.startString), this.currentUserTimeZone);

            newSessionRequest.end = this.dateTimeHelper
                .convertDateToUserTimeZone(new Date(newSessionRequest.endString), this.currentUserTimeZone);

            let friendInfo = this.friendsInfo
                .find(x => x.friendId === newSessionRequest.receiverId || x.friendId === newSessionRequest.senderId);

            let indexOfChat = this.chats.findIndex(x => x.find(x =>
                (x.receiverId == newSessionRequest.receiverId && x.receiverId !== this.currentUser.id)
                || (x.senderId == newSessionRequest.senderId && x.senderId !== this.currentUser.id)));

            if (indexOfChat >= 0) {
                this.chats[indexOfChat].push(newSessionRequest);
            } else {
                let newChat = [];
                newChat.push(newSessionRequest);
                this.chats.unshift(newChat);

                if (friendInfo) {
                    // adding new message to selected chat
                    if (this.selectedChat && this.selectedChat.friendInfo.friendId === friendInfo.friendId) {
                        this.selectedChat.sessionRequests = newChat;
                    }
                }
            }

            // adding new chat message to the chats preview by friend id (receiver or sender) or create new preview
            let chatPreviewIndex = this.chatsPreviews.findIndex(x =>
                (x.friendInfo.friendId === newSessionRequest.receiverId
                    && newSessionRequest.receiverId != this.currentUser.id)
                || (x.friendInfo.friendId === newSessionRequest.senderId
                    && newSessionRequest.senderId != this.currentUser.id));

            if (chatPreviewIndex >= 0) {
                this.chatsPreviews[chatPreviewIndex].sessionRequests.push(newSessionRequest);
            } else {
                if (friendInfo) {
                    let newSessionRequestPreview = new ChatPreview;
                    newSessionRequestPreview.friendInfo = friendInfo;
                    newSessionRequestPreview.sessionRequests.push(newSessionRequest);

                    this.chatsPreviews.unshift(newSessionRequestPreview);
                }
            }
        });
    }

    activateReceiveReadChatMessageListener = () => {
        this.chatHub.hubConnection.on('receiveReadSessionRequest', (readSessionRequestJson: string) => {
            let readSessionRequest = JSON.parse(readSessionRequestJson) as SessionRequest;

            readSessionRequest.sendingDate = this.dateTimeHelper
                .convertDateToUserTimeZone(new Date(readSessionRequest.sendingDateString), this.currentUserTimeZone);

            readSessionRequest.start = this.dateTimeHelper
                .convertDateToUserTimeZone(new Date(readSessionRequest.startString), this.currentUserTimeZone);

            readSessionRequest.end = this.dateTimeHelper
                .convertDateToUserTimeZone(new Date(readSessionRequest.endString), this.currentUserTimeZone);

            // replacing chat message in to the chat by friend Id (reciever or sender)
            let indexOfChat = this.chats.findIndex(x => x.find(x =>
                (x.receiverId == readSessionRequest.receiverId && x.receiverId !== this.currentUser.id)
                || (x.senderId == readSessionRequest.senderId && x.senderId !== this.currentUser.id)));

            if (indexOfChat >= 0) {
                let indexOfChatMessage = this.chats[indexOfChat].findIndex(x => x.id === readSessionRequest.id);
                if (indexOfChatMessage >= 0) this.chats[indexOfChat][indexOfChatMessage] = readSessionRequest;

                // checking and replacing chat preview if the read chat message is the last
                let indexOfChatPreview = this.chatsPreviews.findIndex(x => x.friendInfo.friendId ===
                    (readSessionRequest.senderId !== this.currentUser.id
                        ? readSessionRequest.senderId : readSessionRequest.receiverId));

                let indexOfReadedRequest = this.chatsPreviews[indexOfChatPreview].sessionRequests
                    .findIndex(x => x.id === readSessionRequest.id);

                if (indexOfChatMessage >= 0 && indexOfReadedRequest >= 0)
                    this.chatsPreviews[indexOfChatPreview].sessionRequests[indexOfReadedRequest] = readSessionRequest;
            }
        });
    }

    activateReceiveRejectedSessionRequestListener = () => {
        this.chatHub.hubConnection.on('receiveRejectedSessionRequest', (rejectedSessionRequestJson: string) => {
            let rejectedSessionRequest = JSON.parse(rejectedSessionRequestJson) as SessionRequest;

            let indexOfChat = this.chats.findIndex(x => x.find(x =>
                (x.receiverId == rejectedSessionRequest.receiverId && x.receiverId !== this.currentUser.id)
                || (x.senderId == rejectedSessionRequest.senderId && x.senderId !== this.currentUser.id)));

            if (indexOfChat >= 0) {
                let indexOfChatMessage = this.chats[indexOfChat].findIndex(x => x.id === rejectedSessionRequest.id);
                if (indexOfChatMessage >= 0) this.chats[indexOfChat].splice(indexOfChatMessage, 1);

                let indexOfChatPreview = this.chatsPreviews.findIndex(x => x.friendInfo.friendId ===
                    (rejectedSessionRequest.senderId !== this.currentUser.id
                        ? rejectedSessionRequest.senderId : rejectedSessionRequest.receiverId));

                let indexOfReadedRequest = this.chatsPreviews[indexOfChatPreview].sessionRequests
                    .findIndex(x => x.id === rejectedSessionRequest.id);

                if (indexOfChatMessage >= 0 && indexOfReadedRequest >= 0)
                    this.chatsPreviews[indexOfChatPreview].sessionRequests.splice(indexOfReadedRequest, 1);

                if (this.chatsPreviews[indexOfChatPreview].sessionRequests.length === 0)
                    this.selectedChat = undefined;
            }
        });
    }

    activateReceiveFriendStatusChangesListener = () => {
        this.chatHub.hubConnection.on('receiveFriendStatusChanges', (friendInfoJson: string) => {
            let friendInfo = JSON.parse(friendInfoJson) as FriendInfo;
            if (friendInfo) {
                let index = this.friendsInfo.findIndex(x => x.friendId === friendInfo.friendId);
                if (index >= 0) this.friendsInfo[index] = friendInfo;
            }
        });
    }

    activateReceiveNewFriendListener = () => {
        this.chatHub.hubConnection.on('receiveNewFriend', (newFriendInfoJson: string) => {
            let newFriendInfo = JSON.parse(newFriendInfoJson) as FriendInfo;
            if (newFriendInfo) this.friendsInfo.unshift(newFriendInfo);
        });
    }

    activateReceiveRemovedFriendIdListener = () => {
        this.chatHub.hubConnection.on('removeFriend', (removedFriendId: string) => {

            if (this.selectedChat) {
                if (this.selectedChat.friendInfo.friendId == removedFriendId) this.selectedChat = undefined;
            }

            if (this.friendsInfo.length > 0) {
                let removedFriendInfoIndex = this.friendsInfo.findIndex(x => x.friendId == removedFriendId);
                if (removedFriendInfoIndex >= 0) this.friendsInfo.splice(removedFriendInfoIndex, 1);
            }

            if (this.chatsPreviews.length > 0) {
                let index = this.chatsPreviews.findIndex(x => x.friendInfo.friendId == removedFriendId);
                if (index >= 0) this.chatsPreviews.splice(index, 1);
            }

            if (this.chats.length > 0) {
                let index = this.chats.findIndex(x => x.find(x =>
                    x.receiverId === removedFriendId || x.senderId === removedFriendId));

                if (index >= 0) this.chats.splice(index, 1);
            }
        });
    }

    //#endregion

    //#region HTMLElements

    applyDatePickerCustomization(datePicker: DxDateBoxComponent) {
        // @ts-ignore
        let customizedElementId = datePicker.element.nativeElement.getAttribute('aria-owns');
        let customizedElement = document.getElementById(customizedElementId);
        let dateAndTimePickersElement = document.querySelector('.dx-datebox-datetime-time-side');
        if (dateAndTimePickersElement) {
            let timePickerPartElement = dateAndTimePickersElement
                .querySelector('.dx-box .dx-widget .dx-visibility-change-handler .dx-collection > .dx-item');
            if (timePickerPartElement) {
                let timePickerElement = timePickerPartElement.parentElement?.parentElement?.parentElement;
                if (timePickerElement) {
                    let partWithClockElement = customizedElement?.firstChild?.childNodes[1];
                    if (partWithClockElement) partWithClockElement.remove();

                    let partWithDateElement = customizedElement?.firstChild?.childNodes[0]
                    if (partWithDateElement) partWithDateElement.firstChild?.appendChild(timePickerElement);
                }
            }
        }
    }

    //#endregion

    applyNewSessionRequestDate(event: any) {
        this.newSessionRequest.start = event.value;
    }

    applyNewSessionRequestDuration() {
        this.newSessionRequest.duration = this.selectedSessionMinutesForRequest;

        if (this.selectedSessionHoursForRequest > 0) {
            let durationHoursToApply = this.selectedSessionHoursForRequest;

            while (durationHoursToApply > 0) {
                this.newSessionRequest.duration += 60;
                durationHoursToApply--;
            }
        }

        this.newSessionRequest.end = moment(this.newSessionRequest.start)
            .add(this.newSessionRequest.duration, 'm').toDate();
    }

    applyNewSessionConfirmationPopupContent() {
        let newSessionStartFormatted = moment(this.newSessionRequest.start).format('LLL');
        let newSessionEndFormatted = moment(this.newSessionRequest.end).format('LLL');
        this.newSessionRequestConfirmationMessage = 'Have you selected new session properties correctly?\n\n'
            + '<b>Start: </b>' + newSessionStartFormatted + '\n' + '<b>End: </b>' + newSessionEndFormatted + '\n'
            + '<b>Duration: </b>'
            + (this.selectedSessionHoursForRequest > 0 ? this.selectedSessionHoursForRequest.toString() + ' Hour ' : '')
            + (this.selectedSessionMinutesForRequest > 0 ? this.selectedSessionMinutesForRequest.toString() + ' Minutes' : '');

        this.isNewSessionRequestConfirmationPopupVisible = true;
    }

    rollbackNewSessionRequestDuration() {
        this.selectedSessionHoursForRequest = 0;
        this.selectedSessionMinutesForRequest = 0;

        if (this.newSessionRequest?.duration && this.newSessionRequest.duration > 0) {
            this.newSessionRequest.duration = 0;
        }
    }

    selectFriend(friendId: string) {
        this.newSessionRequest = new SessionRequest;
        this.newSessionRequest.isRead = false;
        this.newSessionRequest.senderId = this.currentUser.id;
        this.newSessionRequest.receiverId = friendId;

        this.rollbackNewSessionRequestDuration();

        let selectedChat = new SelectedChat;
        selectedChat.isChatMenuVisible = false;

        let indexOfChat = this.chats.findIndex(x => x.find(x => x.receiverId === friendId || x.senderId === friendId));
        if (indexOfChat >= 0) selectedChat.sessionRequests = this.chats[indexOfChat];

        let friendInfo = this.friendsInfo.find(x => x.friendId === friendId);
        if (friendInfo) selectedChat.friendInfo = friendInfo;

        this.selectedChat = selectedChat;

        if (this.chats.length > 0) {
            let unreadChatMessages = this.chats[indexOfChat].filter(x => !x.isRead && x.senderId !== this.currentUser.id);
            if (unreadChatMessages.length > 0) {
                for (let index = 0; index < unreadChatMessages.length; index++) {
                    this.sessionService.readSessionRequest(unreadChatMessages[index].id).subscribe();
                }
            }
        }
    }

    getFriendsOnlineNumber(): number {
        return this.friendsInfo.filter(x => x.isUserOnline)?.length;
    }

    getSessionRequestDate(sessionRequestDate: Date): string {
        return moment(sessionRequestDate).format('LLL');
    }

    changeSessionRequestHours(rise: boolean) {
        if (rise) {
            this.selectedSessionHoursForRequest += 1;
        } else if (this.selectedSessionHoursForRequest > 0) {
            this.selectedSessionHoursForRequest -= 1;
        }
    }

    changeSessionRequestMinutes(rise: boolean) {
        if (rise) {
            if (this.selectedSessionMinutesForRequest === 55) {
                this.selectedSessionMinutesForRequest = 0;
                this.selectedSessionHoursForRequest += 1;
            } else this.selectedSessionMinutesForRequest += 5;
        } else if (this.selectedSessionMinutesForRequest > 0) this.selectedSessionMinutesForRequest -= 5;
    }

    getMessageSenderAvatarPath(sessionRequest: SessionRequest) {
        return sessionRequest.senderId == this.currentUser?.id
            ? '' : this.selectedChat?.friendInfo?.avatar
    }

    getMessageSenderName(sessionRequest: SessionRequest) {
        return sessionRequest.senderId == this.currentUser?.id
            ? '' : this.selectedChat?.friendInfo?.name;
    }

    getChatPreviewMessage(sessionRequests: SessionRequest[]): string {
        if (sessionRequests.length === 0) return 'No pending requests';
        if (sessionRequests.length === 1) return '1 pending request';

        return sessionRequests.length + ' peding requests';
    }

    getSessionRequestDurationFormatted(duration: number): string {
        if (duration <= 55) return duration + ' Minutes';

        let hours = 0;
        let minutes = 0;
        while (duration - 60 >= 0) {
            duration -= 60;
            hours++;
        }

        if (duration > 0) {
            minutes = duration;
            if (hours === 1) return hours + ' Hour ' + minutes + ' Minutes';
            else return hours + ' Hours ' + minutes + ' Minutes';
        }

        if (hours === 1) return hours + ' Hour';
        else return hours + ' Hours';
    }

    sendSessionDateRequest(isRequestConfirmed: boolean, friendInfo: FriendInfo | undefined) {
        this.isNewSessionRequestConfirmationPopupVisible = false;

        if (friendInfo && isRequestConfirmed
            && this.newSessionRequest.start && this.newSessionRequest.end && this.newSessionRequest.duration > 0) {

            this.newSessionRequest.startString = this.dateTimeHelper.convertDateToUtcString(this.newSessionRequest.start);
            this.newSessionRequest.endString = this.dateTimeHelper.convertDateToUtcString(this.newSessionRequest.end);

            this.sessionService.sendSessionRequest(this.newSessionRequest).subscribe();

            let newUserNotification = new UserNotification;
            newUserNotification.senderId = this.currentUser.id;
            newUserNotification.receiverId = friendInfo.friendId;
            newUserNotification.type = UserNotificationType.Message;

            this.userNotificationService.create(newUserNotification).subscribe();
        }
    }

    createSession(sessionRequest: SessionRequest) {
        let newSession = new Session;

        newSession.startDateString = this.dateTimeHelper.convertDateToUtcString(sessionRequest.start);
        newSession.endDateString = this.dateTimeHelper.convertDateToUtcString(sessionRequest.end);

        newSession.duration = sessionRequest.duration;
        newSession.ownerId = sessionRequest.senderId;

        var timerSettings: TimerSettings = JSON.parse(this.currentUser.userSettings.timerSettings);
        newSession.isHardModeActivated = timerSettings.mode === TimerMode.Hard;

        newSession.participantsIds = [];
        newSession.participantsIds.push(sessionRequest.receiverId);

        this.sessionService.create(newSession).subscribe();
        this.rejectSessionRequest(sessionRequest.id);
    }

    rejectSessionRequest(sessionRequestId: number) {
        this.sessionService.rejectSessionRequest(sessionRequestId).subscribe();
    }

    copyTextToClipboard(text: string) {
        navigator.clipboard.writeText(text);

        this.toastNotificationContent = 'Copied';
        this.isToastNotificationVisible = true;
        setTimeout(() => {
            this.isToastNotificationVisible = false;
        }, 1000);
    }

    removeFriend(friendId: string) {
        this.userService.removeUserFromFriendsList(friendId).subscribe();
    }
}