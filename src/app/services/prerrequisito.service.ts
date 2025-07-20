import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { ResponseListDTO } from '../dto/response-list.model';
import { Observable } from 'rxjs';
import { Prerrequisito } from '../models/prerrequisito.model';

@Injectable({
  providedIn: 'root'
})
export class PrerrequisitoService extends BaseService<any> {

  protected apiPlanEstudiosUDistrital: string = environment.apiPlanEstudiosUDistrital.url;

  protected headers = new HttpHeaders({});


  constructor() {
    super();
    this.apiUrl = this.apiPlanEstudiosUDistrital;
  }


  consultarPrerrequisitos(page: number, pageSize: number, field: string, asc: boolean) : Observable<ResponseListDTO<Prerrequisito>> {
    this.resource = "/prerrequisitos";

    const params = new HttpParams()
    .set('page', page)
    .set('pageSize', pageSize)
    .set('field', field)
    .set('asc', asc);

    return this.executeGet('', { params: params, headers: this.headers });
  }


  consultarAsignaturasPosterioresPorCodigoPrerrequisito(codigoPrerrequisito: number, page: number, pageSize: number, field: string, asc: boolean) : Observable<ResponseListDTO<Prerrequisito>> {
    this.resource = "/prerrequisitos/" + codigoPrerrequisito;

    const params = new HttpParams()
    .set('page', page)
    .set('pageSize', pageSize)
    .set('field', field)
    .set('asc', asc);

    return this.executeGet('', { params: params, headers: this.headers });
  }


  consultarAsignaturaPrerrequisitosPorCodigoAsignatura(codigoAsignatura: number, page: number, pageSize: number, field: string, asc: boolean) : Observable<ResponseListDTO<Prerrequisito>> {
    this.resource = "/asignaturas/" + codigoAsignatura + "/prerrequisitos";

    const params = new HttpParams()
    .set('page', page)
    .set('pageSize', pageSize)
    .set('field', field)
    .set('asc', asc);

    return this.executeGet('', { params: params, headers: this.headers });
  }


}
