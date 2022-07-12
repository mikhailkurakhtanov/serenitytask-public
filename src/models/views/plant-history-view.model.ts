import { ExperienceObjectType } from "../enums/experience-object-type.enum";
import { PlantHistoryNoteSessionDetails } from "./plant-history-note-session-details.model";
import { PlantHistoryNoteTaskDetails } from "./plant-history-note-task-details.model";

export class PlantHistoryView {
    id: number;
    actionDate: Date;
    actionDateString: string;
    formattedDate: string;

    receivedExperience: number;
    description: string;
    taskDetails: PlantHistoryNoteTaskDetails;
    sessionDetails: PlantHistoryNoteSessionDetails;
    plantId: number;
    experienceObjectType: ExperienceObjectType;
}