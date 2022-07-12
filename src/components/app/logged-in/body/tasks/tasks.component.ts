import {
  AfterViewChecked, HostListener, Component, ElementRef,
  EventEmitter, OnInit, Output, QueryList, ViewChild, ViewChildren, Input
} from '@angular/core';
import { animate, sequence, state, style, transition, trigger } from "@angular/animations";

import * as moment from "moment";

import {
  faCalendarDay, faFlag, faSearch, faSeedling, faBookmark, faPlus, faChevronUp, faExternalLinkAlt,
  faEllipsisV, faTimes, faCheck, faCaretUp, faTrash, faDownload, faLink, faFileAlt,
  faFileWord, faFileAudio, faFileCode, faFileImage, faFilePdf, faFilePowerpoint, faFileExcel, faFileVideo, faStopwatch
} from "@fortawesome/free-solid-svg-icons";
import { faSquare, IconDefinition } from "@fortawesome/free-regular-svg-icons";
import { DxDateBoxComponent } from "devextreme-angular";

import { TaskService } from "src/services/api/task.service";
import { TaskHelper } from "src/services/helpers/task.helper";
import { DateTimeHelper } from 'src/services/helpers/date-time.helper';
import { FileService } from 'src/services/api/file.service';
import { TaskHub } from 'src/services/hubs/task.hub';

import { Task } from "src/models/entities/task.model";
import { TaskInterval } from "src/models/views/tasks-interval.model";
import { CompleteTaskResponse } from 'src/models/responses/task/complete-task-response';
import { TasksNumberByInterval } from 'src/models/views/left-side-menu.model';
import { PlantExperienceHelper } from 'src/services/helpers/plant-experience.helper';
import { PlantService } from 'src/services/api/plant.service';
import { ExperienceChangingType } from 'src/models/enums/experience-changing-type.enum';
import { ExperienceReasonType } from 'src/models/enums/experience-reason-type.enum';

@Component({
  selector: 'tasks',
  templateUrl: 'tasks.component.html',
  styleUrls: ['tasks.component.css'],
  animations: [
    trigger('changeTaskPaddingState', [
      transition('* => true', [
        sequence([
          animate('0.25s ease',
            style({ padding: '15px', 'box-shadow': '0 0 15px 2px #c8c8c8' })
          )
        ])
      ]),
      transition('true => false', [
        sequence([
          animate('0.25s ease',
            style({ padding: 0, 'box-shadow': '0 0 0 0 #c8c8c8' })
          )
        ])
      ]),
      state('true', style({ padding: '15px', 'box-shadow': '0 0 15px 2px #c8c8c8' })),
      state('false', style({ padding: 0, 'box-shadow': '0 0 0 0 #c8c8c8' }))
    ]),

    trigger('changeShowAddTaskFormButtonState', [
      transition('* => true', [
        sequence([
          animate('0.25s ease',
            style({ transform: 'translateY(-5px)' }))
        ])
      ]),
      state('true', style({ transform: 'translateY(-5px)' })),
      transition('true => false', [
        sequence([
          animate('0.25s ease',
            style({ transform: 'translateY(0px)' }))
        ]),
        state('false', style({ transform: 'translateY(0px)' }))
      ])
    ]),

    trigger('changeAddTaskPanelState', [
      transition('* => true', [
        style({ height: '0', opacity: '0', transform: 'translateY(-15px)', 'box-shadow': 'none', 'padding-bottom': 0 }),
        sequence([
          animate("0.25s ease",
            style({ height: '*', opacity: 0.5, transform: 'translateY(0px)', 'padding-bottom': '15px' }))
        ])
      ]),
      transition('true => false', [
        style({ opacity: 0.5, transform: 'translateY(0px)', 'padding-bottom': '15px' }),
        sequence([
          animate("0.25s ease",
            style({ height: 0, opacity: 0, transform: 'translateY(-15px)', 'padding-bottom': '0' }))
        ])
      ]),
      state('false', style({ height: 0, opacity: 0, transform: 'translateY(-15px)', 'padding-bottom': 0 })),
      state('true', style({ height: '*', opacity: 0.5, transform: 'translateY(0px)', 'padding-bottom': '15px' }))
    ]),

    trigger('changeAddSubtaskPanelState', [
      transition('false => true', [
        style({ height: '0', opacity: '0', transform: 'translateY(-15px)', margin: 0 }),
        sequence([
          animate("0.25s ease",
            style({
              height: '*', opacity: 0.5, transform: 'translateY(0px)',
              margin: '10px 0px 10px 0px', 'pointer-events': 'all'
            }))
        ])
      ]),
      transition('true => false', [
        sequence([
          animate("0.25s ease",
            style({ height: '0', opacity: '0', transform: 'translateY(-15px)', margin: 0, 'pointer-events': 'none' }))
        ])
      ]),
      state('false', style({ height: 0, opacity: 0, margin: 0, 'pointer-events': 'none' })),
      state('true', style({
        height: '*', opacity: 0.5, transform: 'translateY(0px)',
        margin: '10px 0px 10px 0px', 'pointer-events': 'all'
      }))
    ]),

    trigger('taskState', [
      transition("void => show", [
        style({ height: 0, opacity: 0, transform: 'translateY(-15px)' }),
        sequence([
          animate('0.5s ease',
            style({ height: '*', opacity: 1, transform: 'translateY(0)' })
          )
        ])
      ]),
      transition('* => void', [
        style({ height: '*', opacity: '1', transform: 'translateY(0)', 'box-shadow': 'none', margin: '*' }),
        sequence([
          animate("0.5s ease",
            style({ height: '0', opacity: '0', transform: 'translateY(-15px)', 'box-shadow': 'none', margin: 0 }))
        ])
      ])
    ]),

    trigger('deletingTaskProcess', [
      transition('* => true', [
        style({ opacity: 1, 'box-shadow': 'none' }),
        sequence([
          animate("0.2s ease",
            style({ opacity: 0.25, 'box-shadow': 'none' })),
          animate("0.2s ease",
            style({ opacity: 1, 'box-shadow': 'none' }))
        ])
      ])
    ]),

    trigger('changeTaskFileActionState', [
      transition('* => true', [
        style({ transform: 'scale(1)' }),
        sequence([
          animate('0.25s ease',
            style({ transform: 'scale(1.25)' }))
        ])
      ])
    ])
  ]
})
export class TasksComponent implements OnInit, AfterViewChecked {
  @Input() set receivedTaskInterval(value: TaskInterval) {
    if (value >= 0) {
      this.currentTaskInterval = value;
    } else this.currentTaskInterval = TaskInterval.Today;

    this.activateReceiveCurrentUserTimeZoneListener();
    this.applyTaskInverval();
  }

  @Input() set receivedCurrentUserTimeZone(value: string | undefined) {
    if (value) {
      this.currentUserTimeZone = value;
    }
  }

  @Output() taskToEmit: EventEmitter<Task> = new EventEmitter<Task>();
  @Output() taskForTimerToEmit: EventEmitter<Task> = new EventEmitter<Task>();
  @Output() isReadyToGetTasks: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() tasksNumberByIntervalToEmit: EventEmitter<TasksNumberByInterval> = new EventEmitter<TasksNumberByInterval>();

  @ViewChild('newTaskName') newTaskNameInput: ElementRef;
  @ViewChild('newSubtaskName') newSubtaskNameInput: ElementRef;
  @ViewChild('searchInput') searchInput: ElementRef;

  @ViewChildren('taskName') taskNameTextAreas: any;
  @ViewChildren('subtaskName') subtaskNameTextAreas: any;

  @ViewChildren('taskProperties') taskPropertiesElements: QueryList<any>;
  @ViewChildren('taskContent') taskContentElements: QueryList<any>;
  @ViewChildren('taskDetails') taskDetailsElements: QueryList<any>;

  get taskIntervalBase(): typeof TaskInterval {
    return TaskInterval;
  }

  get momentBase(): typeof moment {
    return moment;
  }

  currentUserTimeZone: string;

  tasks: Task[];
  tasksByInterval: Task[];

  currentTaskInterval: TaskInterval;
  tasksNumberByInterval: TasksNumberByInterval;

  windowWidth: number;

  isNewTaskInputGroupVisible = false;
  addTaskPanelState = false;
  isComponentLoaded: boolean;
  showAddTaskFormButtonState: boolean;
  isCompletedTasksSectionActive: boolean;

  searchQuery: string;

  currentDate: Date;
  tomorrowDate: Date;
  nextMondayDate: Date;

  isToastNotificationVisible: boolean;
  toastNotificationContent: string;

  //#region Icons

  uncompletedTaskIcon = faSquare;
  priorityIcon = faBookmark;
  dateIcon = faCalendarDay;
  deadlineIcon = faFlag;
  timerIcon = faStopwatch;
  searchIcon = faSearch;
  addTaskIcon = faPlus;
  saveTaskIcon = faCheck;
  taskMenuIcon = faEllipsisV;
  closeIcon = faTimes;
  completedTasksSectionToggle = faCaretUp;
  deleteTaskIcon = faTrash;

  showAddSubtaskPanelIcon = faPlus;
  hideAddSubtaskPanelIcon = faChevronUp;

  uploadTaskFileIcon = faPlus;
  deleteTaskFileIcon = faTrash;
  downloadTaskFileIcon = faDownload;
  taskFileLinkIcon = faLink;
  goTaskFileLinkIcon = faExternalLinkAlt;

  //#endregion

  constructor(private taskService: TaskService, private fileService: FileService, private plantService: PlantService,
    private taskHelper: TaskHelper, private plantExperienceHelper: PlantExperienceHelper,
    private dateTimeHelper: DateTimeHelper, private taskHub: TaskHub) {
    this.isComponentLoaded = false;

    this.showAddTaskFormButtonState = false;
    this.searchQuery = '';

    this.isCompletedTasksSectionActive = false;

    this.isReadyToGetTasks.emit(true);
  }

  async ngOnInit() {
    this.isToastNotificationVisible = false;

    this.tasksNumberByInterval = new TasksNumberByInterval;
    this.tasks = [];
    this.tasksByInterval = [];

    await this.getCurrentUserPlantId();
    await this.activateReceiveCurrentUserTimeZoneListener();

    this.currentDate = this.dateTimeHelper.getCurrentDate(this.currentUserTimeZone);
    this.tomorrowDate = this.dateTimeHelper.getTomorrowDate(this.currentUserTimeZone);
    this.nextMondayDate = this.dateTimeHelper.getNextMondayDate(this.currentUserTimeZone);

    this.taskService.getAll().subscribe(receivedTasks => {
      if (receivedTasks?.length > 0) {
        for (let index = 0; index < receivedTasks.length; index++) {
          receivedTasks[index] = this.taskHelper.getFormattedTask(receivedTasks[index], this.currentUserTimeZone);
          this.risetasksNumberByInterval(receivedTasks[index]);
        }

        this.tasks = this.getSortedList(receivedTasks);
        this.applyTaskInverval();
        this.tasksNumberByIntervalToEmit.emit(this.tasksNumberByInterval);

        this.checkTasksOnExpiredDeadlines();
      } else {
        this.tasks = [];
        this.tasksNumberByInterval = new TasksNumberByInterval();
        this.tasksNumberByIntervalToEmit.emit(this.tasksNumberByInterval);
      }

      this.isComponentLoaded = true;
    })

    this.getWindowSize();
    this.taskHub.startConnection();
    this.activateCreateTaskListener();
    this.activateChangeTaskListener();
    this.actviateCompleteTaskListener();
  }

  ngAfterViewChecked() {
    if (this.taskNameTextAreas.length > 0) {
      for (let taskName of this.taskNameTextAreas) {
        this.applyTextareaStyling(taskName.nativeElement);
      }
      for (let subtaskName of this.subtaskNameTextAreas) {
        this.applyTextareaStyling(subtaskName.nativeElement);
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  getWindowSize() {
    this.windowWidth = window.innerWidth;
  }

  async activateReceiveCurrentUserTimeZoneListener() {
    let listener = setInterval(() => {
      if (this.currentUserTimeZone) clearInterval(listener);
    }, 250);
  }

  //#region TaskHubListeners

  activateCreateTaskListener = () => {
    this.taskHub.hubConnection.on('receiveCreatedTask', (createdTaskJson: string) => {
      let createdTask = JSON.parse(createdTaskJson) as Task;

      let formattedTask = this.taskHelper.getFormattedTask(createdTask, this.currentUserTimeZone);
      if (formattedTask.parentTaskId != null) {

        let parentTaskIndex = this.tasks.findIndex(x => x.id === formattedTask.parentTaskId);
        if (parentTaskIndex >= 0) this.tasks[parentTaskIndex].subtasks.push(formattedTask);
      } else {

        // unshifting task to the main array
        formattedTask.state = 'active';
        this.tasks.unshift(formattedTask);

        // unshifting task to the array by interval if it has the current interval
        switch (this.currentTaskInterval) {
          case TaskInterval.ThisWeek:
            if (formattedTask.interval === TaskInterval.ThisWeek || TaskInterval.Today) {
              this.tasksByInterval.unshift(formattedTask);
            } else if (formattedTask.interval === TaskInterval.Tomorrow && this.tomorrowDate < this.nextMondayDate) {
              this.tasksByInterval.unshift(formattedTask);
            }
            break;
          default:
            if (this.currentTaskInterval === formattedTask.interval) this.tasksByInterval.unshift(formattedTask);
        }

        // update tasks number by interval
        this.risetasksNumberByInterval(formattedTask);
        this.tasksNumberByIntervalToEmit.emit(this.tasksNumberByInterval);
      }
    });
  }

  toLowerCaseProps(obj: any): Task {
    return Object.entries(obj).reduce((a, [key, val]) => {
      a[key.toLowerCase()] = val;
      return a;
    }, {} as any) as unknown as Task;
  }

  activateChangeTaskListener = () => {
    this.taskHub.hubConnection.on('receiveChangedTask', async (updatedTaskJson: string) => {
      let updatedTask = JSON.parse(updatedTaskJson) as Task;

      let formattedTask = this.taskHelper.getFormattedTask(updatedTask, this.currentUserTimeZone);

      // checking if task is a subtask
      if (formattedTask.parentTaskId != null) {

        // applying task changes to the parent task in the main array
        let parentTaskIndex = this.tasks.findIndex(x => x.id === formattedTask.parentTaskId);
        if (parentTaskIndex >= 0) {
          let subtaskIndex = this.tasks[parentTaskIndex].subtasks.findIndex(x => x.id === formattedTask.id);
          if (subtaskIndex >= 0) this.tasks[parentTaskIndex].subtasks[subtaskIndex] = formattedTask;
        }

        // applying task changes to the parent task in the array by interval
        parentTaskIndex = this.tasksByInterval.findIndex(x => x.id === formattedTask.id);
        if (parentTaskIndex >= 0) {
          let subtaskIndex = this.tasksByInterval[parentTaskIndex].subtasks.findIndex(x => x.id === formattedTask.id);
          if (subtaskIndex >= 0) this.tasksByInterval[parentTaskIndex].subtasks[subtaskIndex] = formattedTask;
        }
      } else {

        // applying task changes to the task in the main array
        let taskIndex = this.tasks.findIndex(x => x.id === formattedTask.id);
        if (taskIndex >= 0) {
          let previousTask = this.tasks[taskIndex];
          this.tasks[taskIndex] = formattedTask;

          // updating tasks number by interval
          if (previousTask.interval !== formattedTask.interval) {
            await this.changeTasksNumberByInterval(previousTask, formattedTask);
            this.tasksNumberByIntervalToEmit.emit(this.tasksNumberByInterval);
          }
        }

        taskIndex = this.tasksByInterval.findIndex(x => x.id === formattedTask.id);
        if (taskIndex >= 0) {

          // removing task from the array by interval if intervals are not the same
          switch (this.currentTaskInterval) {
            case TaskInterval.ThisWeek:
              if (formattedTask.interval === TaskInterval.Tomorrow) {
                if (this.tomorrowDate > this.nextMondayDate) this.tasksByInterval.splice(taskIndex, 1);
              } else if (formattedTask.interval !== TaskInterval.ThisWeek
                && formattedTask.interval !== TaskInterval.Today) {
                this.tasksByInterval.splice(taskIndex, 1);
              }
              break;
            default:
              if (this.currentTaskInterval !== formattedTask.interval) this.tasksByInterval.splice(taskIndex, 1);
          }
        }

        // applying task changes to the task in the array by interval if task was not removed
        taskIndex = this.tasksByInterval.findIndex(x => x.id === formattedTask.id);
        if (taskIndex >= 0) {
          let previousTask = this.taskHelper.map(this.tasksByInterval[taskIndex]);
          this.mapReceivedTaskToExistingTask(taskIndex, formattedTask);

          if (previousTask.priority !== formattedTask.priority)
            this.tasksByInterval = this.getSortedList(this.tasksByInterval);
        }
      }
    });
  }

  actviateCompleteTaskListener = () => {
    this.taskHub.hubConnection.on('receiveCompletionResult', (responseJson: string) => {
      let response = JSON.parse(responseJson) as CompleteTaskResponse;
      if (response.parentTask) {

        // removing completed subtask task from the main array
        let parentTaskIndex = this.tasks.findIndex(x => x.id === response.parentTask.id);
        if (parentTaskIndex >= 0) {
          let subtaskIndex = this.tasks[parentTaskIndex].subtasks
            .findIndex(x => x.id === response.completedTaskId);

          if (subtaskIndex) {
            let request = this.plantExperienceHelper
              .getChangePlantExperienceRequestByTask(this.tasks[parentTaskIndex].subtasks[subtaskIndex].id,
                ExperienceChangingType.Rise, ExperienceReasonType.Task_Completed);

            this.plantService.changeExperience(request).subscribe(() => {
              this.tasks[parentTaskIndex].subtasks.splice(subtaskIndex, 1);
            });
          }
        }

        // removing completed subtask from the array by timer
        parentTaskIndex = this.tasksByInterval.findIndex(x => x.id === response.parentTask.id);
        if (parentTaskIndex >= 0) {
          let subtaskIndex = this.tasksByInterval[parentTaskIndex].subtasks
            .findIndex(x => x.id === response.completedTaskId);

          if (subtaskIndex >= 0) this.tasksByInterval[parentTaskIndex].subtasks.splice(subtaskIndex, 1);
        }
      } else {

        // removing completed task from the main array
        let taskIndex = this.tasks.findIndex(x => x.id === response.completedTaskId);
        let completedTask = this.tasks[taskIndex];
        if (taskIndex >= 0) {
          let request = this.plantExperienceHelper.getChangePlantExperienceRequestByTask(response.completedTaskId,
            ExperienceChangingType.Rise, ExperienceReasonType.Task_Completed);

          this.plantService.changeExperience(request).subscribe(() => {
            this.tasks.splice(taskIndex, 1);
          });
        }

        // removing completed task from the array by interval
        taskIndex = this.tasksByInterval.findIndex(x => x.id === response.completedTaskId);
        if (taskIndex >= 0) this.tasksByInterval.splice(taskIndex, 1);

        // updating tasks number by interval
        this.reducetasksNumberByInterval(completedTask);
        this.tasksNumberByIntervalToEmit.emit(this.tasksNumberByInterval);
      }
    });
  }

  //#endregion

  //#region TasksNumberByInterval

  async changeTasksNumberByInterval(previousTask: Task, updatedTask: Task) {
    this.reducetasksNumberByInterval(previousTask);
    this.risetasksNumberByInterval(updatedTask);
  }

  risetasksNumberByInterval(task: Task) {
    switch (task.interval) {
      case TaskInterval.Inbox:
        this.tasksNumberByInterval.inbox++;
        break;

      case TaskInterval.Overdue:
        this.tasksNumberByInterval.overdue++;
        break;

      case TaskInterval.Today:
        this.tasksNumberByInterval.today++;
        this.tasksNumberByInterval.thisWeek++;
        break;

      case TaskInterval.Tomorrow:
        if (task.date) {
          let taskDate = new Date(task.date);
          taskDate.getTime() < this.nextMondayDate.getTime()
            ? this.tasksNumberByInterval.thisWeek++ : this.tasksNumberByInterval.upcoming++;

          this.tasksNumberByInterval.tomorrow++;
        }
        break;

      case TaskInterval.ThisWeek:
        this.tasksNumberByInterval.thisWeek++;
        break;

      case TaskInterval.Upcoming:
        this.tasksNumberByInterval.upcoming++;
        break;
    }
  }

  reducetasksNumberByInterval(task: Task) {
    switch (task.interval) {
      case TaskInterval.Inbox:
        if (this.tasksNumberByInterval.inbox > 0) this.tasksNumberByInterval.inbox--;
        break;

      case TaskInterval.Overdue:
        if (this.tasksNumberByInterval.overdue > 0) this.tasksNumberByInterval.overdue--;
        break;

      case TaskInterval.Today:
        if (this.tasksNumberByInterval.today > 0) this.tasksNumberByInterval.today--;
        this.tasksNumberByInterval.thisWeek--;
        break;

      case TaskInterval.Tomorrow:
        if (this.tasksNumberByInterval.tomorrow > 0 && task.date) {
          let taskDate = new Date(task.date);
          taskDate.getTime() < this.nextMondayDate.getTime()
            ? this.tasksNumberByInterval.thisWeek-- : this.tasksNumberByInterval.upcoming--;

          this.tasksNumberByInterval.tomorrow--;
        }
        break;

      case TaskInterval.ThisWeek:
        this.tasksNumberByInterval.thisWeek--;
        break;

      case TaskInterval.Upcoming:
        if (this.tasksNumberByInterval.upcoming > 0) this.tasksNumberByInterval.upcoming--;
        break;
    }
  }

  //#endregion

  //#region Displaying Tasks

  mapReceivedTaskToExistingTask(index: number, receivedTask: Task) {
    this.tasksByInterval[index].name = receivedTask.name;
    this.tasksByInterval[index].description = receivedTask.description;
    this.tasksByInterval[index].creationDate = receivedTask.creationDate;
    this.tasksByInterval[index].date = receivedTask.date;
    this.tasksByInterval[index].deadline = receivedTask.deadline;

    if (this.tasksByInterval[index].deadline)
      this.tasksByInterval[index].dynamicDeadline = this.taskHelper.getDynamicDate(receivedTask.deadline);

    this.tasksByInterval[index].priority = receivedTask.priority;
    this.tasksByInterval[index].trackedTime = receivedTask.trackedTime;
    this.tasksByInterval[index].isCompleted = receivedTask.isCompleted;
    this.tasksByInterval[index].parentTaskId = receivedTask.parentTaskId;
    this.tasksByInterval[index].userId = receivedTask.userId;
    this.tasksByInterval[index].files = receivedTask.files;
    this.tasksByInterval[index].subtasks = receivedTask.subtasks;
  }

  getSortedList(tasks: Task[]): Task[] {
    let priorityTasks = tasks.filter(x => x.priority === 1);
    let sortedTasks = tasks.filter(x => x.priority === 0);

    priorityTasks.sort((a, b) => (a.creationDate > b.creationDate ? 1 : -1)); //reversed for sort
    sortedTasks.sort((a, b) => (a.creationDate > b.creationDate ? -1 : 1));

    for (let priorityTask of priorityTasks) {
      sortedTasks.unshift(priorityTask);
    }

    return sortedTasks;
  }

  applyTaskInverval() {
    if (this.tasksByInterval?.length > 0) {
      for (let index = 0; index < this.tasksByInterval.length; index++) {
        let taskId = this.tasksByInterval[index].id;
        this.tasksByInterval[index].isDetailsVisible = false;

        // getting HTML elements related to task
        let taskPropertiesElement = this.taskPropertiesElements
          .find(x => x.nativeElement.id.indexOf(taskId) >= 0)?.nativeElement;
        let taskContentElement = this.taskContentElements
          .find(x => x.nativeElement.id.indexOf(taskId) >= 0)?.nativeElement;
        let taskDetailsElement = this.taskDetailsElements
          .find(x => x.nativeElement.id.indexOf(taskId) >= 0)?.nativeElement;

        // dragging task properties element to the base state
        if (taskPropertiesElement && taskContentElement && taskDetailsElement)
          this.dragTaskProperties(taskPropertiesElement, taskContentElement, taskDetailsElement, false);
      }
    }

    if (this.tasks?.length > 0) {
      if (this.currentTaskInterval === TaskInterval.ThisWeek) {
        let tasksWithoutState = this.tasks.filter(x => x.interval === TaskInterval.Today
          || x.interval === TaskInterval.ThisWeek || x.interval === TaskInterval.Tomorrow);

        if (tasksWithoutState.length > 0) for (let task of tasksWithoutState) task.state = 'show';

        let sorderedTasks = this.getSortedList(tasksWithoutState);
        this.tasksByInterval = sorderedTasks;
      } else {
        let tasksWithoutState = this.tasks.filter(x => x.interval === this.currentTaskInterval);
        if (tasksWithoutState.length > 0) for (let task of tasksWithoutState) task.state = 'show';

        let sorderedTasks = this.getSortedList(tasksWithoutState);
        this.tasksByInterval = sorderedTasks;
      }
    }
  }

  //#endregion

  //#region Task

  async getCurrentUserPlantId() {
    this.plantService.get().subscribe(x => {
      if (x) this.plantExperienceHelper.plantId = x.id;
    });
  }

  checkTasksOnExpiredDeadlines() {
    if (this.tasks.length > 0 && this.currentDate && this.plantExperienceHelper?.plantId) {
      let currentDateTime = this.currentDate.getTime();

      for (let index = 0; index < this.tasks.length; index++) {
        if (this.tasks[index].deadline) {
          let taskDeadlineTime = (new Date(this.tasks[index].deadline)).getTime();

          if (currentDateTime > taskDeadlineTime) {
            let request = this.plantExperienceHelper.getChangePlantExperienceRequestByTask(
              this.tasks[index].id, ExperienceChangingType.Reduce, ExperienceReasonType.Task_ExpiredDeadline);

            this.plantService.changeExperience(request).subscribe();
          }
        }
      }
    }
  }

  applyTaskToTimer(selectedTask: Task) {
    this.taskForTimerToEmit.emit(selectedTask);

    setTimeout(() => {
      this.taskForTimerToEmit.emit(undefined);
    }, 1000);
  }

  applyTaskDateAction(id: string, dxDatePicker: DxDateBoxComponent) {
    if (id.indexOf('taskDateAction') > -1) {
      let taskActionAndTaskId = id.substring(id.indexOf('_') + 1, id.length);
      let taskAction = taskActionAndTaskId.substring(0, taskActionAndTaskId.indexOf('_'));
      let taskId = +taskActionAndTaskId.substring(taskActionAndTaskId.indexOf('_') + 1, taskActionAndTaskId.length);

      if (taskAction && taskId) {
        let taskIndex = this.tasksByInterval.findIndex(x => x.id == taskId);
        switch (taskAction) {
          case 'today':
            this.applyTaskDateChanges(this.currentDate, taskIndex, dxDatePicker);
            break;
          case 'tomorrow':
            this.applyTaskDateChanges(this.tomorrowDate, taskIndex, dxDatePicker);
            break;
          case 'nextWeek':
            this.applyTaskDateChanges(this.nextMondayDate, taskIndex, dxDatePicker);
            break;
          case 'clear':
            this.applyTaskDateChanges(undefined, taskIndex, dxDatePicker);
            break;
        }
      }
    }
  }

  applyTaskDateChanges(selectedDate: any, taskIndex: number, datePicker: DxDateBoxComponent | null = null) {
    let taskToUpdate = this.taskHelper.map(this.tasksByInterval[taskIndex]);
    let newTaskDate = this.dateTimeHelper.convertDateToUserTimeZone(selectedDate, this.currentUserTimeZone);

    let newInterval = this.taskHelper.getDateIntervalByDate(newTaskDate, this.currentUserTimeZone);

    if (taskToUpdate.interval !== newInterval) {

      taskToUpdate.dateString = this.dateTimeHelper.convertDateToUtcString(newTaskDate);
      taskToUpdate.dynamicDate = taskToUpdate.date ? this.taskHelper.getDynamicDate(taskToUpdate.date) : 'Date';
      taskToUpdate.interval = this.taskHelper.getDateIntervalByDate(taskToUpdate.date, this.currentUserTimeZone);

      this.taskService.update(taskToUpdate).subscribe();
    } else datePicker?.instance.close();
  }

  changeAddTaskPanelState() {
    if (this.addTaskPanelState) {
      this.newTaskNameInput.nativeElement.value = '';
      this.addTaskPanelState = false;
      this.addTaskIcon = faPlus;

      setTimeout(() => {
        this.isNewTaskInputGroupVisible = false;
      }, 235);
    } else {
      this.addTaskIcon = faChevronUp;
      this.isNewTaskInputGroupVisible = true;
      this.addTaskPanelState = true;
    }
  }

  getDynamicDateFromHelper(newTaskDate: Date): string {
    return this.taskHelper.getDynamicDate(newTaskDate);
  }

  createTask(newTaskName: string, parentTaskId: number | null = null) {
    if (!newTaskName) return;

    let taskToCreate = new Task();
    if (newTaskName && !newTaskName.match(/^ *$/)) {
      taskToCreate.name = newTaskName;
      this.newTaskNameInput.nativeElement.value = null;
    }

    if (parentTaskId) taskToCreate.parentTaskId = parentTaskId;

    switch (this.currentTaskInterval) {
      case TaskInterval.Inbox:
        break;
      case TaskInterval.Today:
        taskToCreate.date = this.currentDate;
        break;
      case TaskInterval.Tomorrow:
        taskToCreate.date = this.tomorrowDate;
        break;
      case TaskInterval.ThisWeek:
        taskToCreate.date = this.currentDate;
        break;
      case TaskInterval.Upcoming:
        taskToCreate.date = this.nextMondayDate;
        break;
    }

    if (taskToCreate.date) {
      taskToCreate.dateString = this.dateTimeHelper.convertDateToUtcString(taskToCreate.date);
    }

    this.taskService.create(taskToCreate).subscribe();
  }

  changePriority(index: number) {
    let taskToUpdate = this.taskHelper.map(this.tasksByInterval[index]);
    taskToUpdate.priority = this.tasksByInterval[index].priority === 0 ? 1 : 0;
    this.updateTask(taskToUpdate);
  }

  updateTask(changedTask: Task) {
    changedTask.creationDateString = this.dateTimeHelper.convertDateToUtcString(changedTask.creationDate);
    if (changedTask.date) changedTask.dateString = this.dateTimeHelper.convertDateToUtcString(changedTask.date);
    if (changedTask.deadline) changedTask.deadlineString = this.dateTimeHelper.convertDateToUtcString(changedTask.deadline);

    this.taskService.update(changedTask).subscribe();
  }

  completeTask(index: number, subtaskIndex: number | null = null) {
    if (subtaskIndex !== null) {
      this.tasksByInterval[index].subtasks[subtaskIndex].taskIconState = faSeedling;
      this.tasksByInterval[index].subtasks[subtaskIndex].deleteAnimation = true;

      this.taskService.complete(this.tasksByInterval[index].subtasks[subtaskIndex].id).subscribe();
    } else {
      this.tasksByInterval[index].taskIconState = faSeedling;
      this.tasksByInterval[index].deleteAnimation = true;

      this.taskService.complete(this.tasksByInterval[index].id).subscribe();
    }
  }

  deleteTask(taskToDelete: Task) {
    taskToDelete.isCompleted = true;

    this.taskService.delete(taskToDelete.id).subscribe(parentTask => {
      if (parentTask) {
        let parentTaskIndex = this.tasks.findIndex(x => x.id === parentTask.id);

        if (parentTask.date) parentTask.interval = this.taskHelper
          .getDateIntervalByDate(parentTask.date, this.currentUserTimeZone);

        this.tasks[parentTaskIndex] = parentTask;

        let deletedSubtaskIndex = this.tasks[parentTaskIndex].subtasks.findIndex(x => x.id === taskToDelete.id);
        this.tasks[parentTaskIndex].subtasks.splice(deletedSubtaskIndex, 1);

        this.taskToEmit.emit(parentTask);
      } else {
        let deletedTaskIndex = this.tasks.findIndex(x => x.id === taskToDelete.id);
        this.tasks.splice(deletedTaskIndex, 1);

        this.taskToEmit.emit(taskToDelete);
      }
    });
  }

  //#endregion

  //#region HTMLElements

  applyTextareaStyling(element: any) {
    if (element && element.style) {
      element.style.height = 'auto';
      element.style.height = element.scrollHeight + 'px';
    }
  }

  dragTaskProperties(taskProperties: any, taskContent: any, taskDetails: any, isDetailsVisible: boolean) {
    let taskPropertiesBackup = taskProperties;
    taskProperties.remove();

    if (isDetailsVisible) {
      taskPropertiesBackup.style.margin = '10px';
      taskPropertiesBackup.style.textAlign = 'center';
      taskDetails.insertAdjacentElement('beforebegin', taskPropertiesBackup);
    } else {
      taskPropertiesBackup.style.margin = 0;
      taskPropertiesBackup.style.textAlign = 'left';
      taskContent.appendChild(taskPropertiesBackup);
    }
  }

  applyDatePickerCustomization(datePicker: DxDateBoxComponent, taskId: number) {
    var existingAdditionToElement = document.getElementById('taskDateActions_' + taskId);
    if (!existingAdditionToElement) {
      // @ts-ignore
      let customizedElementId = datePicker.element.nativeElement.getAttribute('aria-owns');
      let customizedElement = document.getElementById(customizedElementId);

      let taskActionTodayElementId = 'taskDateAction_today_' + taskId;
      let taskActionTomorrowElementId = 'taskDateAction_tomorrow_' + taskId;
      let taskActionNextWeekElementId = 'taskDateAction_nextWeek_' + taskId;
      let taskActionClearElementId = 'taskDateAction_clear_' + taskId;

      var taskDateActionsElement = document.createElement("div");
      taskDateActionsElement.id = 'taskDateActions_' + taskId;
      taskDateActionsElement.style.margin = '20px';
      taskDateActionsElement.style.textAlign = 'center';

      var taskDateActionsButtonsElement = document.createElement('div');
      taskDateActionsButtonsElement.innerHTML = '<button id="' + taskActionTodayElementId + '"class="btn button">Today</button>'
        + '<button id="' + taskActionTomorrowElementId + '" class="btn button" style="margin-left: 10px;">Tomorrow</button>'
        + '<button id="' + taskActionClearElementId + '" class="btn button" style="margin-left: 10px;">Clear</button>';

      taskDateActionsElement.appendChild(taskDateActionsButtonsElement);
      customizedElement?.appendChild(taskDateActionsElement);

      document.getElementById(taskActionTodayElementId)?.addEventListener("click", () => {
        this.applyTaskDateAction(taskActionTodayElementId, datePicker);
      });

      document.getElementById(taskActionTomorrowElementId)?.addEventListener("click", () => {
        this.applyTaskDateAction(taskActionTomorrowElementId, datePicker);
      });

      document.getElementById(taskActionNextWeekElementId)?.addEventListener("click", () => {
        this.applyTaskDateAction(taskActionNextWeekElementId, datePicker);
      });

      document.getElementById(taskActionClearElementId)?.addEventListener("click", () => {
        this.applyTaskDateAction(taskActionClearElementId, datePicker);
      });
    }
  }

  //#endregion

  //#region File

  uploadFile(event: any, task: Task, taskId: number, index: number) {
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      let file: File = fileList[0];
      let formData = new FormData();
      formData.append('fileData', file);
      formData.append('taskId', taskId.toString());

      this.fileService.uploadFile(formData).subscribe(uploadFileResponse => {
        if (uploadFileResponse) {
          this.tasks[index].files.unshift(uploadFileResponse.uploadedFile);
        } else {
          this.toastNotificationContent = 'Your storage limit is 10 MB. Remove files from existing tasks to get more free space';
          this.activateToastNotification();
        }
      }, () => {
        this.toastNotificationContent = 'File is too large to upload';
        this.activateToastNotification();
      });
    }
  }

  activateToastNotification() {
    this.isToastNotificationVisible = true;

    setTimeout(() => {
      this.isToastNotificationVisible = false;
    }, 3000);
  }

  downloadFile(fileId: number) {
    this.fileService.getFileLink(fileId).subscribe(fileLink => window.open(fileLink, '_blank'));
  }

  deleteFile(fileId: number, fileIndex: number, index: number) {
    this.fileService.deleteFile(fileId).subscribe(() => {
      this.tasks[index].files.splice(fileIndex, 1);
    });
  }

  getTaskFileIcon(taskExtension: string): IconDefinition {
    let taskFileIcon: IconDefinition;

    switch (taskExtension) {
      case '.jpg':
      case '.jpeg':
      case '.gif':
      case '.png':
        taskFileIcon = faFileImage;
        break;
      case '.pdf':
        taskFileIcon = faFilePdf;
        break;
      case '.docx':
      case '.doc':
        taskFileIcon = faFileWord;
        break;
      case '.xlsx':
        taskFileIcon = faFileExcel;
        break;
      case '.wav':
      case '.mp3':
      case '.flac':
        taskFileIcon = faFileAudio;
        break;
      case '.mp4':
      case '.avi':
      case '3gp':
        taskFileIcon = faFileVideo;
        break;
      case '.pptx':
        taskFileIcon = faFilePowerpoint;
        break;
      case '.html':
      case '.css':
      case '.cs':
      case '.js':
      case '.ts':
      case '.xml':
      case '.json':
        taskFileIcon = faFileCode;
        break;
      default:
        taskFileIcon = faFileAlt;
    }

    return taskFileIcon;
  }

  //#endregion
}
