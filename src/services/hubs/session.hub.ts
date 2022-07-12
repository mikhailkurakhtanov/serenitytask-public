import { Injectable } from "@angular/core";
import * as signalR from "@microsoft/signalr";
import { Constants } from "src/components/constants";
import { AuthenticationService } from "../api/authentication.service";

@Injectable()
export class SessionHub {
    hubConnection: signalR.HubConnection;

    constructor(private authenticationService: AuthenticationService) { }

    startConnection = () => {
        let accessToken = this.authenticationService.getAuthorizationToken();
        this.hubConnection = new signalR.HubConnectionBuilder()
            .configureLogging(signalR.LogLevel.None)
            .withUrl(Constants.apiUrl + 'session/', {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets,
                accessTokenFactory: () => accessToken
            })
            .build();

        this.hubConnection.start();
        this.activateDisconnectedConnectionListener();
    }

    activateDisconnectedConnectionListener = () => {
        setInterval(() => {
            if (this.hubConnection.state === signalR.HubConnectionState.Disconnected) {
                this.hubConnection.start();
            }
        }, 3000);
    }
}