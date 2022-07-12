import { SessionRequest } from "../entities/session-request.model";
import { FriendInfo } from "./friend-info.model";

export class SelectedChat {
    friendInfo: FriendInfo;
    isChatMenuVisible: boolean;
    sessionRequests: SessionRequest[];
}