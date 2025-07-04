import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsignaturaService } from '../../services/asignatura.service';
import { Asignatura } from '../../models/asignatura.model';
import { ResponseList } from '../../dto/response-list.model';
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { HeaderComponent } from "../../shared/components/header/header.component";
import { BubbleChartComponent } from "../echart/bubble-chart/bubble-chart.component";
import { CampoFormacionService } from '../../services/campo-formacion.service';
import { CampoFormacion } from '../../models/campo-formacion.model';
import { LoaderService } from '../../services/loader.service';
import { AreaFormacion } from '../../models/area-formacion.model';
import { AreaFormacionService } from '../../services/area-formacion.service';
import { TreegraphChartComponent } from "../highchart/treegraph-chart/treegraph-chart.component";
import { CirclePackingComponent } from "../echart/circle-packing/circle-packing.component";

@Component({
  selector: 'app-asignaturas',
  imports: [FooterComponent, HeaderComponent, BubbleChartComponent, TreegraphChartComponent, CirclePackingComponent],
  templateUrl: './asignaturas.component.html',
  styleUrl: './asignaturas.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsignaturasComponent { 

  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private loaderService: LoaderService = inject(LoaderService);
  private asignaturaService: AsignaturaService = inject(AsignaturaService);
  private campoFormacionService: CampoFormacionService = inject(CampoFormacionService);
  private areaFormacionService: AreaFormacionService = inject(AreaFormacionService);


  camposFormacion = signal<CampoFormacion[]>([]);
  areasFormacion = signal<AreaFormacion[]>([]);

  asignaturas = signal<Asignatura[]>([]);

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
    this.consultarAsignaturas(1, 100, 'codigo', true);
    this.consultarCamposFormacion(1, 100, undefined, true);
    this.consultarAreasFormacion(1, 100, undefined, true);
  }

  private consultarCamposFormacion(page?: number, pageSize?: number, field?: string, asc?: boolean) {
    this.loaderService.show();
    this.campoFormacionService.consultarCamposFormacion(page, pageSize, field, asc).subscribe({
      next: (res) => {

        // Múltipla la cantidadAsignaturas por 10 para asignarlo al tamaño de las burbujas.
        const contenidoTransformado = res.content.map(c => ({
          ...c,
          cantidadAsignaturas: c.cantidadAsignaturas * 10
        }));
  
        this.responseListCamposFormacion.set({
          ...res,
          content: contenidoTransformado
        });

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

        // Múltipla la cantidadAsignaturas por 20 para asignarlo al tamaño de las burbujas.
        const contenidoTransformado = res.content.map(c => ({
          ...c,
          cantidadAsignaturas: c.cantidadAsignaturas * 20
        }));
  
        this.responseListAreasFormacion.set({
          ...res,
          content: contenidoTransformado
        });

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
