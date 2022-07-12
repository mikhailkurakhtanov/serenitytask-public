import {Component} from '@angular/core';
import {AuthenticationService} from "../../../services/api/authentication.service";
import {Register} from "../../../models/forms/register.model";
import {Login} from "../../../models/forms/login.model";
import {User} from "../../../models/entities/user.model";

@Component({
  selector: 'non-logged-in',
  templateUrl: 'non-logged-in.component.html'
})

export class NonLoggedInComponent {
  isLoginFormVisible: boolean;
  isRegisterFormVisible: boolean;

  showUsernameError: boolean;
  showEmailError: boolean;
  showPasswordConfirmationError: boolean;
  showContentsAgreementError: boolean;

  registerModel: Register;
  loginModel: Login;

  createdUser: User;

  constructor(private authenticationService: AuthenticationService) {
    this.registerModel = new Register();
    this.loginModel = new Login();
  }

  showAuthorizationForm(popupTemplateName: string) {
    popupTemplateName == 'login' ? this.isLoginFormVisible = true : this.isRegisterFormVisible = true;
  }

  register() {
    if (!this.registerModel.areContentsAgreed) {
      this.showContentsAgreementError = true;
      return;
    }

    if (this.showPasswordConfirmationError || this.showEmailError || this.showUsernameError) return;

    this.authenticationService.register(this.registerModel).subscribe(x => this.createdUser = x);
  }

  login() {
    this.authenticationService.login(this.loginModel).subscribe();
  }
}
