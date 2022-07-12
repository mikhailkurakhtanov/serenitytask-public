import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Constants } from "src/components/constants";
import { UserNotification } from "src/models/entities/user-notification.model";
import { UserNotificationView } from "src/models/views/user-notification-view.model";

@Injectable()
export class UserNotificationService {
    private readonly apiGetUserNotificationViewsUrl = 'user-notification/get-views';
    private readonly apiCreateUserNotificationUrl = 'user-notification/create';
    private readonly apiDeleteUserNotificationUrl = 'user-notification/delete?userNotificationToDeleteId=';

    constructor(private http: HttpClient) { }

    getViews(): Observable<UserNotificationView[]> {
        return this.http.get<UserNotificationView[]>(Constants.apiUrl + this.apiGetUserNotificationViewsUrl);
    }

    create(newUserNotification: UserNotification): Observable<any> {
        return this.http.post<any>(Constants.apiUrl + this.apiCreateUserNotificationUrl, newUserNotification);
    }

    delete(userNotificationId: number): Observable<any> {
        return this.http.delete<any>(Constants.apiUrl + this.apiDeleteUserNotificationUrl + userNotificationId);
    }
}