import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Constants } from "../../components/constants";
import { Task } from "../../models/entities/task.model";
import { TaskHistoryNote } from "src/models/entities/task-history-note.model";

@Injectable()
export class TaskService {
  private apiDeleteUrl = 'task/delete?taskId=';
  private apiCompleteUrl = 'task/complete?taskId=';
  private apiCreateUrl = 'task/create';
  private apiUpdateUrl = 'task/update';
  private apiGetUrl = 'task/get?taskId=';
  private apiGetAllUrl = 'task/get-all';
  private apiAddTaskHistoryNoteUrl = 'task/add-task-history-note';
  private apiFindByNameUrl = 'task/find-by-name?query=';

  constructor(private http: HttpClient) { }

  create(taskToCreate: Task): Observable<Task> {
    return this.http.post<Task>(Constants.apiUrl + this.apiCreateUrl, taskToCreate);
  }

  delete(taskId: number): Observable<Task> {
    return this.http.get<Task>(Constants.apiUrl + this.apiDeleteUrl + taskId);
  }

  complete(taskId: number): Observable<any> {
    return this.http.get<any>(Constants.apiUrl + this.apiCompleteUrl + taskId);
  }

  update(taskToUpdate: Task): Observable<Task> {
    return this.http.put<Task>(Constants.apiUrl + this.apiUpdateUrl, taskToUpdate);
  }

  get(taskId: number): Observable<Task> {
    return this.http.get<Task>(Constants.apiUrl + this.apiGetUrl + taskId);
  }

  getAll(): Observable<Task[]> {
    return this.http.get<Task[]>(Constants.apiUrl + this.apiGetAllUrl);
  }

  addTaskHistoryNote(newTaskHistoryNote: TaskHistoryNote) {
    return this.http.post<TaskHistoryNote>(Constants.apiUrl + this.apiAddTaskHistoryNoteUrl, newTaskHistoryNote);
  }

  findByName(query: string): Observable<Task[]> {
    return this.http.get<Task[]>(Constants.apiUrl + this.apiFindByNameUrl + query);
  }
}
