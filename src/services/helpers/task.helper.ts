import { Injectable } from "@angular/core";
import * as moment from "moment";
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import { faBookmark, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { Task } from "src/models/entities/task.model";
import { TaskInterval } from "src/models/views/tasks-interval.model";
import { DateTimeHelper } from "./date-time.helper";

@Injectable()
export class TaskHelper {
    constructor(private dateTimeHelper: DateTimeHelper) { }

    map(baseTask: Task): Task {
        let mappedTask = new Task();
        mappedTask.id = baseTask.id;
        mappedTask.name = baseTask.name;
        mappedTask.priority = baseTask.priority;
        mappedTask.description = baseTask.description;

        mappedTask.creationDate = baseTask.creationDate;
        mappedTask.date = baseTask.date;
        mappedTask.deadline = baseTask.deadline;

        mappedTask.creationDateString = baseTask.creationDateString;
        mappedTask.dateString = baseTask.dateString;
        mappedTask.deadlineString = baseTask.deadlineString;

        mappedTask.trackedTime = baseTask.trackedTime;
        mappedTask.isCompleted = baseTask.isCompleted;

        mappedTask.userId = baseTask.userId;
        mappedTask.parentTaskId = baseTask.parentTaskId;
        mappedTask.subtasks = baseTask.subtasks;
        mappedTask.files = baseTask.files;

        mappedTask.dynamicDate = baseTask.dynamicDate;
        mappedTask.interval = baseTask.interval;
        mappedTask.dynamicDeadline = baseTask.dynamicDeadline;

        mappedTask.taskIconState = baseTask.taskIconState;
        mappedTask.priorityIconState = baseTask.priorityIconState;
        mappedTask.addSubtaskIconState = baseTask.addSubtaskIconState;
        mappedTask.subtasksIconState = baseTask.subtasksIconState;

        mappedTask.isDetailsVisible = baseTask.isDetailsVisible;
        mappedTask.isSubtasksVisible = baseTask.isSubtasksVisible;
        mappedTask.isAddSubtaskInputVisible = baseTask.isAddSubtaskInputVisible;

        mappedTask.deleteAnimation = baseTask.deleteAnimation;
        mappedTask.descriptionScrollHeight = baseTask.descriptionScrollHeight;
        mappedTask.state = baseTask.state;

        return mappedTask;
    }

    getFormattedTask(task: Task, timezone: string): Task {
        task.state = 'show';
        task.priorityIconState = faBookmark;
        task.subtasksIconState = faChevronUp;
        task.taskIconState = faSquare;
        task.isDetailsVisible = task.isDetailsVisible !== null ? task.isDetailsVisible : false;
        task.isSubtasksVisible = task.isSubtasksVisible !== null ? task.isSubtasksVisible : false;
        task.isAddSubtaskInputVisible = false;

        if (task.creationDateString?.length > 0) {
            task.creationDate = this.dateTimeHelper.convertDateToUserTimeZone(new Date(task.creationDateString), timezone);
        }

        if (task.dateString?.length > 0) {
            task.date = this.dateTimeHelper.convertDateToUserTimeZone(new Date(task.dateString), timezone);
        }

        if (task.deadlineString?.length > 0) {
            task.deadline = this.dateTimeHelper.convertDateToUserTimeZone(new Date(task.deadlineString), timezone);
        }

        task.dynamicDate = task.date ? this.getDynamicDate(task.date) : 'Date';
        task.dynamicDeadline = task.deadline ? this.getDynamicDate(task.deadline) : 'Deadline';

        task.interval = this.getDateIntervalByDate(task.date, timezone);

        if (task.subtasks) {
            let subtaskNumber = task.subtasks.length;
            let counter = 1;

            for (let i = 0; counter <= subtaskNumber;) {
                if (task.subtasks[i].isCompleted) {
                    task.subtasks.splice(i, 1);
                } else {
                    task.subtasks[i].taskIconState = faSquare;
                    i++;
                }
                counter++;
            }
        } else task.subtasks = [];

        if (!task.files) task.files = [];

        return this.map(task);
    }

    getDateIntervalByDate(taskDate: Date | null = null, timezone: string): TaskInterval {
        if (!taskDate) {
            return TaskInterval.Inbox;
        } else taskDate = this.dateTimeHelper.convertDateToUserTimeZone(taskDate, timezone);

        taskDate.setHours(0, 0, 0, 0);

        let currentDate = this.dateTimeHelper.getCurrentDate(timezone);
        let tomorrowDate = this.dateTimeHelper.getTomorrowDate(timezone);
        let nextMondayDate = this.dateTimeHelper.getNextMondayDate(timezone);

        if (taskDate.getTime() < currentDate.getTime()) return TaskInterval.Overdue;

        if (taskDate.getTime() == currentDate.getTime()
            || taskDate.getTime() < tomorrowDate.getTime()) return TaskInterval.Today;

        if (taskDate.getTime() == tomorrowDate.getTime()) return TaskInterval.Tomorrow;
        if (taskDate.getTime() < nextMondayDate.getTime()) return TaskInterval.ThisWeek;

        return TaskInterval.Upcoming;
    }

    getDynamicDate(date: Date): string {
        return moment(date).calendar().split(" at")[0];
    }

    getHistoryNoteDynamicDate(date: Date): string {
        return moment(date).format("Do dddd MMMM gggg");
    }
}
