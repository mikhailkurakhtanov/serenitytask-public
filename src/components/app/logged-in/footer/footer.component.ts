import { Component, Input, OnInit } from "@angular/core";
import * as moment from 'moment';
import { Changelog } from "src/models/entities/changelog.model";
import { SystemMaintenanceService } from "src/services/api/system-maintenance.service";
import { DateTimeHelper } from "src/services/helpers/date-time.helper";

@Component({
    selector: 'footer-authorized',
    templateUrl: 'footer.component.html',
    styleUrls: ['footer.component.css']
})
export class FooterAuthorizedComponent implements OnInit {
    @Input() set receivedUserTimeZone(value: string) {
        if (value) {
            this.currentUserTimeZone = value;
            this.getChangelog();
        }
    }

    currentUserTimeZone: string;

    isChangelogPopupVisible: boolean;
    changelog: Changelog[];

    constructor(private dateTimeHelper: DateTimeHelper, private systemMaintenanceService: SystemMaintenanceService) { }

    ngOnInit(): void {
        this.changelog = [];
        this.isChangelogPopupVisible = false;
    }

    getChangelog() {
        this.systemMaintenanceService.getChangelog().subscribe(x => {
            if (x) {
                for (let index = 0; index < x.length; index++) {
                    x[index].creationDate = this.dateTimeHelper
                        .convertDateToUserTimeZone(new Date(x[index].creationDateString), this.currentUserTimeZone);

                    x[index].changesItems = x[index].changes.split(';');
                    x[index].displayDate = moment(x[index].creationDate).format('MMM Do, ddd');
                }

                this.changelog = x;
            }
        });
    }
}