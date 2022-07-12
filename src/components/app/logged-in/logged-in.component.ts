import { Router } from "@angular/router";
import { Component, HostListener, OnInit } from '@angular/core';
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";

import { UserService } from "../../../services/api/user.service";
import { AuthenticationService } from "../../../services/api/authentication.service";
import { User } from "../../../models/entities/user.model";
import { SectionType } from "src/models/enums/section-type.enum";
import { AuthorizationHub } from "src/services/hubs/authorization.hub";

import { TimeZoneType } from "src/models/entities/time-zone-type.model";

import { GoogleLoginProvider, SocialAuthService } from "@abacritt/angularx-social-login";
import { GoogleIntegrationService } from "src/services/api/google-integration.service";
import { GoogleCredential } from "src/models/entities/google-credential.model";
import { UserDetailsService } from "src/services/api/user-details.service";
import { NavigationTransferService } from "src/services/navigation-transfer.service";

@Component({
  selector: 'logged-in',
  templateUrl: 'logged-in.component.html',
  styleUrls: ['logged-in.component.css']
})
export class LoggedInComponent implements OnInit {
  get sectionTypeBase(): typeof SectionType {
    return SectionType;
  }

  currentUser: User;
  activeSection: SectionType;

  areTimeZonesLoading: boolean;
  areTimeZonesShouldBeLoaded: boolean;
  isTimeZoneWarningVisible: boolean;
  isTimeZonePickerVisible: boolean;
  isTimeZoneChangesApplying: boolean;

  changelogVisibilityTrigger: boolean;

  loadingIcon = faEllipsisH;

  windowWidth: number;

  constructor(private router: Router, private transferService: NavigationTransferService,
    private socialAuthService: SocialAuthService, private userService: UserService,
    private userDetailsService: UserDetailsService, private authorizationHub: AuthorizationHub,
    private authenticationService: AuthenticationService, private googleIntegrationService: GoogleIntegrationService) { }

  ngOnInit() {
    this.changelogVisibilityTrigger = false;

    this.getWindowSize();

    let authorizationToken = this.authenticationService.getAuthorizationToken();
    this.userService.getCurrentUser(authorizationToken).subscribe(x => {
      this.currentUser = x;

      if (!this.currentUser?.userDetails?.timeZone) {
        this.areTimeZonesShouldBeLoaded = false;
        this.areTimeZonesLoading = false;
        this.isTimeZoneChangesApplying = false;
        this.isTimeZoneWarningVisible = true;
      }

      if (this.currentUser?.googleCredential) this.activateGoogleTokenExpirationListener();
    });

    this.activateGoogleTokenRefreshingListener();

    this.activeSection = this.sectionTypeBase.Workspace;
    this.authorizationHub.startConnection();
  }

  @HostListener('window:resize', ['$event'])
  getWindowSize() {
    this.windowWidth = window.innerWidth;
  }

  activateGoogleTokenRefreshingListener = () => {
    this.socialAuthService.authState.subscribe(x => {
      if (this.currentUser.googleCredential.expiresAt < x.response.expires_at) {
        if (x) this.googleIntegrationService.update(x).subscribe(() => {
          if (!this.currentUser.googleCredential) this.currentUser.googleCredential = new GoogleCredential;
          this.currentUser.googleCredential.expiresAt = x.response.expiresAt;
        });
      }
    })
  }

  activateGoogleTokenExpirationListener = () => {
    setInterval(() => {
      let currentTime = (new Date).getTime();

      if (this.currentUser.googleCredential.expiresAt < currentTime) {
        this.socialAuthService.refreshAuthToken(GoogleLoginProvider.PROVIDER_ID).then();
      }
    }, 5000);
  }

  changeSection(sectionType: SectionType) {
    this.activeSection = sectionType;
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/']).then();
  }

  selectTimeZone(selectedTimeZone: TimeZoneType) {
    this.currentUser.userDetails.timeZone = selectedTimeZone;
  }

  saveTimeZone() {
    this.isTimeZoneChangesApplying = true;

    this.userDetailsService.updateUserDetails(this.currentUser.userDetails)
      .subscribe(() => {
        this.isTimeZoneChangesApplying = false;
        this.isTimeZoneWarningVisible = false;
      });
  }

  showChangelogFromHeaderMenu(event: any) {
    this.changelogVisibilityTrigger = true;
  }
}
