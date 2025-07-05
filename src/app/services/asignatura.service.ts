import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { environment } from '../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Asignatura } from '../models/asignatura.model';
import { ResponseListDTO } from '../dto/response-list.model';

@Injectable({
  providedIn: 'root'
})
export class AsignaturaService extends BaseService<any> {

  protected apiPlanEstudiosUDistrital: string = environment.apiPlanEstudiosUDistrital.url;
  protected apiPlanEstudiosUDistritalApiKeyRequestHeader: string = environment.apiPlanEstudiosUDistrital.apiKey.requestHeader;
  protected apiPlanEstudiosUDistritalApiKeyRequestValue: string = environment.apiPlanEstudiosUDistrital.apiKey.requestValue;

  protected headers = new HttpHeaders({ [this.apiPlanEstudiosUDistritalApiKeyRequestHeader] : this.apiPlanEstudiosUDistritalApiKeyRequestValue });

  
  constructor() {
    super();
    this.apiUrl = this.apiPlanEstudiosUDistrital;
  }


  consultarAsignaturasPorCarrera(carrera: string, page: number, pageSize: number, field: string, asc: boolean) : Observable<ResponseListDTO<Asignatura>> {
    this.resource = "/carreras/" + carrera + "/asignaturas";

    const params = new HttpParams()
    .set('page', page)
    .set('pageSize', pageSize)
    .set('field', field)
    .set('asc', asc);

    return this.executeGet('', { params: params, headers: this.headers });
  }


  consultarAsignaturasPorCampoFormacion(campoFormacion: string, page: number, pageSize: number, field: string, asc: boolean) : Observable<ResponseListDTO<Asignatura>> {
    this.resource = "/campos-formacion/" + campoFormacion + "/asignaturas";

    const params = new HttpParams()
    .set('page', page)
    .set('pageSize', pageSize)
    .set('field', field)
    .set('asc', asc);

    return this.executeGet('', { params: params, headers: this.headers });
  }


  consultarAsignaturasPorAreaFormacion(areaFormacion: string, page: number, pageSize: number, field: string, asc: boolean) : Observable<ResponseListDTO<Asignatura>> {
    this.resource = "/areas-formacion/" + areaFormacion + "/asignaturas";

    const params = new HttpParams()
    .set('page', page)
    .set('pageSize', pageSize)
    .set('field', field)
    .set('asc', asc);

    return this.executeGet('', { params: params, headers: this.headers });
  }


  consultarAsignaturasPorCampoFormacionYAreaFormacion(campoFormacion: string, areaFormacion: string, page: number, pageSize: number, field: string, asc: boolean) : Observable<ResponseListDTO<Asignatura>> {
    this.resource = "/campos-formacion/" + campoFormacion + "/areas-formacion/" + areaFormacion + "/asignaturas";

    const params = new HttpParams()
    .set('page', page)
    .set('pageSize', pageSize)
    .set('field', field)
    .set('asc', asc);

    return this.executeGet('', { params: params, headers: this.headers });
  }


  consultarAsignaturasPorSemestre(semestre: number, page: number, pageSize: number, field: string, asc: boolean) : Observable<ResponseListDTO<Asignatura>> {
    this.resource = "/semestre/" + semestre + "/asignaturas";

    const params = new HttpParams()
    .set('page', page)
    .set('pageSize', pageSize)
    .set('field', field)
    .set('asc', asc);

    return this.executeGet('', { params: params, headers: this.headers });
  }


  consultarAsignaturas(page: number, pageSize: number, field: string, asc: boolean) : Observable<ResponseListDTO<Asignatura>> {
    this.resource = "/asignaturas";

    const params = new HttpParams()
    .set('page', page)
    .set('pageSize', pageSize)
    .set('field', field)
    .set('asc', asc);

    return this.executeGet('', { params: params, headers: this.headers });
  }


  consultarAsignaturaPorId(idAsignatura: number) : Observable<Asignatura> {
    this.resource = "/asignaturas";
    return this.executeGet(`/${idAsignatura}`, { headers: this.headers });
  }


  consultarSemestres(asc: boolean) : Observable<ResponseListDTO<number>> {
    this.resource = "/semestres";

    const params = new HttpParams()
    .set('asc', asc);

    return this.executeGet('', { params: params, headers: this.headers });
  }

}
