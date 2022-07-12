import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from "moment";
import { Constants } from 'src/components/constants';
import { UserNotificationType } from 'src/models/entities/user-notification.model';
import { UserNotificationConnector } from 'src/models/requests/user/user-notification-connector.model';

import { UserNotificationView } from 'src/models/views/user-notification-view.model';
import { UserNotificationService } from 'src/services/api/user-notification.service';
import { UserService } from 'src/services/api/user.service';
import { DateTimeHelper } from 'src/services/helpers/date-time.helper';
import { UserNotificationHub } from 'src/services/hubs/user-notification.hub';

@Component({
  selector: 'user-notifications',
  templateUrl: 'user-notifications.component.html',
  styleUrls: ['user-notifications.component.css']
})
export class UserNotificationsComponent implements OnInit {
  @Input() currentUserTimeZone: string;

  @Input() notificationsButtonPosition: number;
  @Output() isNewNotificationReceived: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() isNotificationsShouldBeHidden: EventEmitter<boolean> = new EventEmitter<boolean>();

  notifications: UserNotificationView[];

  get momentBase(): typeof moment {
    return moment;
  }

  get userNotificationTypeBase(): typeof UserNotificationType {
    return UserNotificationType;
  }

  constructor(private userNotificationHub: UserNotificationHub, private userService: UserService,
    private userNotificationService: UserNotificationService, private dateTimeHelper: DateTimeHelper) { }

  async ngOnInit(): Promise<void> {
    await this.activateReceiveCurrentUserTimeZoneListener();

    this.userNotificationService.getViews().subscribe(x => {
      this.notifications = [];
      if (x.length > 0) {
        for (let index = 0; index < x.length; index++) {
          x[index].userNotification.creationDate = this.dateTimeHelper
            .convertDateToUserTimeZone(new Date(x[index].userNotification.creationDateString), this.currentUserTimeZone);
        }

        this.notifications = x;
      }
    });

    this.userNotificationHub.startConnection();
    this.activateReceiveNewUserNotification();
    this.activateReceiveDeletedUserNotificationId();
  }

  getWindowWidth(): number {
    return window.innerWidth;
  }

  async activateReceiveCurrentUserTimeZoneListener() {
    let listener = setInterval(() => {
      if (this.currentUserTimeZone) clearInterval(listener);
    }, 250);
  }

  //#region UserNotificationHub

  activateReceiveNewUserNotification = () => {
    this.userNotificationHub.hubConnection.on('receiveNewUserNotification', (newUserNotificationJson: string) => {
      let newUserNotification = JSON.parse(newUserNotificationJson) as UserNotificationView;

      if (newUserNotification) {
        switch (newUserNotification.userNotification.type) {
          case UserNotificationType.FriendRequest:
            newUserNotification.userNotification.message
              = newUserNotification.senderName + ' wants to be friends with you';
            break;

          case UserNotificationType.SessionInvitation:
            newUserNotification.userNotification.message
              = newUserNotification.senderName + ' wants to start a study session right now';
            break;

          case UserNotificationType.Message:
            newUserNotification.userNotification.message
              = "You've got a new message from " + newUserNotification.senderName;
            break;
        }

        newUserNotification.userNotification.creationDate = this.dateTimeHelper
          .convertDateToUserTimeZone(new Date(newUserNotification.userNotification.creationDateString), this.currentUserTimeZone);

        this.notifications.unshift(newUserNotification);
        this.isNewNotificationReceived.emit();

        let notificationSound = new Audio(Constants.systemSoundsUrl + 'notification_new.mp3');
        notificationSound.play();
      }
    });
  }

  activateReceiveDeletedUserNotificationId = () => {
    this.userNotificationHub.hubConnection.on('receiveDeletedUserNotificationId', (deletedUserNotificationIdJson: string) => {
      let deletedUserNotificationId = JSON.parse(deletedUserNotificationIdJson) as number;
      if (this.notifications.length > 0) {
        var index = this.notifications.findIndex(x => x.userNotification.id == deletedUserNotificationId);
        if (index >= 0) this.notifications.splice(index, 1);
        if (this.notifications.length === 0) this.isNotificationsShouldBeHidden.emit(true);
      }
    });
  }

  //#endregion

  deleteUserNotification(userNotificationId: number) {
    this.userNotificationService.delete(userNotificationId).subscribe();
  }

  answerOnFriendRequest(decision: boolean, userNotificationId: number, index: number) {
    if (decision) {
      let request = new UserNotificationConnector;
      request.senderId = this.notifications[index].userNotification.senderId;
      request.receiverId = this.notifications[index].userNotification.receiverId;

      this.userService.acceptFriendRequest(request).subscribe();
    }

    this.userNotificationService.delete(userNotificationId).subscribe();
  }

  answerOnStartSessionRequest(decision: boolean, userNotificationId: number) {
    // call specific service

    this.userNotificationService.delete(userNotificationId).subscribe();
  }
}