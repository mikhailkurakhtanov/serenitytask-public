import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Constants } from "src/components/constants";
import { Changelog } from "src/models/entities/changelog.model";
import { ProblemReport } from "src/models/entities/problem-report.model";

@Injectable()
export class SystemMaintenanceService {
    private readonly apiCreateProblemReportUrl = 'system-maintenance/create';
    private readonly apiGetChangelogUrl = 'system-maintenance/get-changelog';

    constructor(private http: HttpClient) { }

    create(newProblemReport: ProblemReport): Observable<any> {
        return this.http.post<any>(Constants.apiUrl + this.apiCreateProblemReportUrl, newProblemReport);
    }

    getChangelog(): Observable<Changelog[]> {
        return this.http.get<Changelog[]>(Constants.apiUrl + this.apiGetChangelogUrl);
    }
}
