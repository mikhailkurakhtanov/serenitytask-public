import { SessionRequest } from "../entities/session-request.model";
import { FriendInfo } from "./friend-info.model";

export class ChatPreview {
    friendInfo: FriendInfo;
    sessionRequests: SessionRequest[];
}