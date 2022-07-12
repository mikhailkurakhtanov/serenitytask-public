import * as moment from "moment";
import { Component, Input, OnInit } from "@angular/core";
import { faCalendarDay } from "@fortawesome/free-solid-svg-icons";
import { SessionService } from "src/services/api/session.service";
import { Session } from "src/models/entities/session.model";
import { User } from "src/models/entities/user.model";
import { TaskInterval } from "src/models/views/tasks-interval.model";
import { TaskHelper } from "src/services/helpers/task.helper";
import { SessionHub } from "src/services/hubs/session.hub";
import { SoranaPopupButtonType } from "src/models/enums/sorana-popup-button-type.enum";
import { DateTimeHelper } from "src/services/helpers/date-time.helper";

@Component({
  selector: 'calendar',
  templateUrl: 'calendar.component.html',
  styleUrls: ['calendar.component.css']
})
export class CalendarComponent implements OnInit {
  @Input() set receivedCurrentUser(value: User) {
    if (value) {
      this.currentUser = value;

      if (this.currentUser.userDetails?.timeZone) {
        this.currentUserTimeZone = this.currentUser.userDetails.timeZone.timeZoneIdIANA;
      }
    }
  }

  @Input() set receivedTaskInterval(value: TaskInterval) {
    if (value >= 0) {
      this.taskInterval = value;
      this.taskIntervalName = this.getTaskIntervalName();
      if (this.sessions.length > 0) this.applyTaskIntervalToSessions();
    }
  };

  get soranaPopupButtonTypeBase(): typeof SoranaPopupButtonType {
    return SoranaPopupButtonType;
  }

  plannerIcon = faCalendarDay;

  currentUser: User;

  currentUserTimeZone: string;

  currentDate: Date;
  taskIntervalName: string;
  taskInterval: TaskInterval;

  sessions: Session[];
  sessionsByInterval: Session[];

  isSessionErrorVisible: boolean;
  sessionErrorTitle: string;
  sessionErrorContent: string;

  constructor(private sessionService: SessionService, private taskHelper: TaskHelper,
    private dateTimeHelper: DateTimeHelper, private sessionHub: SessionHub) { }

  ngOnInit(): void {
    this.sessions = [];
    this.isSessionErrorVisible = false;

    this.sessionService.getAll().subscribe(async x => {
      for (let index = 0; index < x.length; index++) {
        x[index].isSessionReadyToStart = false;
        x[index].isUserJoined = false;

        await this.activateReceiveCurrentUserTimeZoneListener();

        this.currentDate = this.dateTimeHelper.getCurrentDate(this.currentUserTimeZone);

        x[index].creationDate = this.dateTimeHelper
          .convertDateToUserTimeZone(new Date(x[index].creationDateString), this.currentUserTimeZone);

        x[index].startDate = this.dateTimeHelper
          .convertDateToUserTimeZone(new Date(x[index].startDateString), this.currentUserTimeZone);

        x[index].endDate = this.dateTimeHelper
          .convertDateToUserTimeZone(new Date(x[index].endDateString), this.currentUserTimeZone);
      }
      this.sessions = x;

      this.taskInterval = 2;
      this.taskIntervalName = this.getTaskIntervalName();

      this.applyTaskIntervalToSessions();
      this.activateSessionsStartTimeListener();
    });

    this.sessionHub.startConnection();
    this.activateReceiveCreatedSessionListener();
    this.activateReceiveRemovedSessionId();
    this.activateReceiveJoinedSessionId();
    this.activateReceiveDisbandSessionId();
  }

  async activateReceiveCurrentUserTimeZoneListener() {
    let listener = setInterval(() => {
      if (this.currentUserTimeZone) clearInterval(listener);
    }, 250);
  }

  //#region SessionHub

  async activateReceiveCreatedSessionListener() {
    this.sessionHub.hubConnection.on('receiveCreatedSession', (createdSessionJson: string) => {
      let createdSession = JSON.parse(createdSessionJson) as Session;

      createdSession.creationDate = this.dateTimeHelper
        .convertDateToUserTimeZone(new Date(createdSession.creationDateString), this.currentUserTimeZone);

      createdSession.startDate = this.dateTimeHelper
        .convertDateToUserTimeZone(new Date(createdSession.startDateString), this.currentUserTimeZone);

      createdSession.endDate = this.dateTimeHelper
        .convertDateToUserTimeZone(new Date(createdSession.endDateString), this.currentUserTimeZone);

      if (createdSession) {
        this.sessions.push(createdSession);
        if (this.taskHelper.getDateIntervalByDate(createdSession.startDate, this.currentUserTimeZone) === this.taskInterval) {
          this.sessionsByInterval.push(createdSession);

          this.sessionsByInterval.sort(function (a, b) {
            return (new Date(b.startDate)).getTime() - (new Date(a.startDate)).getTime();
          });
        }
      }
    });
  }

  activateReceiveRemovedSessionId = () => {
    this.sessionHub.hubConnection.on('receiveRemovedSessionId', (leavedSessionId: number) => {
      if (leavedSessionId) {
        let mainIndex = this.sessions.findIndex(x => x.id === leavedSessionId);
        if (mainIndex >= 0) this.sessions.splice(mainIndex, 1);

        let intervalIndex = this.sessionsByInterval.findIndex(x => x.id === leavedSessionId);
        if (intervalIndex >= 0) this.sessionsByInterval.splice(intervalIndex, 1);
      }
    });
  }

  // Listener to apply joined status to current user on joining the session
  activateReceiveJoinedSessionId = () => {
    this.sessionHub.hubConnection.on('receiveJoinedSessionId', (joinedSessionId: number) => {
      let mainIndex = this.sessions.findIndex(x => x.id === joinedSessionId);
      if (mainIndex >= 0) this.sessions[mainIndex].isUserJoined = true;

      let selectedIndex = this.sessionsByInterval.findIndex(x => x.id === joinedSessionId);
      if (selectedIndex >= 0) this.sessionsByInterval[selectedIndex].isUserJoined = true;
    });
  }

  // Listener to detect and remove session which has disband by participant or owner
  activateReceiveDisbandSessionId = () => {
    this.sessionHub.hubConnection.on('receiveDisbandSessionId', (disbandSessionId: number) => {
      let mainIndex = this.sessions.findIndex(x => x.id === disbandSessionId);
      if (mainIndex >= 0) {
        let sessionStartDate = moment(new Date(this.sessions[mainIndex].startDate)).format('LLL');

        if (this.sessions[mainIndex].ownerId === this.currentUser.id) {
          let leavedParticipantName = this.sessions[mainIndex].participants[0].name;

          this.sessionErrorContent = 'Your planned session on ' + sessionStartDate + ' was disbanded because '
            + leavedParticipantName + ' had left the session. ' + "Member's plants have got the damadge. Connect with "
            + leavedParticipantName + ' to get more details.';
        } else {
          this.sessionErrorContent = 'You left the planned session on ' + sessionStartDate + '. '
            + "Member's plants have got the damadge. Try to be more disciplined next time.";
        }

        this.sessionErrorTitle = 'Session was disbanded';
        this.isSessionErrorVisible = true;

        this.sessions.splice(mainIndex, 1);
      }

      let selectedIndex = this.sessionsByInterval.findIndex(x => x.id === disbandSessionId);
      if (selectedIndex >= 0) this.sessionsByInterval.splice(selectedIndex, 1);


    });
  }

  //#endregion

  activateSessionsStartTimeListener = () => {
    let listenerInterval = 1000;

    setInterval(() => {
      let currentDateWithoutSeconds = this.dateTimeHelper.getCurrentDate(this.currentUserTimeZone, false);

      for (let index = 0; index < this.sessions.length; index++) {

        if (!this.sessions[index].isSessionReadyToStart
          || (new Date(this.sessions[index].startDate).getTime() > currentDateWithoutSeconds.getTime())) {

          let sessionTimeForStart = moment(this.sessions[index].startDate).subtract(5, 'm').toDate();

          if (currentDateWithoutSeconds.getTime() >= sessionTimeForStart.getTime()
            && currentDateWithoutSeconds.getTime() < new Date(this.sessions[index].startDate).getTime()) {
            this.sessions[index].isSessionReadyToStart = true;

            let indexByInterval = this.sessionsByInterval.findIndex(x => x.id === this.sessions[index].id);
            if (indexByInterval >= 0) this.sessionsByInterval[indexByInterval].isSessionReadyToStart = true;
          }
        } else this.sessions[index].isSessionReadyToStart = false;

        if (listenerInterval === 1000) listenerInterval = 5000;
      }
    }, listenerInterval);
  }

  joinSession(sessionId: number) {
    this.sessionService.join(sessionId).subscribe();
  }

  leaveSession(sessionId: number) {
    this.sessionService.leave(sessionId).subscribe();
  }

  cancelSession(sessionId: number) {
    this.sessionService.cancel(sessionId).subscribe();
  }

  getSessionName(session: Session): string {
    let participantsNames: string[] = [];

    if (this.currentUser.id === session.ownerId) {
      for (let index = 0; index < session.participants.length; index++) {
        participantsNames.push(session.participants[index].name);
      }
    } else {
      let otherParticipants = session.participants.filter(x => x.id !== this.currentUser.id);

      for (let index = 0; index < otherParticipants.length; index++) {
        participantsNames.push(otherParticipants[index].name);
      }

      participantsNames.unshift(session.owner.name);
    }

    return 'Focus session with ' + participantsNames.join(', ');
  }

  getTaskIntervalName(): string {
    return TaskInterval[this.taskInterval];
  }

  applyTaskIntervalToSessions() {
    this.sessionsByInterval = this.sessions
      .filter(x => this.taskHelper.getDateIntervalByDate(x.startDate, this.currentUserTimeZone) === this.taskInterval);
  }

  getSessionIntervalFormatted(startDate: Date, endDate: Date): string {
    return moment(startDate).format('LT') + ' - ' + moment(endDate).format('LT');
  }
}