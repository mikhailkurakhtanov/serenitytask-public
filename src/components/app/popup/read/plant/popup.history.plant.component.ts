import { Component, Input, Output, EventEmitter, OnInit, HostListener } from "@angular/core";
import { faWindowClose } from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from "@fortawesome/free-brands-svg-icons";
import { faArrowRight, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import * as moment from "moment";
import { PlantHistoryView } from "src/models/views/plant-history-view.model";
import { PlantService } from "src/services/api/plant.service";
import { DateTimeHelper } from "src/services/helpers/date-time.helper";

@Component({
  selector: 'popup-plant-history',
  templateUrl: 'popup.history.plant.component.html',
  styleUrls: ['popup.history.plant.component.css']
})
export class PopupHistoryPlantComponent implements OnInit {
  @Input() set receivedPlantId(value: number | undefined) {
    if (value) {
      this.getPlantHistory(value);
    }
  }

  @Input() set receivedPlantHistoryView(value: PlantHistoryView) {
    if (value) {
      this.activateReceiveCurrentUserTimeZoneListener();

      value.actionDate = this.dateTimeHelper
        .convertDateToUserTimeZone(new Date(value.actionDateString), this.currentUserTimeZone);

      let formattedDate = moment(value.actionDate).format('MMM Do, ddd');

      let index = this.plantHistoryByDays.findIndex(x => x.formattedDate === formattedDate);
      if (index >= 0) this.updatePlantHistoryForTheDay(index, value);
      else this.createAndSavePlantHistoryForTheDay(value);

      if (this.plantHistoryByDays.length > 0)
        this.plantHistoryByDaysFiltered = this.plantHistoryByDays
          .filter(x => new Date(x.date).getDate() >= this.currentDate.getDate()
            && new Date(x.date).getTime() <= this.next7daysDate.getTime());
    }
  }

  @Input() currentUserTimeZone: string;
  @Input() isPlantHistoryPopupVisible: boolean;

  @Output() isPlantHistoryPopupShouldBeHidden: EventEmitter<boolean> = new EventEmitter<boolean>();

  plantHistory: PlantHistoryView[];
  plantHistoryByDays: PlantHistoryForTheDay[];
  plantHistoryByDaysFiltered: PlantHistoryForTheDay[];


  currentDate: Date;
  next7daysDate: Date;

  isPlantHistoryLoaded: boolean;

  next7daysIcon = faArrowRight;
  previous7daysIcon = faArrowLeft;

  closeTaskInfoForm: IconDefinition;

  selectedDayTitle: string;
  selectedDayData: PlantHistoryView[];
  isSelectedDayLogVisible: boolean;
  isChartTooltipEnabled: boolean;

  windowWidth: number;

  constructor(private dateTimeHelper: DateTimeHelper, private plantService: PlantService) {
    this.selectedDayTitle = '';
    this.selectedDayData = [];
    this.isSelectedDayLogVisible = false;
    this.isChartTooltipEnabled = true;

    this.closeTaskInfoForm = faWindowClose;

    this.plantHistory = [];
    this.plantHistoryByDays = [];
    this.plantHistoryByDaysFiltered = [];
  }

  ngOnInit(): void {
    this.getWindowSize();
  }

  @HostListener('window:resize', ['$event'])
  getWindowSize() {
    this.windowWidth = window.innerWidth;
  }

  customizeTooltip = (info: any) => ({
    html:
      `<div>
        <div class='tooltip-header text-center'>
          <h5>${info.argumentText}</h5>
        </div>
        <div class=\'tooltip-body\'>
          <div class=\'series-name\'>
            <span class='top-series-name'>Earned Experience:</span>
          </div>
          <div class=\'value-text\'>
            <span class='top-series-value'>${this.getItemByFormattedDate(info.argumentText)?.earnedExperience}</span>
          </div>
          <div class=\'series-name\'>
            <span class='bottom-series-name'>Lost Experience:</span>
          </div>
          <div class=\'value-text\'>
            <span class='bottom-series-value'>${this.getItemByFormattedDate(info.argumentText)?.lostExperience}</span>
          </div>
          <div class=\'series-name\'>
            <span class='bottom-series-name'>Completed non priority tasks:</span>
          </div>
          <div class=\'value-text\'>
            <span class='bottom-series-value'>${this.getItemByFormattedDate(info.argumentText)?.completedNonPriorityTasks}</span>
          </div>
          <div class=\'series-name\'>
            <span class='bottom-series-name'>Completed priority tasks:</span>
          </div>
          <div class=\'value-text\'>
            <span class='bottom-series-value'>${this.getItemByFormattedDate(info.argumentText)?.completedPriorityTasks}</span>
          </div>
        </div>
      </div>`,
  });

  async activateReceiveCurrentUserTimeZoneListener() {
    let listener = setInterval(() => {
      if (this.currentUserTimeZone) clearInterval(listener);
    }, 250);
  }

  customizeLabelText = (info: any) => `${info.valueText}`;

  getItemByFormattedDate(formattedDate: string): any {
    return this.plantHistoryByDays.find(x => x.formattedDate == formattedDate);
  }

  getPlantHistory(currentPlantId: number) {
    if (this.plantHistory.length == 0) {
      this.isPlantHistoryLoaded = true;

      this.plantService.getPlantHistory(currentPlantId).subscribe(async x => {
        if (x?.length > 0) {
          for (let historyViewIndex = 0; historyViewIndex < x.length; historyViewIndex++) {
            await this.activateReceiveCurrentUserTimeZoneListener();

            this.currentDate = this.dateTimeHelper.getCurrentDate(this.currentUserTimeZone);
            this.next7daysDate = new Date();
            this.next7daysDate.setDate(this.currentDate.getDate() + 6);

            x[historyViewIndex].actionDate = this.dateTimeHelper
              .convertDateToUserTimeZone(new Date(x[historyViewIndex].actionDateString), this.currentUserTimeZone);

            x[historyViewIndex].formattedDate = moment(x[historyViewIndex].actionDate).format('MMM Do, ddd');
            let index = this.plantHistoryByDays.findIndex(y => y.formattedDate == x[historyViewIndex].formattedDate);

            if (index >= 0) {
              this.updatePlantHistoryForTheDay(index, x[historyViewIndex]);
            } else await this.createAndSavePlantHistoryForTheDay(x[historyViewIndex]);
          }

          if (this.plantHistoryByDays.length > 0)
            // this.plantHistoryByDaysFiltered = this.plantHistoryByDays
            //   .filter(x => new Date(x.date).getDate() >= this.currentDate.getDate()
            //     && new Date(x.date).getTime() <= this.next7daysDate.getTime());
            this.plantHistoryByDaysFiltered = this.plantHistoryByDays;
        }

        this.isPlantHistoryLoaded = false;
      });
    }
  }

  async createAndSavePlantHistoryForTheDay(plantHistoryView: PlantHistoryView) {
    if (!plantHistoryView.formattedDate) {
      plantHistoryView.formattedDate = moment(plantHistoryView.actionDate).format('MMM Do, ddd');
    }

    let plantHistoryForTheDay = new PlantHistoryForTheDay;
    plantHistoryForTheDay.date = plantHistoryView.actionDate;
    plantHistoryForTheDay.formattedDate = plantHistoryView.formattedDate;

    plantHistoryView.receivedExperience > 0
      ? plantHistoryForTheDay.earnedExperience = plantHistoryView.receivedExperience
      : plantHistoryForTheDay.lostExperience = plantHistoryView.receivedExperience;

    if (plantHistoryView.taskDetails) {
      let taskDetails = plantHistoryView.taskDetails;

      if (taskDetails.isCompleted) {
        taskDetails.priority === 0
          ? plantHistoryForTheDay.completedNonPriorityTasks += 1
          : plantHistoryForTheDay.completedPriorityTasks += 1;
      }
    }

    if (this.plantHistoryByDays.length > 0) {
      let indexOfLast = this.plantHistoryByDays.length - 1;
      plantHistoryForTheDay.totalExperience = this.plantHistoryByDays[indexOfLast].totalExperience + plantHistoryView.receivedExperience;
    } else plantHistoryForTheDay.totalExperience = plantHistoryView.receivedExperience;

    this.plantHistoryByDays.push(plantHistoryForTheDay);
    this.plantHistory.push(plantHistoryView);
  }

  updatePlantHistoryForTheDay(index: number, plantHistoryView: PlantHistoryView) {
    if (!plantHistoryView.formattedDate) {
      plantHistoryView.formattedDate = moment(new Date(plantHistoryView.actionDate)).format('MMM Do, ddd');
    }

    plantHistoryView.receivedExperience > 0
      ? this.plantHistoryByDays[index].earnedExperience += plantHistoryView.receivedExperience
      : this.plantHistoryByDays[index].lostExperience += plantHistoryView.receivedExperience;

    this.plantHistoryByDays[index].totalExperience += plantHistoryView.receivedExperience;

    if (plantHistoryView.taskDetails) {
      let taskDetails = plantHistoryView.taskDetails;

      if (taskDetails.isCompleted) {
        taskDetails.priority === 0
          ? this.plantHistoryByDays[index].completedNonPriorityTasks += 1
          : this.plantHistoryByDays[index].completedPriorityTasks += 1;
      }
    }

    this.plantHistory.push(plantHistoryView);
  }

  showDailyLog(event: any) {
    this.selectedDayTitle = event.argument.substring(event.argument[0], event.argument.indexOf(',')) + ' Details';
    this.selectedDayData = this.plantHistory.filter(x => x.formattedDate === event.argument);
    this.isSelectedDayLogVisible = true;
    this.isChartTooltipEnabled = false;
  }

  rollbackDailyLog() {
    this.isSelectedDayLogVisible = false;
    this.isChartTooltipEnabled = true;
    this.selectedDayTitle = '';
    this.selectedDayData = [];
  }
}

export class PlantHistoryForTheDay {
  date: Date;
  formattedDate: string;
  earnedExperience: number;
  lostExperience: number;
  totalExperience: number;

  completedNonPriorityTasks: number;
  completedPriorityTasks: number;

  constructor() {
    this.date = new Date;
    this.earnedExperience = 0;
    this.lostExperience = 0;
    this.completedNonPriorityTasks = 0;
    this.completedPriorityTasks = 0;
  }
}
