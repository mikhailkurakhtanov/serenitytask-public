import { Injectable } from "@angular/core";
import { ExperienceChangingType } from "src/models/enums/experience-changing-type.enum";
import { ExperienceObjectType } from "src/models/enums/experience-object-type.enum";
import { ExperienceReasonType } from "src/models/enums/experience-reason-type.enum";
import { ChangePlantExperienceRequest } from "src/models/requests/plant/change-plant-experience-request.model";

@Injectable()
export class PlantExperienceHelper {
    plantId: number;

    getChangePlantExperienceRequestByTask(taskId: number, changingType: ExperienceChangingType,
        reasonType: ExperienceReasonType, trackedTime: number | null = null): ChangePlantExperienceRequest {
        let request = new ChangePlantExperienceRequest();
        request.taskId = taskId;
        request.plantId = this.plantId;
        request.objectName = ExperienceObjectType.Task;
        request.changingType = changingType;
        request.reasonType = reasonType;
        request.trackedTimeInMinutes = trackedTime ? trackedTime : null;

        return request;
    }

    getChangePlantExperienceRequestBySession(changingType: ExperienceChangingType, reasonType: ExperienceReasonType,
        sessionId: number, plantId: number): ChangePlantExperienceRequest {
        let request = new ChangePlantExperienceRequest();
        request.sessionId = sessionId;
        request.plantId = plantId;
        request.objectName = ExperienceObjectType.Session;
        request.changingType = changingType;
        request.reasonType = reasonType;

        return request;
    }
}