import { File } from "../entities/file.model";
import { TaskHistoryNote } from "../entities/task-history-note.model";

export class UploadFileResponse {
    uploadedFile: File;
    taskHistoryNote: TaskHistoryNote;
}