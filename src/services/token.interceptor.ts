import {Injectable} from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor} from '@angular/common/http';
import {AuthenticationService} from "./api/authentication.service";
import {Observable} from "rxjs";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(public authenticationService: AuthenticationService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authorizationToken = this.authenticationService.getAuthorizationToken();

    if (authorizationToken  || authorizationToken !== undefined) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authorizationToken}`
        }
      });
    }

    return next.handle(request);
  }
}
