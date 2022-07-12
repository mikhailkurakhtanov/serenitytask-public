import { SocialUser } from "@abacritt/angularx-social-login";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Constants } from "src/components/constants";

@Injectable()
export class GoogleIntegrationService {
    private readonly apiConnectGoogleAccountUrl = 'integration/google/connect';
    private readonly apiDisconnectGoogleAccountUrl = 'integration/google/disconnect';
    private readonly apiUpdateCredentialUrl = 'integration/google/update';

    constructor(private http: HttpClient) { }

    connect(data: SocialUser): Observable<any> {
        return this.http.post<any>(Constants.apiUrl + this.apiConnectGoogleAccountUrl, data);
    }

    disconnect(): Observable<any> {
        return this.http.delete<any>(Constants.apiUrl + this.apiDisconnectGoogleAccountUrl);
    }

    update(data: SocialUser): Observable<any> {
        return this.http.put<any>(Constants.apiUrl + this.apiUpdateCredentialUrl, data);
    }
}