import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Task } from "src/models/entities/task.model";
import { User } from "src/models/entities/user.model";

@Component({
    selector: 'widgets',
    templateUrl: 'widgets.component.html',
    styleUrls: ['widgets.component.css']
})
export class WidgetsComponent {
    @Input() currentUser: User;
    @Input() receivedTaskForTimer: Task;

    // @Output() earnedExperienceToEmit: EventEmitter<number> = new EventEmitter<number>();
    // @Output() changedTaskToEmit: EventEmitter<Task> = new EventEmitter<Task>();

    // constructor() { }

    // applyObjectChanges(value: any) {
    //     if (typeof value === 'number') this.earnedExperienceToEmit.emit(value);
    //     if (value instanceof Task) this.changedTaskToEmit.emit(value);
    // }
}
