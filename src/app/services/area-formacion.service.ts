import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { ResponseListDTO } from '../dto/response-list.model';
import { Observable } from 'rxjs';
import { AreaFormacion } from '../models/area-formacion.model';


@Injectable({
  providedIn: 'root'
})
export class AreaFormacionService extends BaseService<any> {

  protected apiPlanEstudiosUDistrital: string = environment.apiPlanEstudiosUDistrital.url;

  protected headers = new HttpHeaders({});


  constructor() {
    super();
    this.apiUrl = this.apiPlanEstudiosUDistrital;
  }


  consultarAreasFormacion(page?: number, pageSize?: number, field?: string, asc?: boolean) : Observable<ResponseListDTO<AreaFormacion>> {
    this.resource = "/areas-formacion";

    const params = new HttpParams()
    .set('page', page || 0)
    .set('pageSize', pageSize || 100)
    .set('field', field || 'id')
    .set('asc', asc || true);

    return this.executeGet('', { params: params, headers: this.headers });
  }


  consultarAreaFormacionPorId(id: number, page?: number, pageSize?: number, field?: string, asc?: boolean) : Observable<AreaFormacion> {
    this.resource = "/areas-formacion/" + id;
    return this.executeGet('', { headers: this.headers });
  }


  consultarAreasFormacionPorNombre(name: string, page?: number, pageSize?: number, field?: string, asc?: boolean) : Observable<ResponseListDTO<AreaFormacion>> {
    this.resource = "/areas-formacion/nombre/" + name;

    const params = new HttpParams()
    .set('page', page || 0)
    .set('pageSize', pageSize || 100)
    .set('field', field || 'id')
    .set('asc', asc || true);

    return this.executeGet('', { params: params, headers: this.headers });
  }


  consultarAreasFormacionPorIdCampoFormacion(idCampoFormacion: number, page?: number, pageSize?: number, field?: string, asc?: boolean) : Observable<ResponseListDTO<AreaFormacion>> {
    this.resource = "/campos-formacion/" + idCampoFormacion + "/areas-formacion";

    const params = new HttpParams()
    .set('page', page || 0)
    .set('pageSize', pageSize || 100)
    .set('field', field || 'id')
    .set('asc', asc || true);

    return this.executeGet('', { params: params, headers: this.headers });
  }


  consultarAreasFormacionPorNombreCampoFormacion(nombreCampoFormacion: string, page?: number, pageSize?: number, field?: string, asc?: boolean) : Observable<ResponseListDTO<AreaFormacion>> {
    this.resource = "/campos-formacion/nombre/" + nombreCampoFormacion + "/areas-formacion";

    const params = new HttpParams()
    .set('page', page || 0)
    .set('pageSize', pageSize || 100)
    .set('field', field || 'id')
    .set('asc', asc || true);

    return this.executeGet('', { params: params, headers: this.headers });
  }

}
