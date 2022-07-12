import { Injectable } from "@angular/core";
import * as signalR from "@microsoft/signalr";
import { AuthenticationService } from "../api/authentication.service";
import { Constants } from "src/components/constants";

@Injectable()
export class TaskHub {
    hubConnection: signalR.HubConnection;

    constructor(private authenticationService: AuthenticationService) { }

    startConnection = () => {
        let accessToken = this.authenticationService.getAuthorizationToken();
        this.hubConnection = new signalR.HubConnectionBuilder()
            .configureLogging(signalR.LogLevel.None)
            .withUrl(Constants.apiUrl + 'task/', {
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