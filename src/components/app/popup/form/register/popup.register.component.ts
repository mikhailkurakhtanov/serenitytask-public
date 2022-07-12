import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AuthenticationService } from "../../../../../services/api/authentication.service";
import { UserService } from "../../../../../services/api/user.service";
import { Register } from "../../../../../models/forms/register.model";
import { User } from "../../../../../models/entities/user.model";
import { Constants } from "../../../../constants";
import { animate, sequence, state, style, transition, trigger } from '@angular/animations';
import { GoogleLoginProvider, SocialAuthService } from '@abacritt/angularx-social-login';

@Component({
  selector: 'popup-register',
  templateUrl: 'popup.register.component.html',
  styleUrls: ['popup.register.component.css', '../form-styles.css'],
  animations: [
    trigger('changeRegisterButtonState', [
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
  ],
})
export class PopupRegisterFormComponent implements OnInit {
  @Input() isRegisterFormVisible: boolean;
  @Output() isRegisterFormShouldBeHidden: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('registerOptions') registerOptionsElement: ElementRef;

  isTermsAndConditionsFormVisible: boolean;
  isRegisterResultPopupVisible: boolean;

  playRegisterButtonAnimation: boolean;

  showNameError: boolean;

  usernameError: string;
  showUsernameError: boolean;

  emailError: string;
  showEmailError: boolean;

  passwordError: string;
  showPasswordError: boolean;
  showPasswordConfirmationError: boolean;
  showContentsAgreementError: boolean;

  isButtonDisabled: boolean;
  buttonName: string;

  registerModel: Register;

  createdUser: User
  createdUserEmail: string;

  windowWidth: number;

  constructor(private socialAuthService: SocialAuthService,
    private authenticationService: AuthenticationService, private userService: UserService) {
    this.resetRegisterModel();
    this.resetRegisterButton();
  }

  ngOnInit(): void {
    this.getWindowSize();
  }

  @HostListener('window:resize', ['$event'])
  getWindowSize() {
    this.windowWidth = window.innerWidth;
  }

  hideTermsAndConditionsPopup() {
    this.isTermsAndConditionsFormVisible = false;
  }

  async register() {
    this.isButtonDisabled = true;
    this.buttonName = 'Checking...';

    let validateInputFieldsResult = this.validateInputFields();
    if (validateInputFieldsResult) {
      await this.checkEmailOnExist().then();
      await this.checkUsernameOnExist().then();

      if (this.showUsernameError || this.showEmailError) {
        this.resetRegisterButton();
      } else {
        this.authenticationService.register(this.registerModel).subscribe(x => {
          this.createdUser = x;
          this.createdUserEmail = this.createdUser.email;
          this.isRegisterResultPopupVisible = true;
        });
      }
    } else {
      this.resetRegisterButton();
    }
  }

  registerWithGoogle() {
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then((data) => {
      if (data) {
        this.authenticationService.registerWithGoogle(data).subscribe(authorizationToken => {
          if (authorizationToken == null) {
            this.registerModel.email = data.email;
            this.emailError = 'This email is used by another account';
            this.showEmailError = true;
          } else {
            localStorage.setItem(Constants.jwtTokenName, authorizationToken);
            window.location.reload();
          }
        });
      }
    });
  }

  validateInputFields(): boolean {
    this.validateName();
    this.validateUsername();
    this.validateEmail();
    this.validatePassword();
    this.validatePasswordConfirmation();
    this.validateTermsAndConditionsAgreement();

    return !(this.showNameError || this.showUsernameError || this.showEmailError
      || this.showPasswordError || this.showPasswordConfirmationError || this.showContentsAgreementError);
  }

  validateName() {
    !this.registerModel.name ? this.showNameError = true
      : this.registerModel.name = this.registerModel.name.trim();

    this.showNameError = this.registerModel.name.length <= 0;
  }

  validateUsername() {
    if (this.registerModel.username.length < 3) {
      this.usernameError = 'Username should be at least 3 characters';
    } else if (this.registerModel.username.indexOf(' ') > 0) {
      this.usernameError = 'Incorrect username format';
    } else {
      this.usernameError = '';
    }

    if (this.usernameError.length > 0) {
      this.showUsernameError = true;
    } else {
      this.registerModel.username = this.registerModel.username.trim();
      this.showUsernameError = false;
    }
  }

  validateEmail() {
    let regExp = new RegExp(Constants.emailRegExValidation);

    if (this.registerModel.email.length < 1) {
      this.emailError = 'Email is required';
    } else if (!regExp.test(this.registerModel.email)) {
      this.emailError = 'Incorrect email format';
    } else {
      this.emailError = '';
    }

    if (this.emailError.length > 0) {
      this.showEmailError = true;
    } else {
      this.registerModel.email = this.registerModel.email.trim();
      this.showEmailError = false;
    }
  }

  validatePassword() {
    if (this.registerModel.password.length < 8) {
      this.passwordError = 'Password should be at least 8 characters';
    } else if (this.registerModel.password.indexOf(' ') > 0) {
      this.passwordError = 'Incorrect password format';
    } else {
      this.passwordError = '';
    }

    if (this.passwordError.length > 0) {
      this.showPasswordError = true;
    } else {
      this.registerModel.password = this.registerModel.password.trim();
      this.showPasswordError = false;
    }
  }

  validatePasswordConfirmation() {
    !this.registerModel.passwordConfirmation ? this.showPasswordConfirmationError = true
      : this.registerModel.passwordConfirmation = this.registerModel.passwordConfirmation.trim();

    this.showPasswordConfirmationError = this.registerModel.password != this.registerModel.passwordConfirmation;
  }

  validateTermsAndConditionsAgreement() {
    this.showContentsAgreementError = !this.registerModel.areContentsAgreed;
  }

  async checkUsernameOnExist() {
    if (this.registerModel.username) {
      const isUsernameAvailable = await this.userService.checkUsername(this.registerModel.username).toPromise();
      if (!isUsernameAvailable) {
        this.resetRegisterButton();
      }

      this.showUsernameError = !isUsernameAvailable;
      this.usernameError = 'This username is used by another account';
    }
  }

  async checkEmailOnExist() {
    if (this.registerModel.email) {
      const isEmailAvailable = await this.userService.checkEmail(this.registerModel.email).toPromise();
      if (!isEmailAvailable) {
        this.resetRegisterButton();
      }

      this.emailError = 'This email is used by another account';
      this.showEmailError = !isEmailAvailable;
    }
  }

  showTermsAndConditionsForm() {
    this.isTermsAndConditionsFormVisible = true;
  }

  changeConditionsAgreementResult(result: boolean) {
    this.registerModel.areContentsAgreed = result;
    this.validateTermsAndConditionsAgreement();
  }

  closeRegisterForm() {
    this.showNameError = false;
    this.showUsernameError = false;
    this.showEmailError = false;
    this.showPasswordError = false;
    this.showPasswordConfirmationError = false;
    this.showContentsAgreementError = false;
    this.resetRegisterButton();

    this.isRegisterFormShouldBeHidden.emit();
  }

  resetRegisterModel() {
    this.registerModel = new Register();
    this.registerModel.name = '';
    this.registerModel.username = '';
    this.registerModel.email = '';
    this.registerModel.password = '';
    this.registerModel.passwordConfirmation = '';
    this.registerModel.areContentsAgreed = false;
  }

  resetRegisterButton() {
    this.isButtonDisabled = false;
    this.buttonName = 'Plant';
  }
}
