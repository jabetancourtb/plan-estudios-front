import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { ResponseList } from '../dto/response-list.model';
import { Observable } from 'rxjs';
import { AreaFormacion } from '../models/area-formacion.model';


@Injectable({
  providedIn: 'root'
})
export class AreaFormacionService extends BaseService<any> {

  protected apiPlanEstudiosUDistrital: string = environment.apiPlanEstudiosUDistrital.url;
  protected apiPlanEstudiosUDistritalApiKeyRequestHeader: string = environment.apiPlanEstudiosUDistrital.apiKey.requestHeader;
  protected apiPlanEstudiosUDistritalApiKeyRequestValue: string = environment.apiPlanEstudiosUDistrital.apiKey.requestValue;

  protected headers = new HttpHeaders({ [this.apiPlanEstudiosUDistritalApiKeyRequestHeader] : this.apiPlanEstudiosUDistritalApiKeyRequestValue });

  
  constructor() {
    super();
    this.apiUrl = this.apiPlanEstudiosUDistrital;
  }


  consultarAreasFormacion(page?: number, pageSize?: number, field?: string, asc?: boolean) : Observable<ResponseList<AreaFormacion>> {
    this.resource = "/areas-formacion";

    const params = new HttpParams()
    .set('page', page || 0)
    .set('pageSize', pageSize || 100)
    .set('field', field || 'id')
    .set('asc', asc || true);

    return this.executeGet('', { params: params, headers: this.headers });
  }

  
  consultarAreasFormacionPorNombre(name: string, page?: number, pageSize?: number, field?: string, asc?: boolean) : Observable<ResponseList<AreaFormacion>> {
    this.resource = "/areas-formacion/" + name;

    const params = new HttpParams()
    .set('page', page || 0)
    .set('pageSize', pageSize || 100)
    .set('field', field || 'id')
    .set('asc', asc || true);

    return this.executeGet('', { params: params, headers: this.headers });
  }

}