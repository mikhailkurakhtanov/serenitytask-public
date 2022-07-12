export class Login {
  login: string;
  password: string;
  rememberMe: boolean;
}

export class LoginResponse {
  isPasswordCorrect: boolean;
  isEmailConfirmed: boolean;
  authorizationToken: string;
}
