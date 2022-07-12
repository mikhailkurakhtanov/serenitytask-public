import { IconDefinition } from "@fortawesome/free-brands-svg-icons";
import { TaskInterval } from "../views/tasks-interval.model";
import { File } from "./file.model";

export class Task {
  id: number;
  name: string;
  priority: number;
  description: string;

  creationDateString: string;
  dateString: string;
  deadlineString: string;

  trackedTime: number;
  isCompleted: boolean;

  userId: number;
  parentTaskId: number;
  subtasks: Task[];
  files: File[];

  // not entity related properties

  creationDate: Date;
  date: Date | null;
  deadline: Date;

  dynamicDate: string;
  interval: TaskInterval;
  dynamicDeadline: string;

  taskIconState: IconDefinition;
  priorityIconState: IconDefinition;
  addSubtaskIconState: IconDefinition;
  subtasksIconState: IconDefinition;

  isDetailsVisible: boolean;
  isSubtasksVisible: boolean;
  isAddSubtaskInputVisible: boolean;

  descriptionScrollHeight: string;
  deleteAnimation = false;
  state: string;
}
