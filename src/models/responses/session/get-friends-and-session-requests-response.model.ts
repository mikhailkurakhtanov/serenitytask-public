import { SessionRequest } from "src/models/entities/session-request.model";
import { FriendInfo } from "src/models/views/friend-info.model";

export class GetFriendsAndSessionRequestsResponse {
    friendsInfo: FriendInfo[];
    sessionRequests: SessionRequest[][];
}