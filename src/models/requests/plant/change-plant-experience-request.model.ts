import { ExperienceChangingType } from "src/models/enums/experience-changing-type.enum";
import { ExperienceObjectType } from "src/models/enums/experience-object-type.enum";
import { ExperienceReasonType } from "src/models/enums/experience-reason-type.enum";

export class ChangePlantExperienceRequest {
    changingType: ExperienceChangingType;
    objectName: ExperienceObjectType;
    reasonType: ExperienceReasonType;
    plantId: number;
    taskId: number | null = null;
    trackedTimeInMinutes: number | null = null;
    sessionId: number | null = null;
    guiltyMemberId: string | null = null;
}