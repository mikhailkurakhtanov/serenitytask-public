import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Constants } from "src/components/constants";
import { SessionRequest } from "src/models/entities/session-request.model";
import { Session } from "src/models/entities/session.model";
import { ChangeSessionMemberTaskRequest } from "src/models/requests/session/change-session-member-task-request.model";
import { SetReadyStatusForJoinedMemberRequest } from "src/models/requests/session/set-ready-status-for-joined-member-request.model";
import { GetFriendsAndSessionRequestsResponse } from "src/models/responses/session/get-friends-and-session-requests-response.model";

@Injectable()
export class SessionService {
    private readonly apiCreateSessionUrl = 'session/create';
    private readonly apiJoinSessionUrl = 'session/join?sessionId=';
    private readonly apiLeaveSessionUrl = 'session/leave?sessionId=';
    private readonly apiCancelSessionUrl = 'session/cancel?sessionId=';
    private readonly apiStartSessionUrl = 'session/start?sessionId=';
    private readonly apiSetReadyStatusForJoinedMemberUrl = 'session/set-ready-status';
    private readonly apiChangeSessionMemberTaskUrl = 'session/change-tracked-task';

    private readonly apiGetSessionsUrl = 'session/get-all';
    private readonly apiGetFriendsAndSessionRequestsUrl = 'session/get-friends-and-session-requests/';
    private readonly apiSendNewSessionRequestUrl = 'session/send-request';
    private readonly apiRejectSessionRequestUrl = 'session/reject-request?sessionRequestId=';
    private readonly apiReadSessionRequestUrl = 'session/read?sessionRequestId=';

    constructor(private http: HttpClient) { }

    create(sessionToCreate: Session): Observable<any> {
        return this.http.post<any>(Constants.apiUrl + this.apiCreateSessionUrl, sessionToCreate);
    }

    join(sessionId: number): Observable<any> {
        return this.http.get<any>(Constants.apiUrl + this.apiJoinSessionUrl + sessionId);
    }

    cancel(sessionId: number): Observable<any> {
        return this.http.get<any>(Constants.apiUrl + this.apiCancelSessionUrl + sessionId);
    }

    leave(sessionId: number): Observable<any> {
        return this.http.get<any>(Constants.apiUrl + this.apiLeaveSessionUrl + sessionId);
    }

    start(sessionId: number): Observable<any> {
        return this.http.get<any>(Constants.apiUrl + this.apiStartSessionUrl + sessionId);
    }

    setReadyStatusForJoinedMember(request: SetReadyStatusForJoinedMemberRequest): Observable<any> {
        return this.http.put<any>(Constants.apiUrl + this.apiSetReadyStatusForJoinedMemberUrl, request);
    }

    changeTrackedTask(request: ChangeSessionMemberTaskRequest): Observable<any> {
        return this.http.put<any>(Constants.apiUrl + this.apiChangeSessionMemberTaskUrl, request);
    }

    getAll(): Observable<Session[]> {
        return this.http.get<Session[]>(Constants.apiUrl + this.apiGetSessionsUrl);
    }

    getFriendsAndSessionRequests(): Observable<GetFriendsAndSessionRequestsResponse> {
        return this.http.get<GetFriendsAndSessionRequestsResponse>(Constants.apiUrl + this.apiGetFriendsAndSessionRequestsUrl);
    }

    sendSessionRequest(newSessionRequest: SessionRequest): Observable<any> {
        return this.http.post<any>(Constants.apiUrl + this.apiSendNewSessionRequestUrl, newSessionRequest);
    }

    readSessionRequest(sendRequestId: number): Observable<any> {
        return this.http.get<any>(Constants.apiUrl + this.apiReadSessionRequestUrl + sendRequestId);
    }

    rejectSessionRequest(sessionRequestId: number): Observable<any> {
        return this.http.delete<any>(Constants.apiUrl + this.apiRejectSessionRequestUrl + sessionRequestId);
    }
}