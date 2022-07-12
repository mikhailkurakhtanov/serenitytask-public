import { Task } from "src/models/entities/task.model";

export class DeleteTaskResponse {
    deletedTaskId: number;
    parentTask: Task;
}