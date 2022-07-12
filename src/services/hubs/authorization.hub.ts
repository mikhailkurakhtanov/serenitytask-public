import { Injectable } from "@angular/core";
import * as signalR from "@microsoft/signalr";
import { DeviceDetectorService } from "ngx-device-detector";
import { Constants } from "src/components/constants";
import { UpdateHubConnectionDetailsRequest } from "src/models/requests/hub/update-hub-connection-details-request.model";
import { AuthenticationService } from "../api/authentication.service";

@Injectable()
export class AuthorizationHub {
    hubConnectionId: string;

    hubConnection: signalR.HubConnection;

    constructor(private authenticationService: AuthenticationService,
        private deviceDetectorService: DeviceDetectorService) {
        this.hubConnectionId = '';
    }

    startConnection = () => {
        let accessToken = this.authenticationService.getAuthorizationToken();
        this.hubConnection = new signalR.HubConnectionBuilder()
            .configureLogging(signalR.LogLevel.None)
            .withUrl(Constants.apiUrl + 'auth/', {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets,
                accessTokenFactory: () => accessToken
            })
            .build();

        this.hubConnection.start()
            .then(() => {
                this.hubConnection.invoke('getConnectionId').then(x => {
                    this.hubConnectionId = x;

                    let deviceInfo = this.deviceDetectorService.getDeviceInfo();
                    if (deviceInfo) {
                        let request = new UpdateHubConnectionDetailsRequest(this.hubConnectionId, deviceInfo);
                        this.hubConnection.invoke('updateHubConnectionDetails', request);
                    }
                });
            });

        setInterval(() => {
            if (this.hubConnection.state === signalR.HubConnectionState.Disconnected) {
                this.hubConnection.start();
            }
        }, 3000);
    }
}