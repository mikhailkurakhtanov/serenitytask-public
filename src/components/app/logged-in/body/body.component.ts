import { Component, HostListener, Input } from '@angular/core';
import { trigger, transition, style, sequence, animate, state } from '@angular/animations';

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCaretLeft, faCaretRight, faStopwatch, faTasks, faSeedling, faCommentAlt } from '@fortawesome/free-solid-svg-icons';

import { Task } from 'src/models/entities/task.model';
import { Plant } from 'src/models/entities/plant.model';
import { TaskInterval } from 'src/models/views/tasks-interval.model';
import { TasksNumberByInterval } from 'src/models/views/left-side-menu.model';
import { MobileMenu } from "../../../../models/views/mobile-menu.model";
import { User } from 'src/models/entities/user.model';

@Component({
  selector: 'body-authorized',
  templateUrl: 'body.component.html',
  styleUrls: ['body.component.css'],
  animations: [
    trigger('changeWorkspaceMenuState', [
      transition('false => true', [
        style({ opacity: '0' }),
        sequence([
          animate("0.25s ease",
            style({ width: '20%' }))
        ]),
        sequence([
          animate("0.1s ease",
            style({ opacity: '1' }))
        ])
      ]),
      transition('true => false', [
        sequence([
          animate("0.1s ease", style({ opacity: '0' }))
        ]),
        sequence([
          animate("0.25s ease",
            style({ width: 0 }))
        ])
      ]),
      state('true', style({ width: '20%' })),
      state('false', style({ width: 0 }))
    ])
  ]
})
export class BodyComponent {
  @Input() currentUser: User;
  @Input() receivedUserPlant: Plant;

  get mobileMenuBase(): typeof MobileMenu {
    return MobileMenu;
  }

  userTasks: Task[];
  userTasksByDateInterval: Task[];

  taskForTimer: Task;

  selectedSection: MobileMenu;
  windowWidth: number;

  currentDate: Date;
  nextMondayDate: Date;

  taskInterval: TaskInterval;
  tasksNumberByInterval: TasksNumberByInterval;

  workspaceMenuVisibilityIcon: IconDefinition;
  isWorkspaceMenuVisible: boolean;
  workspaceMenuState: boolean;

  //#region MobileMenu properties

  tasksSectionIcon = faTasks;
  timerSectionIcon = faStopwatch;
  plantSectionIcon = faSeedling;
  chatSectionIcon = faCommentAlt;

  isTasksIntervalsVisible: boolean;

  //#endregion

  constructor() {
    this.isTasksIntervalsVisible = false;
    this.selectedSection = 0;

    this.userTasks = [];
    this.userTasksByDateInterval = [];

    this.getWindowSize();

    this.isWorkspaceMenuVisible = true;
    this.workspaceMenuState = true;
    this.workspaceMenuVisibilityIcon = faCaretLeft;
  }

  @HostListener('window:resize', ['$event'])
  getWindowSize() {
    this.windowWidth = window.innerWidth;
  }

  applyTasksNamesStyling() {
    let textAreas = document.getElementsByClassName('task-name');
    if (textAreas.length > 0) {

      // @ts-ignore
      for (let element of textAreas) {
        element.style.height = 'auto';
        element.style.height = element.scrollHeight + 'px';
      }
    }
  }

  applySelectedTaskInterval(selectedTaskInterval: TaskInterval) {
    this.selectedSection = MobileMenu.Tasks;
    this.isTasksIntervalsVisible = false;

    if (selectedTaskInterval >= 0) {
      this.taskInterval = selectedTaskInterval;
    }
  }

  applyTasksNumberByInterval(actualTasksNumberByInterval: TasksNumberByInterval) {
    this.tasksNumberByInterval = actualTasksNumberByInterval;
  }

  changeWorkspaceMenuVisibility() {
    this.workspaceMenuState = !this.workspaceMenuState;

    if (this.workspaceMenuVisibilityIcon == faCaretRight) {
      this.workspaceMenuVisibilityIcon = faCaretLeft;
    } else this.workspaceMenuVisibilityIcon = faCaretRight;

    if (!this.isWorkspaceMenuVisible) {
      this.isWorkspaceMenuVisible = true;
    } else setTimeout(() => {
      this.isWorkspaceMenuVisible = !this.isWorkspaceMenuVisible;
    }, 240);
  }

  applyTaskForTimer(task: any) {
    if (this.windowWidth < 1000) this.selectedSection = MobileMenu.Timer;

    this.taskForTimer = task;
  }
}
