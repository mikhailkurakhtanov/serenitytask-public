import { Task } from "src/models/entities/task.model";

export class CompleteTaskResponse {
    completedTaskId: number;
    parentTask: Task;
}