import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from "@auth0/angular-jwt";
import { SocialUser } from '@abacritt/angularx-social-login';
import { Observable } from "rxjs";
import { Constants } from "../../components/constants";
import { User } from "../../models/entities/user.model";
import { Register } from "../../models/forms/register.model";
import { Login, LoginResponse } from "../../models/forms/login.model";
import { ChangeAccountPasswordRequest } from 'src/models/requests/authentication/change-account-password-request.model';

@Injectable()
export class AuthenticationService {

  private readonly apiValidateAdminData = 'auth/validate-admin';
  private readonly apiRegisterWithGoogleUrl = 'auth/register-with-google';
  private readonly apiLoginWithGoogleUrl = 'auth/login-with-google';
  private readonly apiSendRecoverPasswordMessageUrl = 'auth/recover-password';

  constructor(private http: HttpClient, private jwtHelper: JwtHelperService) { }

  isAuthorizedUserExist() {
    return this.http.get<boolean>(Constants.apiUrl + 'auth/check-authorized');
  }

  register(registerModel: Register): Observable<User> {
    return this.http.post<User>(Constants.apiUrl + 'auth/register', registerModel);
  }

  registerWithGoogle(socialUser: SocialUser): Observable<string> {
    return this.http.post<string>(Constants.apiUrl + this.apiRegisterWithGoogleUrl, socialUser);
  }

  login(loginModel: Login): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(Constants.apiUrl + 'auth/login', loginModel);
  }

  loginWithGoogle(socialUser: SocialUser): Observable<string> {
    return this.http.post<string>(Constants.apiUrl + this.apiLoginWithGoogleUrl, socialUser);
  }

  sendRecoverPasswordMessage(request: ChangeAccountPasswordRequest): Observable<any> {
    return this.http.post<any>(Constants.apiUrl + this.apiSendRecoverPasswordMessageUrl, request);
  }

  validateAdminData(loginModel: Login): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(Constants.apiUrl + this.apiValidateAdminData, loginModel);
  }

  logout() {
    localStorage.removeItem(Constants.jwtTokenName);
    sessionStorage.removeItem(Constants.jwtTokenName);
  }

  getAuthorizationToken(): string {
    let authorizationToken = localStorage.getItem(Constants.jwtTokenName);
    if (!authorizationToken) {
      authorizationToken = sessionStorage.getItem(Constants.jwtTokenName);
    }

    if (authorizationToken && !this.jwtHelper.isTokenExpired(authorizationToken)) {
      return authorizationToken;
    } else {
      return '';
    }
  }

  removeAuthorizationToken() {
    let authorizationToken = this.getAuthorizationToken();
    if (authorizationToken.length > 0) {
      localStorage.removeItem(Constants.jwtTokenName);
      sessionStorage.removeItem(Constants.jwtTokenName);
    }
  }
}
