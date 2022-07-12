import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Constants } from "../../components/constants";
import { UserDetails } from "../../models/entities/user-details.model";
import { TimeZoneType } from "src/models/entities/time-zone-type.model";
import { Achievement } from "src/models/entities/achievement.model";

@Injectable()
export class UserDetailsService {
    private readonly apiUpdateUserDetailsUrl = 'user-details/update';
    private readonly apiUpdateProfilePictureUrl = 'user-details/update-avatar';
    private readonly apiGetTimeZonesUrl = 'user-details/get-timezones';
    private readonly apiGetAchievementsUrl = 'user-details/get-achievements?userDetailsId=';

    constructor(private http: HttpClient) { }

    getTimeZones(): Observable<TimeZoneType[]> {
        return this.http.get<TimeZoneType[]>(Constants.apiUrl + this.apiGetTimeZonesUrl);
    }

    updateProfilePicture(profilePictureData: FormData): Observable<any> {
        return this.http.put<any>(Constants.apiUrl + this.apiUpdateProfilePictureUrl,
            profilePictureData, { reportProgress: true, observe: 'events' });
    }

    updateUserDetails(changedUserDetails: UserDetails): Observable<any> {
        return this.http.put<any>(Constants.apiUrl + this.apiUpdateUserDetailsUrl, changedUserDetails);
    }
}
