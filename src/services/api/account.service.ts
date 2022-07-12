import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Constants} from "../../components/constants";
import {NotificationType, SettingsNotification} from "../../models/entities/settings-notification.model";

@Injectable()
export class AccountService {

  private apiCheckEmailOnAvailabilityUrl = 'account/check-email?email=';
  private apiChangeEmailUrl = 'account/change-email?newEmail='

  private apiChangePasswordUrl = 'account/change-password?newPassword=';

  private apiGetSettingsNotificationsUrl = 'account/get-notifications';
  private apiDeleteSettingsNotificationUrl = 'account/delete-notification?notificationType='

  private apiDeleteAccountUrl = 'account/delete?currentPassword=';

  constructor(private http: HttpClient) { }

  checkEmailOnAvailability(requestedEmail: string): Observable<boolean> {
    return this.http.get<boolean>(Constants.apiUrl + this.apiCheckEmailOnAvailabilityUrl + requestedEmail);
  }

  changeEmail(newEmail: string): Observable<SettingsNotification> {
    return this.http.get<SettingsNotification>(Constants.apiUrl + this.apiChangeEmailUrl + newEmail);
  }

  getSettingsNotifications(): Observable<SettingsNotification[]> {
    return this.http.get<SettingsNotification[]>(Constants.apiUrl + this.apiGetSettingsNotificationsUrl);
  }

  deleteSettingsNotification(notificationType: NotificationType): Observable<any> {
    return this.http.get(Constants.apiUrl + this.apiDeleteSettingsNotificationUrl + notificationType);
  }

  changePassword(newPassword: string): Observable<SettingsNotification> {
    return this.http.get<SettingsNotification>(Constants.apiUrl + this.apiChangePasswordUrl + newPassword);
  }

  deleteAccount(currentPassword: string): Observable<any> {
    return this.http.get(Constants.apiUrl + this.apiDeleteAccountUrl + currentPassword);
  }
}
