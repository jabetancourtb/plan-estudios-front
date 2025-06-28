import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { ResponseList } from '../dto/response-list.model';
import { Observable } from 'rxjs';
import { CampoFormacion } from '../models/campo-formacion.model';


@Injectable({
  providedIn: 'root'
})
export class CampoFormacionService extends BaseService<any> {

  protected apiPlanEstudiosUDistrital: string = environment.apiPlanEstudiosUDistrital.url;
  protected apiPlanEstudiosUDistritalApiKeyRequestHeader: string = environment.apiPlanEstudiosUDistrital.apiKey.requestHeader;
  protected apiPlanEstudiosUDistritalApiKeyRequestValue: string = environment.apiPlanEstudiosUDistrital.apiKey.requestValue;

  protected headers = new HttpHeaders({ [this.apiPlanEstudiosUDistritalApiKeyRequestHeader] : this.apiPlanEstudiosUDistritalApiKeyRequestValue });

  
  constructor() {
    super();
    this.apiUrl = this.apiPlanEstudiosUDistrital;
  }


  consultarCamposFormacion(page: number, pageSize: number, field: string, asc: boolean) : Observable<ResponseList<CampoFormacion>> {
    this.resource = "/campos-formacion";

    const params = new HttpParams()
    .set('page', page)
    .set('pageSize', pageSize)
    .set('field', field)
    .set('asc', asc);

    return this.executeGet('', { params: params, headers: this.headers });
  }

  
  consultarCamposFormacionPorNombre(name: string, page: number, pageSize: number, field: string, asc: boolean) : Observable<ResponseList<CampoFormacion>> {
    this.resource = "/campos-formacion/" + name;

    const params = new HttpParams()
    .set('page', page)
    .set('pageSize', pageSize)
    .set('field', field)
    .set('asc', asc);

    return this.executeGet('', { params: params, headers: this.headers });
  }

}
