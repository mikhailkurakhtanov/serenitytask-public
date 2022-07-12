import { Component, ViewChild, OnInit, Input, HostListener } from '@angular/core';
import { trigger, transition, sequence, animate, style, state } from '@angular/animations';

import { DxProgressBarComponent } from "devextreme-angular";

import { PlantService } from 'src/services/api/plant.service';
import { PlantHub } from 'src/services/hubs/plant.hub';

import { Plant } from 'src/models/entities/plant.model';
import { ChangePlantExperienceResponse } from 'src/models/responses/plant/change-plant-experience-response';
import { PlantHistoryView } from 'src/models/views/plant-history-view.model';
import { Constants } from 'src/components/constants';

@Component({
  selector: 'plant',
  templateUrl: 'plant.component.html',
  styleUrls: ['plant.component.css'],
  animations: [
    trigger('changeButtonState', [
      transition('* => true', [
        sequence([
          animate('0.25s ease',
            style({ transform: 'scale(1.075)' }))
        ])
      ]),
      state('true', style({ transform: 'scale(1.075)' })),
      transition('true => false', [
        sequence([
          animate('0.25s ease',
            style({ transform: 'scale(1)' }))
        ]),
        state('false', style({ transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class PlantComponent implements OnInit {

  @Input() currentUserTimeZone: string;
  @ViewChild(DxProgressBarComponent) progressBarExperienceDiv: DxProgressBarComponent;

  currentUserPlant: Plant;

  isCreatePlantPopupVisible: boolean;
  isPlantHistoryPopupVisible: boolean;
  isPopupQuoteVisible: boolean;
  isComponentLoaded: boolean;
  isExperienceChangingNotificationVisible: boolean;
  experienceChangingNotificationContent: string;

  playPlantTheFirstSeedButtonAnimation: boolean;
  playStartPlantingAgainButtonAnimation: boolean;

  receivedPlantHistoryView: PlantHistoryView;

  windowWidth: number;

  constructor(private plantService: PlantService, private plantHub: PlantHub) {
    this.isComponentLoaded = true;
    this.isExperienceChangingNotificationVisible = false;

    this.experienceChangingNotificationContent = '';
  }

  ngOnInit(): void {
    this.getWindowSize();
    this.isComponentLoaded = false;

    this.plantService.get().subscribe(x => {
      this.currentUserPlant = x;
      if (this.currentUserPlant?.isDead) {
        this.isPopupQuoteVisible = true;
      }

      this.isComponentLoaded = true;
    });

    this.plantHub.startConnection();
    this.activatePlantChangesListener();
  }

  @HostListener('window:resize', ['$event'])
  getWindowSize() {
    this.windowWidth = window.innerWidth;
  }

  getCurrentPlantLevelImgPath(): string {
    if (!this.currentUserPlant) return '';

    var levelImgPath = Constants.plantsUrl + this.currentUserPlant.plantType.name.toLowerCase()
      + '/level_' + this.currentUserPlant.level;
    levelImgPath += this.currentUserPlant.plantType.name.toLowerCase() === 'sorana' ? '.png' : '/anim.gif'

    return levelImgPath;
  }

  activatePlantChangesListener = () => {
    this.plantHub.hubConnection.on('receivePlantChanges',
      (responseJson: string) => {
        let response = JSON.parse(responseJson) as ChangePlantExperienceResponse;
        this.applyPlantExperienceChanges(response);

        if (response.experience < 0 && response.level === 0) {
          this.currentUserPlant.isDead = true;
          this.currentUserPlant.isGrowthFinished = true;

          this.isPopupQuoteVisible = true;
        } else {
          this.experienceChangingNotificationContent = (response.plantHistoryView.receivedExperience > 0
            ? 'Earned ' : 'Reduced ') + response.plantHistoryView.receivedExperience + ' exp.';
          this.isExperienceChangingNotificationVisible = true;

          setTimeout(() => {
            this.isExperienceChangingNotificationVisible = false;
          }, 2000);
        }
      });
  }

  progressBarFormat(value: number) {
    return `${value * 100}%`;
  }

  savePlant(plantToCreate: Plant) {
    this.isCreatePlantPopupVisible = false;

    this.plantService.create(plantToCreate.name, plantToCreate.plantType.id).subscribe(x => {
      this.currentUserPlant = x;
    });
  }

  applyPlantExperienceChanges(response: ChangePlantExperienceResponse) {
    this.currentUserPlant.level = response.level;
    this.currentUserPlant.currentExperience = response.experience;
    this.currentUserPlant.maxExperience = response.maxExperience;

    this.receivedPlantHistoryView = response.plantHistoryView;
  }
}
