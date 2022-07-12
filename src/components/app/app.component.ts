import { Component, HostListener, OnInit } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { AuthenticationService } from "../../services/api/authentication.service";
import { Constants } from "../constants";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['app.component.css']
})

export class AppComponent implements OnInit {

  isTokenChecked = false;
  isUserAuthorized: boolean;
  isBrowserSupported: boolean;

  constructor(private deviceDetectorService: DeviceDetectorService,
    private authenticationService: AuthenticationService) {

    let authorizationToken = authenticationService.getAuthorizationToken();
    if (authorizationToken.length > 0) {
      this.authenticationService.isAuthorizedUserExist().subscribe(x => {
        this.confirmTokenValidation();

        this.isUserAuthorized = x;
        if (!this.isUserAuthorized) {
          this.isUserAuthorized = false;
          localStorage.removeItem(Constants.jwtTokenName);
          sessionStorage.removeItem(Constants.jwtTokenName);
        }
      }, () => {
        this.authenticationService.removeAuthorizationToken();
        window.location.reload;
      });
    } else {
      this.confirmTokenValidation();
    }
  }

  ngOnInit(): void {
    let deviceInfo = this.deviceDetectorService.getDeviceInfo();
    this.isBrowserSupported = deviceInfo && deviceInfo.browser.indexOf('Firefox') < 0;
  }

  confirmTokenValidation() {
    this.isTokenChecked = true;
  }
}

