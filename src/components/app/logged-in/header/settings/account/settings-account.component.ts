import { Component, Input, Output, EventEmitter } from "@angular/core";
import { faEnvelope, faLock, faTrashAlt, faWindowClose, faPuzzlePiece } from "@fortawesome/free-solid-svg-icons";
import { AccountService } from "../../../../../../services/api/account.service";
import { Constants } from "../../../../../constants";
import { User } from "../../../../../../models/entities/user.model";
import { NotificationType, SettingsNotification } from "../../../../../../models/entities/settings-notification.model";
import { AccountSettingsSection } from "src/models/enums/account-settings-section.enum";
import { GoogleIntegrationService } from "src/services/api/google-integration.service";
import { GoogleLoginProvider, SocialAuthService } from "@abacritt/angularx-social-login";

@Component({
  selector: 'account-settings',
  templateUrl: 'settings-account.component.html',
  styleUrls: ['settings-account.component.css']
})
export class AccountSettingsComponent {
  @Input() set receivedCurrentUser(value: User) {
    if (value) {
      this.currentUser = value;
      this.googleIntegrationStateButtonValue = this.currentUser.isGoogleCalendarConnected ? 'Disconnect' : 'Connect';
    }
  }

  @Input() isAccountSettingsPopupVisible: boolean;
  @Output() isAccountSettingsPopupShouldBeHidden: EventEmitter<boolean> = new EventEmitter<boolean>();

  get accountSettingsSectionBase(): typeof AccountSettingsSection {
    return AccountSettingsSection;
  }

  //#region ComponentVariables

  currentUser: User;

  selectedSection: AccountSettingsSection;

  closeAccountSettingsIcon = faWindowClose;
  deletePersonalDataIcon = faTrashAlt;

  emailIcon = faEnvelope;
  passwordIcon = faLock;
  integrationsIcon = faPuzzlePiece;

  isEmailActionButtonDisabled: boolean;
  isEmailErrorVisible: boolean;
  emailError = '';
  emailActionButtonValue = '';
  emailNotification?: SettingsNotification;

  isPasswordActionButtonDisabled: boolean;
  isPasswordErrorVisible: boolean;
  newPasswordError = '';

  isNewPasswordConfirmationErrorVisible: boolean;
  newPasswordConfirmationError = '';

  newPasswordActionButtonValue = '';
  newPasswordNotification?: SettingsNotification;

  isDeleteAccountActionButtonDisabled: boolean;
  isCurrentPasswordErrorVisible: boolean;
  currentPasswordError = '';
  deleteAccountButtonValue = '';

  isChangeGoogleIntergrationStateButtonDisabled: boolean;
  googleIntegrationStateButtonValue: string;

  newEmail = '';
  currentPassword = '';
  newPassword = '';
  newPasswordConfirmation = "";

  googleIntegrationPopupWarningContent: string;
  googleIntegrationPopupWarningTitle: string;
  isGoogleIntegrationPopupWarningVisible: boolean;

  isGoogleConnectionNotificationVisible: boolean;
  googleConnectionNotificationContent: string;

  //#endregion

  constructor(private socialAuthService: SocialAuthService, private accountService: AccountService,
    private googleIntegrationService: GoogleIntegrationService) {
    this.selectedSection = AccountSettingsSection.Email;

    this.isEmailActionButtonDisabled = true;
    this.emailActionButtonValue = "Save changes";

    this.isPasswordActionButtonDisabled = true;
    this.newPasswordActionButtonValue = "Save changes";

    this.isChangeGoogleIntergrationStateButtonDisabled = false;
    this.googleIntegrationStateButtonValue = '';
    this.isGoogleIntegrationPopupWarningVisible = false;

    this.isGoogleConnectionNotificationVisible = false;

    this.isDeleteAccountActionButtonDisabled = true;
    this.deleteAccountButtonValue = "Delete account";

    this.accountService.getSettingsNotifications().subscribe(x => {
      if (x.length > 0) {
        this.emailNotification = x.find(x => x.type == NotificationType.Email);
        this.newPasswordNotification = x.find(x => x.type == NotificationType.Password);
      }
    });
  }

  selectSection(selectedSection: AccountSettingsSection) {
    this.selectedSection = selectedSection;

    switch (selectedSection) {
      case AccountSettingsSection.Email:
        this.cleanPasswordSection();
        this.cleanPersonalDataSection();

        break;

      case AccountSettingsSection.Password:
        this.cleanEmailSection();
        this.cleanPersonalDataSection();

        break;

      case AccountSettingsSection.Google:

        break;
      case AccountSettingsSection.Delete:
        this.cleanEmailSection();
        this.cleanPasswordSection();

        break;
    }
  }

  cleanEmailSection() {
    this.isEmailErrorVisible = false;
    this.isEmailActionButtonDisabled = true;
    this.newEmail = '';
  }

  cleanPasswordSection() {
    this.isPasswordErrorVisible = false;
    this.isPasswordActionButtonDisabled = true;
    this.newPassword = '';
    this.newPasswordConfirmation = '';
  }

  cleanPersonalDataSection() {
    this.isCurrentPasswordErrorVisible = false;
    this.isDeleteAccountActionButtonDisabled = true;
    this.currentPassword = '';
  }

  validateNewEmail(event: any) {
    this.newEmail = event.event.currentTarget.value.trim();
    let regExp = new RegExp(Constants.emailRegExValidation);

    if (this.newEmail.length < 1) {
      this.emailError = 'Email is required';
    } else if (!regExp.test(this.newEmail)) {
      this.emailError = 'Incorrect email format';
    } else {
      this.emailError = '';
    }

    this.isEmailErrorVisible = this.emailError.length > 0;
    this.isEmailActionButtonDisabled = this.isEmailErrorVisible;
  }

  async changeEmail() {
    this.isEmailActionButtonDisabled = true;
    this.emailActionButtonValue = "Checking...";

    if (this.currentUser.email === this.newEmail.trim()) {
      this.emailActionButtonValue = "Save changes";
      this.emailError = "Why are you trying to set the same email? :)";
      this.isEmailErrorVisible = true;
      return;
    }

    const emailCheckingResult = await this.accountService.checkEmailOnAvailability(this.newEmail).toPromise();
    if (!emailCheckingResult) {
      this.emailActionButtonValue = "Save changes";
      this.emailError = "This email is used by another account";
      this.isEmailErrorVisible = true;
    } else {
      this.emailActionButtonValue = "Applying...";
      let emailChangingResult = await this.accountService.changeEmail(this.newEmail).toPromise();
      this.newEmail = '';
      this.isEmailActionButtonDisabled = false;
      this.emailActionButtonValue = "Save changes";
      this.emailNotification = emailChangingResult;
    }
  }

  removeNotification(notificationType: NotificationType) {
    this.accountService.deleteSettingsNotification(notificationType).subscribe(() => {
      if (notificationType === NotificationType.Email) {
        this.emailNotification = undefined;
      } else {
        this.newPasswordNotification = undefined;
      }
    });
  }

  validateNewPassword(event: any) {
    this.newPassword = event.event.currentTarget.value.trim();

    if (this.newPassword.indexOf(' ') > -1) {
      this.newPasswordError = 'Incorrect password format';
    } else if (this.newPassword.length < 8) {
      this.newPasswordError = 'Password should be at least 8 characters';
    } else {
      this.newPasswordError = '';
    }

    this.isPasswordErrorVisible = this.newPasswordError.length > 0;
    this.isPasswordActionButtonDisabled = this.isPasswordErrorVisible
      || this.newPasswordConfirmation.length < 8;
  }

  validateNewPasswordConfirmation(event: any) {
    this.newPasswordConfirmation = event.event.currentTarget.value.trim();

    if (this.newPasswordConfirmation.indexOf(' ') > -1 || this.newPasswordConfirmation.length < 8) {
      this.newPasswordConfirmationError = 'Incorrect password format';
    } else if (this.newPassword !== this.newPasswordConfirmation) {
      this.newPasswordConfirmationError = 'Passwords are not match';
    } else {
      this.newPasswordConfirmationError = '';
    }

    this.isNewPasswordConfirmationErrorVisible = this.newPasswordConfirmationError.length > 0;
    this.isPasswordActionButtonDisabled = this.isNewPasswordConfirmationErrorVisible
      || this.newPassword.length < 8;
  }

  changePassword() {
    this.isPasswordActionButtonDisabled = true;
    this.newPasswordActionButtonValue = "Applying...";

    this.accountService.changePassword(this.newPassword).subscribe(x => {
      this.newPassword = '';
      this.newPasswordConfirmation = '';
      this.newPasswordActionButtonValue = "Save changes";
      this.newPasswordNotification = x;
    })
  }

  validateCurrentPassword(event: any) {
    this.isCurrentPasswordErrorVisible = false;
    this.currentPassword = event.event.currentTarget.value;

    if (this.currentPassword.indexOf(' ') > -1) {
      this.currentPasswordError = 'Incorrect password format';
    } else if (this.currentPassword.length < 8) {
      this.currentPasswordError = 'Password should be at least 8 characters';
    } else {
      this.currentPasswordError = '';
      this.currentPassword = this.currentPassword.trim();
    }

    this.isCurrentPasswordErrorVisible = this.currentPasswordError.length > 0;
    this.isDeleteAccountActionButtonDisabled = this.isCurrentPasswordErrorVisible;
  }

  deleteAccount() {
    this.isDeleteAccountActionButtonDisabled = true;
    this.deleteAccountButtonValue = "Checking...";

    this.accountService.deleteAccount(this.currentPassword).subscribe(() => {
      if (this.currentUser.isGoogleCalendarConnected) this.socialAuthService.signOut(true);

      localStorage.removeItem(Constants.jwtTokenName);
      sessionStorage.removeItem(Constants.jwtTokenName)
      window.location.reload();
    }, () => {
      this.deleteAccountButtonValue = "Delete account";
      this.currentPasswordError = "Password isn't correct";
      this.isCurrentPasswordErrorVisible = true;
    });
  }

  refreshAccountSettings() {
    this.cleanEmailSection();
    this.cleanPasswordSection();
    this.cleanPersonalDataSection();

    this.isAccountSettingsPopupShouldBeHidden.emit();
  }

  connectGoogleCalendar() {
    this.isChangeGoogleIntergrationStateButtonDisabled = true;
    this.googleIntegrationStateButtonValue = 'Processing...';

    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then((data) => {
      if (data) {
        this.googleIntegrationService.connect(data).subscribe(() => {
          this.currentUser.isGoogleCalendarConnected = true;

          this.isChangeGoogleIntergrationStateButtonDisabled = false;
          this.googleIntegrationStateButtonValue = 'Disconnect';

          this.googleConnectionNotificationContent = 'Your Google account was connected.';
          this.isGoogleConnectionNotificationVisible = true;
          setTimeout(() => {
            this.isGoogleConnectionNotificationVisible = false;
          }, 2000);
        });
      }
    });

  }

  disconnectGoogleCalendar(desicion: boolean) {
    this.isGoogleIntegrationPopupWarningVisible = false;

    if (desicion) {
      this.isChangeGoogleIntergrationStateButtonDisabled = true;
      this.googleIntegrationStateButtonValue = 'Processing...';

      this.googleIntegrationService.disconnect().subscribe(() => {
        this.currentUser.isGoogleCalendarConnected = false;

        this.isChangeGoogleIntergrationStateButtonDisabled = false;
        this.googleIntegrationStateButtonValue = 'Connect';

        this.googleConnectionNotificationContent = 'Your Google account was disconnected.';
        this.isGoogleConnectionNotificationVisible = true;
        setTimeout(() => {
          this.isGoogleConnectionNotificationVisible = false;
        }, 2000);
      });
    }
  }

  showGoogleIntegrationPopupWarning() {
    this.googleIntegrationPopupWarningTitle = 'Are you sure?';

    this.googleIntegrationPopupWarningContent = 'All your data stored in the "SerenityTask Planner" calendar '
      + 'will be permanenlty deleted. You will need to connect your Google account again to get the best '
      + 'experience of SerenityTask.';

    this.isGoogleIntegrationPopupWarningVisible = true;
  }
}
