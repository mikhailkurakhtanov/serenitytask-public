import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { trigger, transition, sequence, animate, style, state } from '@angular/animations';
import { AuthenticationService } from "../../../../../services/api/authentication.service";
import { Login, LoginResponse } from "../../../../../models/forms/login.model";
import { Constants } from "../../../../constants";
import { GoogleLoginProvider, SocialAuthService } from '@abacritt/angularx-social-login';
import { ChangeAccountPasswordRequest } from 'src/models/requests/authentication/change-account-password-request.model';
import { UserService } from 'src/services/api/user.service';

@Component({
  selector: 'popup-login',
  templateUrl: 'popup.login.component.html',
  styleUrls: ['popup.login.component.css', '../form-styles.css'],
  animations: [
    trigger('changeButtonState', [
      transition('* => true', [
        sequence([
          animate('0.25s ease',
            style({ transform: 'scale(1.075)' }))
        ])
      ]),
      state('true', style({ transform: 'scale(1.075)' })),
      transition('true => false', [
        sequence([
          animate('0.25s ease',
            style({ transform: 'scale(1)' }))
        ]),
        state('false', style({ transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class PopupLoginFormComponent implements OnInit {
  @Input() set isLoginFormVisibleTrigger(value: boolean) {
    if (value) {
      this.resetLoginModel();
      this.resetLoginButton();

      this.isPasswordRecoveryFormVisible = false;
    }

    this.isLoginFormVisible = value;
  }

  @Output() isLoginFormShouldBeHidden: EventEmitter<boolean> = new EventEmitter<boolean>();

  isLoginFormVisible: boolean;

  isPasswordRecoveryFormVisible: boolean;
  passwordRecoveryModel: ChangeAccountPasswordRequest;

  showEmailError: boolean;
  showPasswordRecoveryMatchError: boolean;

  playButtonAnimation: boolean;

  showPasswordError: boolean;
  passwordError: string;

  showLoginError: boolean;
  loginError: string;

  isLoginButtonActive: boolean;
  loginButtonName: string;

  loginModel: Login = new Login();

  windowWidth: number;

  constructor(private socialAuthService: SocialAuthService, private authenticationService: AuthenticationService,
    private userService: UserService) {
    this.resetLoginModel();
    this.resetLoginButton();
  }

  ngOnInit(): void {
    this.isLoginFormVisible = false;

    this.showLoginError = false;
    this.showPasswordError = false;

    this.passwordRecoveryModel = new ChangeAccountPasswordRequest;

    this.isPasswordRecoveryFormVisible = false;
    this.showEmailError = false;
    this.showPasswordRecoveryMatchError = false;

    this.getWindowSize();
  }

  @HostListener('window:resize', ['$event'])
  getWindowSize() {
    this.windowWidth = window.innerWidth;
  }

  async login() {
    this.showLoginError = false;
    this.showPasswordError = false;
    this.loginButtonName = 'Checking...';
    this.isLoginButtonActive = false;

    const validateInputFieldsResult = this.validateInputFields();
    if (validateInputFieldsResult) {
      let loginResult = await this.getLoginResponse().then();
      if (loginResult) {
        if (!loginResult.isEmailConfirmed) {
          this.resetLoginButton();
          this.loginError = 'You need to confirm your account';
          this.showLoginError = true;
        } else if (!loginResult.isPasswordCorrect) {
          this.resetLoginButton();
          this.passwordError = 'Incorrect password';
          this.showPasswordError = true;
        } else if (loginResult.authorizationToken) {
          if (this.loginModel.rememberMe) {
            localStorage.setItem(Constants.jwtTokenName, loginResult.authorizationToken);
          } else {
            sessionStorage.setItem(Constants.jwtTokenName, loginResult.authorizationToken);
          }

          this.loginButtonName = 'Logging in...';
          window.location.reload();
        }
      } else {
        this.resetLoginButton();
        this.loginError = 'This account does not exist';
        this.showLoginError = true;
      }
    } else {
      this.resetLoginButton();
    }
  }

  loginWithGoogle() {
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then((data) => {
      if (data) {
        this.authenticationService.loginWithGoogle(data).subscribe(authorizationToken => {
          if (authorizationToken) {
            localStorage.setItem(Constants.jwtTokenName, authorizationToken);
            window.location.reload();
          } else {
            this.loginModel.login = data.email;
            this.loginError = 'Google account with this email does not connected';
            this.showLoginError = true;
          }
        });
      }
    });
  }

  async getLoginResponse(): Promise<LoginResponse> {
    return await this.authenticationService.login(this.loginModel).toPromise();
  }

  validateInputFields(): boolean {
    this.validateLogin();
    this.validatePassword();

    return !(this.showPasswordError || this.showLoginError);
  }

  validateLogin() {
    if (this.loginModel.login.length < 1) {
      this.loginError = 'Login is required';
    } else if (this.loginModel.login.indexOf(' ') > 0) {
      this.loginError = 'Incorrect login format';
    } else {
      this.loginError = '';
    }

    if (this.loginError.length > 0) {
      this.showLoginError = true;
    } else {
      this.loginModel.login = this.loginModel.login.trim();
      this.showLoginError = false;
    }
  }

  validatePassword() {
    if (this.loginModel.password.length < 8) {
      this.passwordError = 'Password should be at least 8 characters';
    } else if (this.loginModel.password.indexOf(' ') > 0) {
      this.passwordError = 'Incorrect password format';
    } else {
      this.passwordError = '';
    }

    if (this.passwordError.length > 0) {
      this.showPasswordError = true;
    } else {
      this.loginModel.password = this.loginModel.password.trim();
      this.showPasswordError = false;
    }
  }

  closeLoginForm() {
    this.showLoginError = false;
    this.showPasswordError = false;
    this.showPasswordError = false;
    this.showLoginError = false;

    this.isLoginFormShouldBeHidden.emit();
  }

  resetLoginModel() {
    this.loginModel = new Login();
    this.loginModel.login = '';
    this.loginModel.password = '';
  }

  resetLoginButton() {
    this.isLoginButtonActive = true;
    this.loginButtonName = 'Grow';
  }

  //#region PasswordRecoveryForm

  isConfirmButtonActive(): boolean {
    return !this.showEmailError && !this.showPasswordError && !this.showPasswordRecoveryMatchError
      && (this.passwordRecoveryModel.newPassword.length > 7
      && this.passwordRecoveryModel.newPassword === this.passwordRecoveryModel.newPasswordConfirmation);
  }

  validateNewPassword() {
    if (this.passwordRecoveryModel.newPassword.length < 8) {
      this.passwordError = 'Password should be at least 8 characters';
    } else if (this.passwordRecoveryModel.newPassword.indexOf(' ') > 0) {
      this.passwordError = 'Incorrect password format';
    } else this.passwordError = '';

    this.showPasswordError = this.passwordError.length > 0;
  }

  validateNewPasswordConfirmation() {
    this.showPasswordRecoveryMatchError = this.passwordRecoveryModel.newPassword !== this.passwordRecoveryModel.newPasswordConfirmation;
  }

  sendRecoverPasswordRequest() {
    if (this.passwordRecoveryModel) {
      this.userService.checkEmail(this.passwordRecoveryModel.userEmail).subscribe(isEmailAvailable => {
        if (!isEmailAvailable) {
          this.authenticationService.sendRecoverPasswordMessage(this.passwordRecoveryModel).subscribe(() => {

          });
        } else this.showEmailError = true;
      });
    }
  }

  //#endregion
}
