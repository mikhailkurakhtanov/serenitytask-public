import { Component, EventEmitter, Input, Output } from "@angular/core";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import { TimeZoneType } from "src/models/entities/time-zone-type.model";
import { User } from "src/models/entities/user.model";
import { UserDetailsService } from "src/services/api/user-details.service";

@Component({
    selector: 'edit-time-zone-popup',
    templateUrl: 'edit-time-zone-popup.component.html',
    styleUrls: ['edit-time-zone-popup.component.css']
})
export class EditTimeZonePopupComponent {
    @Input() currentUser: User;
    @Input() isTimeZonePickerVisibleOnWarning: boolean;

    @Input() set isTimeZonePickerVisible(value: boolean) {
        if (value) {
            this.loadTimeZones();
        } else this.visible = false;
    }
    @Output() areTimeZonesLoadingToEmit: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() selectedTimeZoneToEmit: EventEmitter<TimeZoneType> = new EventEmitter<TimeZoneType>();
    @Output() isPopupShouldBeHidden: EventEmitter<boolean> = new EventEmitter<boolean>();

    visible: boolean;

    closePopupIcon = faTimes;

    timeZones: TimeZoneType[];

    constructor(private userDetailsService: UserDetailsService) {
        this.timeZones = [];
        this.visible = false;
    }

    loadTimeZones() {
        if (this.timeZones?.length == 0) {
            this.areTimeZonesLoadingToEmit.emit(true);
            this.userDetailsService.getTimeZones().subscribe(x => {
                this.timeZones = x;
                this.areTimeZonesLoadingToEmit.emit(false);
                this.visible = true;
            });
        } else this.visible = true;
    }

    selectTimeZone(selectedTimeZone: TimeZoneType) {
        this.selectedTimeZoneToEmit.emit(selectedTimeZone);
        this.isPopupShouldBeHidden.emit();
    }
}