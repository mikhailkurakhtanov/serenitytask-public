import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs";
import { Constants } from "../../components/constants";
import { User } from "../../models/entities/user.model";
import { GetUserCardsRequest } from 'src/models/requests/user/get-user-cards-request.model';
import { UserSettings } from 'src/models/entities/user-settings.model';
import { UserNotificationConnector } from 'src/models/requests/user/user-notification-connector.model';
import { UserCard } from 'src/models/views/user-card.model';

@Injectable()
export class UserService {

  private readonly apiUpdateUrl = 'user/update';
  private readonly apiUpdateSettingsUrl = 'user/update-settings';
  private readonly apiCheckUsername = "user/check-username?username=";
  private readonly apiCheckEmail = "user/check-email?email=";
  private readonly apiGetUserCardsUrl = 'user/get-user-cards';
  private readonly apiAcceptFriendRequestUrl = 'user/accept-friend-request';
  private readonly apiRemoveUserFromFriendsListUrl = 'user/remove-friend?friendToRemoveId=';

  constructor(private http: HttpClient) {
  }

  checkUsername(username: string): Observable<boolean> {
    return this.http.get<boolean>(Constants.apiUrl + this.apiCheckUsername + username);
  }

  checkEmail(email: string): Observable<boolean> {
    return this.http.get<boolean>(Constants.apiUrl + this.apiCheckEmail + email);
  }

  getCurrentUser(authorizationToken: string): Observable<User> {
    return this.http.get<User>(Constants.apiUrl + "user/get");
  }

  updateUser(changedUser: User): Observable<any> {
    return this.http.put<any>(Constants.apiUrl + this.apiUpdateUrl, changedUser);
  }

  updateSettings(changedUserSettings: UserSettings): Observable<UserSettings> {
    return this.http.put<UserSettings>(Constants.apiUrl + this.apiUpdateSettingsUrl, changedUserSettings);
  }

  getUserCards(getUserCardsRequest: GetUserCardsRequest): Observable<UserCard[]> {
    return this.http.post<UserCard[]>(Constants.apiUrl + this.apiGetUserCardsUrl, getUserCardsRequest);
  }

  acceptFriendRequest(request: UserNotificationConnector): Observable<any> {
    return this.http.post<any>(Constants.apiUrl + this.apiAcceptFriendRequestUrl, request);
  }

  removeUserFromFriendsList(friendId: string): Observable<any> {
    return this.http.get<any>(Constants.apiUrl + this.apiRemoveUserFromFriendsListUrl + friendId);
  }
}
