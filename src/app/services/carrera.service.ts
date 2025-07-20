import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { ResponseListDTO } from '../dto/response-list.model';
import { Observable } from 'rxjs';
import { Carrera } from '../models/carrera.model';

@Injectable({
  providedIn: 'root'
})
export class CarreraService extends BaseService<any> {

  protected apiPlanEstudiosUDistrital: string = environment.apiPlanEstudiosUDistrital.url;


  protected headers = new HttpHeaders({});


  constructor() {
    super();
    this.apiUrl = this.apiPlanEstudiosUDistrital;
  }


  consultarCarreras(page: number, pageSize: number, field: string, asc: boolean) : Observable<ResponseListDTO<Carrera>> {
    this.resource = "/carreras";

    const params = new HttpParams()
    .set('page', page)
    .set('pageSize', pageSize)
    .set('field', field)
    .set('asc', asc);

    return this.executeGet('', { params: params, headers: this.headers });
  }


  consultarCarrerasPorNombre(name: string, page: number, pageSize: number, field: string, asc: boolean) : Observable<ResponseListDTO<Carrera>> {
    this.resource = "/carreras/" + name;

    const params = new HttpParams()
    .set('page', page)
    .set('pageSize', pageSize)
    .set('field', field)
    .set('asc', asc);

    return this.executeGet('', { params: params, headers: this.headers });
  }


}
