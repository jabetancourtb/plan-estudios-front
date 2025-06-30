import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { ResponseList } from '../dto/response-list.model';
import { Observable } from 'rxjs';
import { Carrera } from '../models/carrera.model';
import { Prerrequisito } from '../models/prerrequisito.model';

@Injectable({
  providedIn: 'root'
})
export class PrerrequisitoService extends BaseService<any> {

  protected apiPlanEstudiosUDistrital: string = environment.apiPlanEstudiosUDistrital.url;
  protected apiPlanEstudiosUDistritalApiKeyRequestHeader: string = environment.apiPlanEstudiosUDistrital.apiKey.requestHeader;
  protected apiPlanEstudiosUDistritalApiKeyRequestValue: string = environment.apiPlanEstudiosUDistrital.apiKey.requestValue;

  protected headers = new HttpHeaders({ [this.apiPlanEstudiosUDistritalApiKeyRequestHeader] : this.apiPlanEstudiosUDistritalApiKeyRequestValue });

  
  constructor() {
    super();
    this.apiUrl = this.apiPlanEstudiosUDistrital;
  }


  consultarPrerrequisitos(page: number, pageSize: number, field: string, asc: boolean) : Observable<ResponseList<Carrera>> {
    this.resource = "/prerrequisitos";

    const params = new HttpParams()
    .set('page', page)
    .set('pageSize', pageSize)
    .set('field', field)
    .set('asc', asc);

    return this.executeGet('', { params: params, headers: this.headers });
  }

  
  consultarPrerrequisitosPorCodigo(codigoPrerrequisito: number, page: number, pageSize: number, field: string, asc: boolean) : Observable<ResponseList<Carrera>> {
    this.resource = "/prerrequisitos/" + codigoPrerrequisito;

    const params = new HttpParams()
    .set('page', page)
    .set('pageSize', pageSize)
    .set('field', field)
    .set('asc', asc);

    return this.executeGet('', { params: params, headers: this.headers });
  }


  consultarPrerrequisitosDeAsignaturaPorCodigoAsignatura(codigoAsignatura: number, page: number, pageSize: number, field: string, asc: boolean) : Observable<ResponseList<Carrera>> {
    this.resource = "/asignaturas/" + codigoAsignatura + "/prerrequisitos";

    const params = new HttpParams()
    .set('page', page)
    .set('pageSize', pageSize)
    .set('field', field)
    .set('asc', asc);

    return this.executeGet('', { params: params, headers: this.headers });
  }


}
