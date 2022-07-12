import { DeviceInfo } from "ngx-device-detector";

export class UpdateHubConnectionDetailsRequest {
    hubConnectionId: string;
    browser: string;
    browserVersion: string;
    os: string;
    osVersion: string;

    constructor(hubConnectionId: string, deviceInfo: DeviceInfo) {
        this.hubConnectionId = hubConnectionId;
        this.browser = deviceInfo.browser;
        this.browserVersion = deviceInfo.browser_version;
        this.os = deviceInfo.os;
        this.osVersion = deviceInfo.os_version;
    }
}