import { ChangeDetectionStrategy, Component, inject, signal, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsignaturaService } from '../../services/asignatura.service';
import { Asignatura } from '../../models/asignatura.model';
import { ResponseList } from '../../dto/response-list.model';
import { BubbleChartComponent } from "../echart/bubble-chart/bubble-chart.component";
import { CampoFormacionService } from '../../services/campo-formacion.service';
import { CampoFormacion } from '../../models/campo-formacion.model';
import { LoaderService } from '../../services/loader.service';
import { AreaFormacion } from '../../models/area-formacion.model';
import { AreaFormacionService } from '../../services/area-formacion.service';
import { CirclePackingComponent } from "../echart/circle-packing/circle-packing.component";

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

  categoria = signal('');

  responseListAsignaturas = signal<ResponseList<Asignatura>>({
    recordCountPerPage: 0,
    totalRecordCount: 0,
    totalPages: 0,
    content: []
  });

  responseListCamposFormacion = signal<ResponseList<CampoFormacion>>({
    recordCountPerPage: 0,
    totalRecordCount: 0,
    totalPages: 0,
    content: []
  });

  responseListAreasFormacion = signal<ResponseList<AreaFormacion>>({
    recordCountPerPage: 0,
    totalRecordCount: 0,
    totalPages: 0,
    content: []
  });


  ngOnInit(): void {
    this.obtenerCategoria();
    this.consultarCategoria();
  }


  consultarCategoria() {
    if (this.categoria() == 'campos-formacion') {
      this.consultarCamposFormacion(1, 100, undefined, true);
    }
    else if(this.categoria() == 'areas-formacion') {
      this.consultarAreasFormacion(1, 100, undefined, true);
    }
    else if(this.categoria() == 'asignaturas') {
      this.consultarAsignaturas(1, 100, 'codigo', true);
    }
  }


  obtenerCategoria() {
    this.activatedRoute.queryParamMap.subscribe((params) => {
      const categoria = params.get('categoria') ?? '';
      this.categoria.set(categoria);
    });
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


  private consultarAsignaturasPorCarrera(carrera: string, page: number, pageSize: number, field: string, asc: boolean) {
    this.loaderService.show();
    this.asignaturaService.consultarAsignaturasPorCarrera(carrera, 1, 100, 'codigo', true).subscribe({
      next: (res) => {
        this.responseListAsignaturas.set(res);
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
      },
      error: (e) => {
        this.loaderService.hide();
      }
    });
  }


}
