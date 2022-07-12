import { PlantHistoryView } from "src/models/views/plant-history-view.model";

export class ChangePlantExperienceResponse {
    experience: number;
    maxExperience: number;
    level: number;
    plantHistoryView: PlantHistoryView;
}