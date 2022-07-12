import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Constants } from "../../components/constants";
import { Plant } from "../../models/entities/plant.model";
import { PlantType } from "../../models/entities/plant-type.model";
import { ChangePlantExperienceRequest } from "src/models/requests/plant/change-plant-experience-request.model";
import { PlantHistoryView } from "src/models/views/plant-history-view.model";

@Injectable()
export class PlantService {

  private readonly apiGetPlantTypesUrl = 'plant/get-plant-types';
  private readonly apiCreateUrl = 'plant/create?plantName=';
  private readonly apiUpdateUrl = 'plant/update';
  private readonly apiDeleteUrl = 'plant/delete?plantId=';
  private readonly apiGetUrl = 'plant/get';
  private readonly apiGetPlantHistoryUrl = 'plant/get-plant-history?plantId=';
  private readonly apiArchive = 'plant/archive';
  private readonly apiChangeExperienceUrl = 'plant/change-experience';

  constructor(private http: HttpClient) { }

  getPlantTypes(): Observable<PlantType[]> {
    return this.http.get<PlantType[]>(Constants.apiUrl + this.apiGetPlantTypesUrl);
  }

  get(): Observable<Plant> {
    return this.http.get<Plant>(Constants.apiUrl + this.apiGetUrl);
  }

  getPlantHistory(plantId: number): Observable<PlantHistoryView[]> {
    return this.http.get<PlantHistoryView[]>(Constants.apiUrl + this.apiGetPlantHistoryUrl + plantId);
  }

  create(plantName: string, plantTypeId: number): Observable<Plant> {
    return this.http.get<Plant>(Constants.apiUrl + this.apiCreateUrl + plantName + '&plantTypeId=' + plantTypeId);
  }

  update(plantToUpdate: Plant): Observable<any> {
    return this.http.put<any>(Constants.apiUrl + this.apiUpdateUrl, plantToUpdate);
  }

  delete(plantId: number): Observable<any> {
    return this.http.get<any>(Constants.apiUrl + this.apiDeleteUrl + plantId);
  }

  changeExperience(request: ChangePlantExperienceRequest): Observable<any> {
    return this.http.post<any>(Constants.apiUrl + this.apiChangeExperienceUrl, request);
  }

  archive(plantId: number): Observable<any> {
    return this.http.put<any>(Constants.apiUrl + this.apiArchive, plantId);
  }
}
