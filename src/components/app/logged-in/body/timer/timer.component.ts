import { trigger, transition, style, sequence, animate, state } from "@angular/animations";
import { Component, DoCheck, ElementRef, HostListener, Input, KeyValueDiffer, KeyValueDiffers, OnInit, ViewChild } from "@angular/core";
import { faChevronUp, faChevronDown, faChevronLeft, faChevronRight, faCog, faSearch, faEllipsisH, faTimes, faStopwatch, faCheck, faQuestion } from "@fortawesome/free-solid-svg-icons";

import { TaskService } from "src/services/api/task.service";
import { UserService } from "src/services/api/user.service";
import { PlantService } from "src/services/api/plant.service";
import { TaskHelper } from "src/services/helpers/task.helper";
import { PlantExperienceHelper } from "src/services/helpers/plant-experience.helper";

import { Task } from "src/models/entities/task.model";
import { Timer } from "src/models/entities/timer.model";
import { UserSettings } from "src/models/entities/user-settings.model";
import { TimerMode, TimerSettings, TimerType } from "src/models/settings/timer-settings.model";
import { Session } from "src/models/entities/session.model";
import { TimerHub } from "src/services/hubs/timer.hub";
import { SessionMember } from "src/models/views/session-member.model";
import { SessionService } from "src/services/api/session.service";
import { SetReadyStatusForJoinedMemberRequest } from "src/models/requests/session/set-ready-status-for-joined-member-request.model";
import { SoranaPopupButtonType } from "src/models/enums/sorana-popup-button-type.enum";
import { ChangeSessionMemberTaskRequest } from "src/models/requests/session/change-session-member-task-request.model";
import { ExperienceChangingType } from "src/models/enums/experience-changing-type.enum";
import { ExperienceReasonType } from "src/models/enums/experience-reason-type.enum";
import { DateTimeHelper } from "src/services/helpers/date-time.helper";
import * as moment from "moment";

@Component({
    selector: 'timer',
    templateUrl: 'timer.component.html',
    styleUrls: ['timer.component.css'],
    animations: [
        trigger('changeActiveTimerIndicator', [
            transition('* => true', [
                style({ opacity: 1 }),
                sequence([
                    animate('1s ease',
                        style({ opacity: 0.5 }))
                ]),
                sequence([
                    animate('1s ease',
                        style({ opacity: 1 }))
                ])
            ]),
            transition('true => false', [
                sequence([
                    animate('1s ease',
                        style({ opacity: 0.5 }))
                ]),
                sequence([
                    animate('1s ease',
                        style({ opacity: 1 }))
                ])
            ]),
            state('true', style({ opacity: 1 })),
            state('false', style({ opacity: 1 }))
        ])
    ]
})
export class TimerComponent implements OnInit, DoCheck {
    @Input() currentUserId: string | undefined;
    @Input() currentUserTimeZone: string;

    @Input() set receivedTask(value: Task) {
        if (value) {
            this.currentTask = this.taskHelper.map(value);

            if (!this.activeSession) {
                this.initializeTimerAndWidget();
            } else if (this.timer) {
                this.timer.currentTask = this.currentTask;
                this.changeSessionMemberTask();
            }
        }
    }

    @Input() set receivedUserSettings(value: UserSettings | undefined) {
        if (value) {
            this.userSettings = value;
            this.timerSettings = JSON.parse(this.userSettings.timerSettings);
        }
    }

    @ViewChild('timerSwitch') timerSwitchElement: ElementRef;

    get soranaPopupButtonTypeBase(): typeof SoranaPopupButtonType {
        return SoranaPopupButtonType;
    }

    differ: KeyValueDiffer<string, any>;

    //#region Enums

    get timerModeBase(): typeof TimerMode {
        return TimerMode;
    }
    get timerTypeBase(): typeof TimerType {
        return TimerType;
    }

    get momentBase(): typeof moment {
        return moment;
    }

    //#endregion

    //#region Icons

    findTasksIcon = faSearch;
    queryInProgressIcon = faEllipsisH;
    taskTimerUpIcon = faChevronUp;
    taskTimerDownIcon = faChevronDown;
    showTrackedTasksIcon = faChevronRight;
    chooseAnotherTaskIcon = faTimes;
    timerIcon = faStopwatch;
    timerGuideIcon = faQuestion;
    settingsIcon = faCog;
    hideLeftIcon = faChevronLeft;
    sessionMemberIsReadyIcon = faCheck;

    //#endregion

    //#region Flags

    isQueryInProgress: boolean;
    isNothingFound: boolean;
    isTimerSettingsVisible: boolean;

    isTimerGuideVisible: boolean;
    isTimerModeGuideVisible: boolean;
    isTimerTypeGuideVisible: boolean;

    //#endregion

    taskNameQuery: string;
    tasksByQuery: Task[];

    currentTask?: Task;
    currentUserPlantId: number;

    timer: Timer;

    //#region SessionTimer

    activeSession: Session | undefined;
    activeSessionMembers: SessionMember[];
    isSessionErrorVisible: boolean = false;
    sessionErrorTitle: string;
    sessionErrorContent: string;

    //#endregion

    activeTimerIndicatorTrigger: boolean | null;

    userSettings: UserSettings;
    timerSettings: TimerSettings;

    windowWidth: number;

    constructor(private differs: KeyValueDiffers, private timerHub: TimerHub, private dateTimeHelper: DateTimeHelper,
        private sessionService: SessionService, private userService: UserService, private taskService: TaskService,
        private plantService: PlantService, private plantExperienceHelper: PlantExperienceHelper, private taskHelper: TaskHelper) {
        this.activeTimerIndicatorTrigger = null;
        this.tasksByQuery = [];
        this.taskNameQuery = '';

        this.isQueryInProgress = false;
        this.isNothingFound = false;

        this.isTimerGuideVisible = false;
        this.isTimerModeGuideVisible = false;
        this.isTimerTypeGuideVisible = false;

        this.differ = this.differs.find({}).create();
        this.isTimerSettingsVisible = false;

        this.plantService.get().subscribe(x => {
            if (x) {
                this.currentUserPlantId = x.id;
                this.plantExperienceHelper.plantId = this.currentUserPlantId;
            }
        })
    }

    ngOnInit(): void {
        this.getWindowSize();

        this.timerHub.startConnection();
        this.activateReceiveActiveSessionListener();
        this.activateReceiveSessionMemberListener();
        this.activateReceiveCancelledSessionListener();
        this.activateReceiveStartSessionTriggerListener();
    }

    ngDoCheck() {
        const timerChange = this.differ.diff(this.timer);
        if (timerChange) {
            timerChange.forEachChangedItem(item => {
                if (item.key == 'isCompleted' && item.previousValue == false && item.currentValue == true) {
                    this.sendChangePlantExperienceRequest();
                }

                if (item.key == 'isInterrupted' && item.previousValue == false && item.currentValue == true) {
                    this.applyTrackedTime();

                    if (this.timerSettings.mode == TimerMode.Easy && !this.activeSession) {
                        this.sendChangePlantExperienceRequest();
                    }
                }
            });
        }
    }

    @HostListener('window:resize', ['$event'])
    getWindowSize() {
      this.windowWidth = window.innerWidth;
    }

    //#region TimerHub

    activateReceiveActiveSessionListener = () => {
        this.timerHub.hubConnection.on('receiveActiveSession', async (joinedSessionJson: string) => {
            this.activeSession = JSON.parse(joinedSessionJson) as Session;
            this.activeSession.creationDate = this.dateTimeHelper
                .convertDateToUserTimeZone(new Date(this.activeSession.creationDateString), this.currentUserTimeZone);

            this.activeSession.startDate = this.dateTimeHelper
                .convertDateToUserTimeZone(new Date(this.activeSession.startDateString), this.currentUserTimeZone);

            this.activeSession.endDate = this.dateTimeHelper
                .convertDateToUserTimeZone(new Date(this.activeSession.endDateString), this.currentUserTimeZone);

            this.activeSessionMembers = JSON.parse(this.activeSession.sessionMembersJSON) as SessionMember[];

            await this.initializeTimerByType();
            this.activeSessionStartTimeListener();
        });
    }

    activateReceiveCancelledSessionListener = () => {
        this.timerHub.hubConnection.on('receiveCancelledSessionId', (sessionId: number) => {
            if (this.activeSession && this.activeSession.id === sessionId) {

                if (this.activeSession.ownerId === this.currentUserId) {
                    this.sessionErrorContent = 'You cancelled the study session and '
                        + "member's plants have got the damadge. Try to be more disciplined next time.";
                } else {
                    let ownerName = this.activeSessionMembers.find(x => x.userId === this.activeSession?.ownerId)?.name;

                    this.sessionErrorContent = 'Your active group session was canceled by the owner. '
                        + 'Connect with ' + ownerName + ' to get more details.';
                }

                this.sessionErrorTitle = 'Session was cancelled';
                this.isSessionErrorVisible = true;

                this.cleanSession();
            }
        });
    }

    activateReceiveSessionMemberListener = () => {
        this.timerHub.hubConnection.on('receiveSessionMember', (jsonData: string) => {
            let sessionMember = JSON.parse(jsonData) as SessionMember;

            if (sessionMember && this.activeSession && this.activeSessionMembers) {
                let index = this.activeSessionMembers.findIndex(x => x.userId === sessionMember.userId);

                if (index >= 0) {
                    sessionMember.reconnectionTimeout = (this.activeSessionMembers[index].reconnectionTimeout === undefined
                        || (this.activeSessionMembers[index].reconnectionTimeout >= 0 && !sessionMember.isDisconnected))
                        ? 15 : this.activeSessionMembers[index].reconnectionTimeout;

                    sessionMember.isActivityDetailsVisible = false;

                    this.activeSessionMembers[index] = sessionMember;

                    if (sessionMember.userId === this.currentUserId && !this.timer?.isActive) {
                        let currentDate = (new Date).getTime();
                        let activeSessionStartDate = (new Date(this.activeSession.startDate)).getTime();
                        let activeSessionEndDate = (new Date(this.activeSession.endDate)).getTime();

                        if (currentDate > activeSessionStartDate && currentDate < activeSessionEndDate) {

                            let durationInMilliseconds = Math.abs(activeSessionEndDate - currentDate);
                            if (durationInMilliseconds > 0) {
                                let durationMinutes = Math.floor(durationInMilliseconds / 60000);
                                let durationSeconds = Math.floor((durationInMilliseconds % 60000) / 1000);
                                let durationHours = 0;

                                while (durationMinutes >= 60) {
                                    durationMinutes -= 60;
                                    durationHours++;
                                }

                                //this.initializeTimerByType(durationHours, durationMinutes, durationSeconds);
                            }
                        }
                    }
                }
            }
        });
    }

    activateReceiveStartSessionTriggerListener = () => {
        this.timerHub.hubConnection.on('receiveStartSessionTrigger', (trigger: boolean) => {
            // if (trigger) {
            //     this.isTimerSettingsVisible = false;
            //     this.activeTimerIndicatorTrigger = true;

            //     this.timer.start();
            //     //this.activeMembersReconnectionTimeoutListener();
            // }
        });
    }

    //#endregion

    activeMembersReconnectionTimeoutListener = () => {
        var interval = setInterval(async () => {
            for (let index = 0; index < this.activeSessionMembers.length; index++) {
                if (this.activeSessionMembers[index].isDisconnected) {
                    if (this.activeSessionMembers[index].reconnectionTimeout > 0) {
                        this.activeSessionMembers[index].reconnectionTimeout--;
                    } else {
                        clearInterval(interval);
                        this.timer.stop();
                        await this.showInterruptedSessionError(this.activeSessionMembers[index]);

                        this.cleanSession();

                        if (this.activeSession && this.currentUserId == this.activeSession.ownerId) {
                            var request = this.plantExperienceHelper.getChangePlantExperienceRequestBySession(
                                ExperienceChangingType.Reduce, ExperienceReasonType.Session_Interrupted,
                                this.activeSession.id, this.currentUserPlantId);

                            request.guiltyMemberId = this.activeSessionMembers[index].userId;
                            this.plantService.changeExperience(request).subscribe();
                        }
                    }
                }
            }
        }, 1000);
    }

    activeSessionStartTimeListener = () => {
        var interval = setInterval(() => {
            let currentDate = this.dateTimeHelper.getCurrentDate(this.currentUserTimeZone, false);
            currentDate.setSeconds(0);

            if (this.activeSession && !this.timer.isActive) {

                let sessionMember = this.activeSessionMembers.find(x => x.userId === this.currentUserId);
                if (sessionMember?.isJoined && sessionMember.isReady) {
                    this.startTimer();
                    clearInterval(interval);
                } else {
                    let startDate = this.dateTimeHelper
                        .convertDateToUserTimeZone(this.activeSession.startDate, this.currentUserTimeZone);

                    startDate.setSeconds(0);

                    if (currentDate.getTime() === startDate.getTime()) {
                        this.startTimer();
                        clearInterval(interval);
                    } else if (currentDate.getTime() > startDate.getTime()) {
                        this.stopSessionTimer();
                        clearInterval(interval);
                    }

                }
            } else clearInterval(interval);

        }, 5000);
    }

    async initializeTimerAndWidget() {
        await this.initializeTimerByType();
    }

    cleanSession() {
        this.activeSession = undefined;
        this.activeSessionMembers = [];
        this.currentTask = undefined;
    }

    async showInterruptedSessionError(guiltySessionMember: SessionMember) {
        this.sessionErrorContent = 'Your active group session was interrupted, because '
            + guiltySessionMember.name + ' has left the session and did not connect again.'
            + 'Connect with your friend to get more details.';

        this.sessionErrorTitle = 'Session was interrupted';
        this.isSessionErrorVisible = true;
    }

    saveTimerSettings() {
        this.initializeTimerByType();

        this.userSettings.timerSettings = JSON.stringify(this.timerSettings);
        this.userService.updateSettings(this.userSettings).subscribe();
    }

    changeSessionMemberTask() {
        if (this.activeSession && this.currentTask) {
            var request = new ChangeSessionMemberTaskRequest;
            request.taskId = this.currentTask.id;
            request.taskName = this.currentTask.name;
            request.sessionId = this.activeSession?.id;

            this.sessionService.changeTrackedTask(request).subscribe();
        }
    }

    async initializeTimerByType(hours: number | null = null, minutes: number | null = null, seconds: number | null = null) {
        if (this.timerSettings && (this.currentTask || this.activeSession)) {
            if (hours != null && minutes != null && seconds != null) {
                this.timer = new Timer(hours, minutes, seconds, this.timerSettings.mode, this.timerSettings.type);
            } else {
                switch (this.timerSettings.type) {
                    case TimerType.Manual:
                        let timerHours = 0;
                        let timerMinutes = 0;

                        if (this.activeSession) {
                            let activeSessionDuration = this.activeSession.duration;

                            while (activeSessionDuration - 60 >= 0) {
                                timerHours++;
                                activeSessionDuration -= 60;
                            }

                            timerMinutes = activeSessionDuration;
                        }

                        this.timer = new Timer(timerHours, timerMinutes, 0, this.timerSettings.mode, this.timerSettings.type);
                        break;
                    case TimerType.Pomodoro:
                        this.timer = new Timer(0, 25, 0, this.timerSettings.mode, this.timerSettings.type);
                        break;
                }
            }

            if (this.currentTask) this.timer.currentTask = this.currentTask;
        }
    }

    sendChangePlantExperienceRequest() {
        let trackedMinutes = this.timer.trackedMinutes;

        if (trackedMinutes >= 10 && this.currentTask) {
            let request = this.plantExperienceHelper
                .getChangePlantExperienceRequestByTask(this.currentTask?.id, ExperienceChangingType.Rise,
                    ExperienceReasonType.Task_TrackedTime, trackedMinutes);

            this.plantService.changeExperience(request).subscribe();
        }
    }

    applyTrackedTime() {
        if (this.timer.trackedMinutes > 0 && this.currentTask) {
            this.currentTask.trackedTime += this.timer.trackedMinutes;
            this.taskService.update(this.currentTask).subscribe();
        }
    }

    findTasks() {
        this.isNothingFound = false;
        this.isQueryInProgress = true;

        this.taskService.findByName(this.taskNameQuery).subscribe(x => {
            this.isQueryInProgress = false;

            if (x.length > 0) {
                this.taskNameQuery = '';
                this.tasksByQuery = x;
            } else this.isNothingFound = true;
        });
    }

    checkActiveTimerIndicator() {
        this.activeTimerIndicatorTrigger = !this.timer?.isActive ? null
            : (this.activeTimerIndicatorTrigger ? false : true);
    }

    startTimer() {
        // if (this.activeSession && this.activeSessionMembers) {
        //     this.sessionService.start(this.activeSession.id).subscribe();
        // } else {
        //     this.isTimerSettingsVisible = false;
        //     this.timer.start();
        //     this.activeTimerIndicatorTrigger = true;
        // }

        this.timer.start();
        this.activeTimerIndicatorTrigger = true;

        let hackTimerTriggerInterval = setInterval(() => {
            if (this.timerSwitchElement && this.timer.isActive) {
                this.timerSwitchElement.nativeElement.click();
            } else clearInterval(hackTimerTriggerInterval);
        }, 1000);
    }

    isStartButtonDisabled(): boolean {
        return this.timer?.isActive || (this.timer?.minutes === 0 && this.timer?.hours === 0) || !this.currentTask;
    }

    areAllSessionMembersReady(): boolean {
        return this.activeSessionMembers.filter(x => x.isReady)?.length === this.activeSessionMembers?.length;
    }

    getSessionMember(sessionMemberId: string | undefined): SessionMember | undefined {
        if (this.activeSessionMembers && sessionMemberId) {
            return this.activeSessionMembers.find(x => x.userId === sessionMemberId);
        } else return undefined;
    }

    setReadyStatusInSession(setReadyStatusButton: any) {
        var sessionMemberIndex = this.activeSessionMembers?.findIndex(x => x.userId === this.currentUserId);

        if (this.activeSession && sessionMemberIndex >= 0) {
            setReadyStatusButton.innerText = 'Processing...';
            setReadyStatusButton.disabled = true;

            let request = new SetReadyStatusForJoinedMemberRequest;
            request.isReady = !this.activeSessionMembers[sessionMemberIndex].isReady;
            request.sessionId = this.activeSession.id;
            request.userId = this.currentUserId as string;

            this.sessionService.setReadyStatusForJoinedMember(request).subscribe(() => {
                setReadyStatusButton.disabled = false;
                setReadyStatusButton.innerText = request.isReady ? 'Not ready' : 'Ready';
            });
        }
    }

    stopSessionTimer() {
        this.timer.stop();

        if (this.activeSession && this.currentUserId == this.activeSession.ownerId) {
            var request = this.plantExperienceHelper.getChangePlantExperienceRequestBySession(
                ExperienceChangingType.Reduce, ExperienceReasonType.Session_Canceled,
                this.activeSession.id, this.currentUserPlantId);

            request.guiltyMemberId = this.activeSession.ownerId;
            this.plantService.changeExperience(request).subscribe();
        }
    }

    // isDisconnectedUsersWarningVisible(): boolean {
    //     return this.timer?.isActive && this.activeSessionMembers?.filter(x => x.isDisconnected).length > 0;
    // }
}
