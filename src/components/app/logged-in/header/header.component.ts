import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { trigger, transition, style, sequence, animate, state } from '@angular/animations';

import { faSortDown, faBell, faBug } from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from "@fortawesome/free-brands-svg-icons";
import { AuthenticationService } from "../../../../services/api/authentication.service";
import { User } from "../../../../models/entities/user.model";
import { SectionType } from 'src/models/enums/section-type.enum';
import { UserNotificationView } from 'src/models/views/user-notification-view.model';
import { SocialAuthService } from '@abacritt/angularx-social-login';

@Component({
  selector: 'header-authorized',
  templateUrl: 'header.component.html',
  styleUrls: ['header.component.css'],
  animations: [
    trigger('changeUserNotificationsState', [
      transition('* => true', [
        style({ opacity: 0 }),
        sequence([
          animate('0.25s ease',
            style({ opacity: 1 })
          )
        ])
      ]),
      transition('true => false', [
        style({ opacity: 1 }),
        sequence([
          animate('0.25s ease',
            style({ opacity: 0 })
          )
        ])
      ]),
      state('true', style({ opacity: 1 })),
      state('false', style({ opacity: 0 }))
    ]),
  ]
})
export class HeaderComponent implements OnInit {
  @Input() set receivedCurrentUser(value: User) {
    this.currentUser = value;
    this.setProfilePicturePath();
  }

  @Output() sectionTypeToEmit: EventEmitter<SectionType> = new EventEmitter<SectionType>();

  get sectionTypeBase(): typeof SectionType {
    return SectionType;
  }

  get receivedCurrentUser(): User {
    return this.currentUser;
  }

  currentUser: User;

  isUserNotificationsVisible: boolean;
  isReportABugPopupVisible: boolean;

  notificationIcon = faBell;
  notifications: UserNotificationView[];

  activeSection: SectionType;

  isAccountSettingsPopupVisible: boolean;
  isProfileSettingsPopupVisible: boolean;
  isUserMenuVisible: boolean;

  dropdownIcon: IconDefinition;
  bugIcon = faBug;

  timeStamp: number;
  profilePicturePath: string;

  windowWidth: number;

  constructor(private socialAuthService: SocialAuthService, private authenticationService: AuthenticationService) {
    this.activeSection = this.sectionTypeBase.Workspace;

    this.isAccountSettingsPopupVisible = false;
    this.isUserMenuVisible = false;
    this.dropdownIcon = faSortDown;

    this.isUserNotificationsVisible = false;
    this.isReportABugPopupVisible = false;
  }

  ngOnInit() {
    this.getWindowSize();
  }

  @HostListener('window:resize', ['$event'])
  getWindowSize() {
    this.windowWidth = window.innerWidth;
  }

  logout() {
    if (this.currentUser.isGoogleCalendarConnected) {
      this.socialAuthService.signOut(true);
    }

    this.authenticationService.logout();
    window.location.reload();
  }

  applyUserMenuStyling() {
    let userMenuContextElement = document.getElementById('userMenuContent');

    if (userMenuContextElement?.parentElement) {
      let dxPopupContentElement = userMenuContextElement.parentElement;
      let dxOverlayContentElement = dxPopupContentElement.parentElement;

      dxPopupContentElement.style.paddingRight = '0';
      dxPopupContentElement.style.paddingLeft = '0';

      dxOverlayContentElement ? dxOverlayContentElement.style.borderRadius = '10px' : null;
    }
  }

  setProfilePicturePath() {
    this.timeStamp = (new Date()).getTime();
    if (this.currentUser) {
      this.profilePicturePath = this.currentUser.userDetails.avatar;
    }
  }

  getProfilePicturePath(): string {
    if (this.timeStamp) {
      return this.profilePicturePath + '?' + this.timeStamp;
    }

    return this.profilePicturePath;
  }
}
