import { ChangeDetectionStrategy, Component, inject, signal, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsignaturaService } from '../../services/asignatura.service';
import { Asignatura } from '../../models/asignatura.model';
import { ResponseListDTO } from '../../dto/response-list.model';
import { BubbleChartComponent } from "../echart/bubble-chart/bubble-chart.component";
import { CampoFormacionService } from '../../services/campo-formacion.service';
import { CampoFormacion } from '../../models/campo-formacion.model';
import { LoaderService } from '../../services/loader.service';
import { AreaFormacion } from '../../models/area-formacion.model';
import { AreaFormacionService } from '../../services/area-formacion.service';
import { CirclePackingComponent } from "../echart/circle-packing/circle-packing.component";
import { URLParamsDTO } from '../../dto/url-params.model';


@Component({
  selector: 'app-index',
  imports: [BubbleChartComponent, CirclePackingComponent],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndexComponent { 

  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private loaderService: LoaderService = inject(LoaderService);
  private asignaturaService: AsignaturaService = inject(AsignaturaService);
  private campoFormacionService: CampoFormacionService = inject(CampoFormacionService);
  private areaFormacionService: AreaFormacionService = inject(AreaFormacionService);


  camposFormacion = signal<CampoFormacion[]>([]);
  areasFormacion = signal<AreaFormacion[]>([]);
  asignaturas = signal<Asignatura[]>([]);

  tipoGrafico = signal('');

  urlParams = signal<URLParamsDTO>({
    "categoria": '',
    "idCampoFormacion": 0,
    "nombreCampoFormacion": '',
    "idAreaFormacion": 0,
    "nombreAreaFormacion": '',
    "idAsignatura": 0
  })

  responseListAsignaturas = signal<ResponseListDTO<Asignatura>>({
    recordCountPerPage: 0,
    totalRecordCount: 0,
    totalPages: 0,
    content: []
  });

  responseListCamposFormacion = signal<ResponseListDTO<CampoFormacion>>({
    recordCountPerPage: 0,
    totalRecordCount: 0,
    totalPages: 0,
    content: []
  });

  responseListAreasFormacion = signal<ResponseListDTO<AreaFormacion>>({
    recordCountPerPage: 0,
    totalRecordCount: 0,
    totalPages: 0,
    content: []
  });


  ngOnInit(): void {
    this.obtenerUrlParams();
    this.consultarCategoria();
  }


  obtenerUrlParams() {
    this.activatedRoute.paramMap.subscribe((params) => {
      const tipoGrafico = params.get('tipoGrafico') ?? '';
      this.tipoGrafico.set(tipoGrafico);
    });

    this.activatedRoute.queryParamMap.subscribe((params) => {
      this.urlParams.set({
        categoria: params.get('categoria') ?? '',
        idCampoFormacion: Number(params.get('idCampoFormacion')) ?? 0,
        nombreCampoFormacion: params.get('nombreCampoFormacion') ?? '',
        idAreaFormacion: Number(params.get('idAreaFormacion')) ?? 0,
        nombreAreaFormacion: params.get('nombreAreaFormacion') ?? '',
        idAsignatura: Number(params.get('idAsignatura')) ?? 0,
      });
    });
  }


  consultarCategoria() {
    if (this.urlParams().categoria == 'campos-formacion') {
      this.consultarCamposFormacion(1, 100, undefined, true);
    }
    else if(this.urlParams().categoria == 'areas-formacion') {
      if(this.urlParams().idCampoFormacion) {
        this.consultarAreasFormacionPorIdCampoFormacion(this.urlParams().idCampoFormacion, 1, 100, undefined, true);
      }
      else {
        this.consultarAreasFormacion(1, 100, undefined, true);
      } 
    }
    else if(this.urlParams().categoria == 'asignaturas') {
      if(this.urlParams().nombreAreaFormacion && this.urlParams().nombreAreaFormacion) {
        this.consultarAsignaturasPorCampoFormacionYAreaFormacion(this.urlParams().nombreCampoFormacion, this.urlParams().nombreAreaFormacion, 1, 100, 'codigo', true);
      }
      else {
        this.consultarAsignaturas(1, 100, 'codigo', true);
      }
      
    }
  }


  private consultarCamposFormacion(page?: number, pageSize?: number, field?: string, asc?: boolean) {
    this.loaderService.show();
    this.campoFormacionService.consultarCamposFormacion(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListCamposFormacion.set(res);
        this.loaderService.hide();
      },
      error: (e) => {
        this.loaderService.hide();
      }
    });
  }


  private consultarAreasFormacion(page?: number, pageSize?: number, field?: string, asc?: boolean) {
    this.loaderService.show();
    this.areaFormacionService.consultarAreasFormacion(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListAreasFormacion.set(res);
        this.loaderService.hide();
      },
      error: (e) => {
        this.loaderService.hide();
      }
    });
  }

  private consultarAreasFormacionPorIdCampoFormacion(idCampoFormacion: number, page?: number, pageSize?: number, field?: string, asc?: boolean) {
    this.loaderService.show();
    this.areaFormacionService.consultarAreasFormacionPorIdCampoFormacion(idCampoFormacion, page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListAreasFormacion.set(res);
        this.loaderService.hide();
      },
      error: (e) => {
        this.loaderService.hide();
      }
    });
  }


  private consultarAsignaturasPorCarrera(carrera: string, page: number, pageSize: number, field: string, asc: boolean) {
    this.loaderService.show();
    this.asignaturaService.consultarAsignaturasPorCarrera(carrera, 1, 100, 'codigo', true).subscribe({
      next: (res) => {
        this.responseListAsignaturas.set(res);
        this.loaderService.hide();
      },
      error: (e) => {
        this.loaderService.hide();
      }
    });
  }

  
  private consultarAsignaturas(page: number, pageSize: number, field: string, asc: boolean) {
    this.loaderService.show();
    this.asignaturaService.consultarAsignaturas(1, 100, 'codigo', true).subscribe({
      next: (res) => {
        this.responseListAsignaturas.set(res);
        this.loaderService.hide();
      },
      error: (e) => {
        this.loaderService.hide();
      }
    });
  }

  private consultarAsignaturasPorCampoFormacionYAreaFormacion(camporFormacion:string, areaFormacion: string, page: number, pageSize: number, field: string, asc: boolean) {
    this.loaderService.show();
    this.asignaturaService.consultarAsignaturasPorCampoFormacionYAreaFormacion(camporFormacion, areaFormacion, 1, 100, 'codigo', true).subscribe({
      next: (res) => {
        this.responseListAsignaturas.set(res);
        this.loaderService.hide();
      },
      error: (e) => {
        this.loaderService.hide();
      }
    });
  }


}
