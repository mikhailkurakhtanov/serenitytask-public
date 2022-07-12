import { Component, EventEmitter, HostListener, Input, OnInit, Output } from "@angular/core"
import { IconDefinition } from "@fortawesome/free-brands-svg-icons";
import {
  faInbox, faCalendar, faCalendarWeek, faCalendarAlt, faChevronUp, faChevronDown, faFireAlt
} from "@fortawesome/free-solid-svg-icons";
import { TasksNumberByInterval } from "src/models/views/left-side-menu.model";
import { TaskInterval } from "src/models/views/tasks-interval.model";

@Component({
  selector: 'menu',
  templateUrl: 'menu.component.html',
  styleUrls: ['menu.component.css']
})
export class TasksNumberByIntervalComponent implements OnInit {
  @Input() set receivedTasksNumberByInterval(value: TasksNumberByInterval) {
    if (value) {
      this.tasksNumberByInterval = value;
    }

    this.isTasksNumberReceived = true;
  }

  @Output() taskIntervalToEmit: EventEmitter<number> = new EventEmitter<number>();

  get taskInterval(): typeof TaskInterval {
    return TaskInterval;
  }

  tasksNumberByInterval: TasksNumberByInterval;

  selectedTaskInterval: number;

  windowWidth: number;

  inboxIcon: IconDefinition;
  overdueIcon: IconDefinition;

  todayDay: number;
  todayIcon: IconDefinition;
  tomorrowDay: number;
  thisWeekIcon: IconDefinition;
  upcomingIcon: IconDefinition;
  projectsListVisibilityIcon: IconDefinition;

  isTasksNumberReceived: boolean;

  constructor() {
    this.getWindowSize();
    this.changeSelectedTaskInterval(TaskInterval.Today);

    this.inboxIcon = faInbox;
    this.overdueIcon = faFireAlt;

    let currentDate = new Date();
    this.todayDay = currentDate.getDate();
    this.todayIcon = faCalendar;

    this.tomorrowDay = new Date().getDate() + 1;
    this.thisWeekIcon = faCalendarWeek;
    this.upcomingIcon = faCalendarAlt;
    this.projectsListVisibilityIcon = faChevronUp;

    this.tasksNumberByInterval = new TasksNumberByInterval;
  }

  ngOnInit(): void {
    this.isTasksNumberReceived = false;
  }

  @HostListener('window:resize', ['$event'])
  getWindowSize() {
    this.windowWidth = window.innerWidth;
  }

  changeProjectsListVisibilityIcon() {
    if (this.projectsListVisibilityIcon === faChevronUp) {
      this.projectsListVisibilityIcon = faChevronDown;
    } else this.projectsListVisibilityIcon = faChevronUp;
  }

  applyFaLayersTextStyling(elementId: string) {
    let element = document.getElementById(elementId);
    if (element) element.style.color = '#547e55';
  }

  resetFaLayersTextStyling(elementId: string) {
    let element = document.getElementById(elementId);
    if (element) element.style.color = 'white';
  }

  changeSelectedTaskInterval(newTaskInterval: TaskInterval) {
    this.selectedTaskInterval = newTaskInterval;
    this.taskIntervalToEmit.emit(this.selectedTaskInterval);
  }
}