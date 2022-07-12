import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Constants } from "src/components/constants";
import { TaskHistoryNote } from "src/models/entities/task-history-note.model";
import { UploadFileResponse } from "src/models/responses/upload-file-reponse.model";

@Injectable()
export class FileService {
    private readonly apiUploadFileUrl = 'file/upload';
    private readonly apiDeleteFileUrl = 'file/delete?fileId=';
    private readonly apiGetFileLinkUrl = 'file/get-link?fileId=';

    constructor(private http: HttpClient) { }

    getFileLink(fileId: number): Observable<string> {
        return this.http.get<string>(Constants.apiUrl + this.apiGetFileLinkUrl + fileId);
    }

    uploadFile(formData: FormData): Observable<UploadFileResponse> {
        return this.http.post<UploadFileResponse>(Constants.apiUrl + this.apiUploadFileUrl, formData);
    }

    deleteFile(fileId: number): Observable<TaskHistoryNote> {
        return this.http.delete<TaskHistoryNote>(Constants.apiUrl + this.apiDeleteFileUrl + fileId);
    }
}