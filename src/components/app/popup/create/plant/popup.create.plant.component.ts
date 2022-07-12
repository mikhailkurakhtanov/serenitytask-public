import {Component, Input, Output, EventEmitter} from "@angular/core"
import {PlantService} from "../../../../../services/api/plant.service";
import {Plant} from "../../../../../models/entities/plant.model";
import {PlantType} from "../../../../../models/entities/plant-type.model";
import { trigger, transition, sequence, animate, style, state } from "@angular/animations";

@Component({
  selector: 'popup-create-plant',
  templateUrl: 'popup.create.plant.component.html',
  styleUrls: ['popup.create.plant.component.css'],
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
export class PopupCreatePlantComponent {
  @Input() isCreatePlantPopupVisible: boolean;
  @Output() createdPlant: EventEmitter<Plant> = new EventEmitter<Plant>();
  @Output() isPopupCreatePlantShouldBeHidden: EventEmitter<boolean> = new EventEmitter<boolean>();

  isSetNameSectionVisible: boolean;

  initialPlant: Plant;
  plantTypes: PlantType[];

  playNextButtonAnimation: boolean;
  playBackButtonAnimation: boolean;
  playPlantASeedButtonAnimation: boolean;

  constructor(private plantService: PlantService) {
    this.initialPlant = new Plant();
    this.isSetNameSectionVisible = false;

    this.plantService.getPlantTypes().subscribe(x => {
      this.plantTypes = x;
    });
  }

  choosePlantType(plantType: PlantType) {
    this.initialPlant.plantType = plantType;
    this.initialPlant.name = plantType.name;
  }

  savePlant() {
    this.isSetNameSectionVisible = false;
    this.createdPlant.emit(this.initialPlant);
  }
}
