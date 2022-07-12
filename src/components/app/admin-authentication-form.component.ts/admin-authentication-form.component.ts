import {Component, Output, HostListener, EventEmitter, ElementRef, ViewChild} from "@angular/core";
import {AuthenticationService} from "../../../services/api/authentication.service";
import {Constants} from "../../constants";
import {Login} from "../../../models/forms/login.model";

@Component({
  selector: 'admin-authentication-form',
  templateUrl: 'admin-authentication-form.component.html',
  styleUrls: ['admin-authentication-form.component.css']
})

export class AdminAuthenticationFormComponent {
  @ViewChild('adminAuthenticationFormPopup') adminAuthenticationFormPopup: ElementRef;
  @Output() isTeamMemberAuthorized: EventEmitter<boolean> = new EventEmitter<boolean>();

  loginModel: Login;

  loginButtonTitle: string;
  isLoginButtonActive: boolean;
  showValidationError: boolean;

  windowWidth: number;
  isPopupShowing: boolean;

  constructor(private authenticationService: AuthenticationService) {
    this.isPopupShowing = false;
    this.loginModel = new Login();
    this.resetLoginButton();

    this.getWindowSize();
  }

  @HostListener('window:resize', ['$event'])
  getWindowSize() {
    this.windowWidth = window.innerWidth;
  }

  applyPopupStyling() {
    this.isPopupShowing = true;

    let adminAuthenticationFormPopupContent = document.getElementById('adminAuthenticationFormPopupContent');
    if (adminAuthenticationFormPopupContent?.parentElement?.parentElement) {
      let dxOverlayContentElement = adminAuthenticationFormPopupContent.parentElement.parentElement;
      dxOverlayContentElement.style.border = 'none';
      dxOverlayContentElement.style.boxShadow = 'none';
    }
  }

  validateLoginModel() {
    if (this.showValidationError) this.showValidationError = false;
    this.isLoginButtonActive = (this.loginModel.login.length >= 3 && this.loginModel.password.length >= 8);
  }

  validateAdminData() {
    this.loginButtonTitle = 'Checking...';
    this.isLoginButtonActive = false;

    this.authenticationService.validateAdminData(this.loginModel).subscribe(loginResponse => {
      this.showValidationError = (!loginResponse || !loginResponse.isPasswordCorrect);
      if (!this.showValidationError) {
        sessionStorage.setItem(Constants.jwtAdminTokenName, loginResponse.authorizationToken);
        this.isTeamMemberAuthorized.emit(true);
      } else this.resetLoginButton();
    });
  }

  resetLoginButton() {
    this.loginButtonTitle = 'Get access';
    this.isLoginButtonActive = false;
  }
}
