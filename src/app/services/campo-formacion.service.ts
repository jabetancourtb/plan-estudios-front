import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { ResponseListDTO } from '../dto/response-list.model';
import { Observable } from 'rxjs';
import { CampoFormacion } from '../models/campo-formacion.model';


@Injectable({
  providedIn: 'root'
})
export class CampoFormacionService extends BaseService<any> {

  protected apiPlanEstudiosUDistrital: string = environment.apiPlanEstudiosUDistrital.url;

  protected headers = new HttpHeaders({});


  constructor() {
    super();
    this.apiUrl = this.apiPlanEstudiosUDistrital;
  }


  consultarCamposFormacion(page?: number, pageSize?: number, field?: string, asc?: boolean) : Observable<ResponseListDTO<CampoFormacion>> {
    this.resource = "/campos-formacion";

    const params = new HttpParams()
    .set('page', page || 0)
    .set('pageSize', pageSize || 100)
    .set('field', field || 'id')
    .set('asc', asc || true);

    return this.executeGet('', { params: params, headers: this.headers });
  }


  consultarCamposFormacionPorId(id: number, page?: number, pageSize?: number, field?: string, asc?: boolean) : Observable<CampoFormacion> {
    this.resource = "/campos-formacion/" + id;
    return this.executeGet('', { headers: this.headers });
  }


  consultarCamposFormacionPorNombre(name: string, page?: number, pageSize?: number, field?: string, asc?: boolean) : Observable<ResponseListDTO<CampoFormacion>> {
    this.resource = "/campos-formacion/nombre/" + name;

    const params = new HttpParams()
    .set('page', page || 0)
    .set('pageSize', pageSize || 100)
    .set('field', field || 'id')
    .set('asc', asc || true);

    return this.executeGet('', { params: params, headers: this.headers });
  }

}
