import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import * as echarts from 'echarts';
import { NavbarComponent } from "../../../../../shared/components/navbar/navbar.component";
import { LoaderService } from '../../../../../services/loader.service';
import { AsignaturaService } from '../../../../../services/asignatura.service';
import { PrerrequisitoService } from '../../../../../services/prerrequisito.service';
import { ResponseListDTO } from '../../../../../dto/response-list.model';
import { Asignatura } from '../../../../../models/asignatura.model';
import { Prerrequisito } from '../../../../../models/prerrequisito.model';

@Component({
  selector: 'app-prerrequisitos-tree-chart',
  imports: [NavbarComponent],
  templateUrl: './prerrequisitos-tree-chart.component.html',
  styleUrl: './prerrequisitos-tree-chart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrerrequisitosTreeChartComponent {

  private loaderService: LoaderService = inject(LoaderService);
  private asignaturaService: AsignaturaService = inject(AsignaturaService);
  private prerrequisitoService: PrerrequisitoService = inject(PrerrequisitoService);

  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  responseListAsignaturas = signal<ResponseListDTO<Asignatura>>({
    recordCountPerPage: 0,
    totalRecordCount: 0,
    totalPages: 0,
    content: []
  });

  responseListPrerrequisitos = signal<ResponseListDTO<Prerrequisito>>({
    recordCountPerPage: 0,
    totalRecordCount: 0,
    totalPages: 0,
    content: []
  });

  ngOnInit() {
    this.consultarAsignaturas(1, 100, 'semestreAsignatura', true);
    this.consultarAsignaturasPosterioresPorCodigoPrerrequisito(1, 1, 100, 'id', true);
    this.consultarAsignaturaPrerrequisitosPorCodigoAsignatura(1, 1, 100, 'id', true);
  }


  private consultarAsignaturas(page: number, pageSize: number, field: string, asc: boolean) {
    this.loaderService.show();
    this.asignaturaService.consultarAsignaturas(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListAsignaturas.set(res);
        this.loadChart();
        this.loaderService.hide();
      },
      error: (e) => {
        this.loaderService.hide();
      }
    });
  }


  private consultarAsignaturaPrerrequisitosPorCodigoAsignatura(codigoPrerrequisito: number, page: number, pageSize: number, field: string, asc: boolean) {
    this.loaderService.show();
    this.prerrequisitoService.consultarAsignaturaPrerrequisitosPorCodigoAsignatura(codigoPrerrequisito, page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListPrerrequisitos.set(res);
        this.loadChart();
        this.loaderService.hide();
      },
      error: (e) => {
        this.loaderService.hide();
      }
    });
  }


  private consultarAsignaturasPosterioresPorCodigoPrerrequisito(codigoAsignatura: number, page: number, pageSize: number, field: string, asc: boolean) {
    this.loaderService.show();
    this.prerrequisitoService.consultarAsignaturasPosterioresPorCodigoPrerrequisito(codigoAsignatura, page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListPrerrequisitos.set(res);
        this.loadChart();
        this.loaderService.hide();
      },
      error: (e) => {
        this.loaderService.hide();
      }
    });
  }



  loadChart(): void {
    const chart = echarts.init(this.chartContainer.nativeElement);
    chart.showLoading();

    fetch('assets/js/flare.json')
      .then(response => response.json())
      .then(data => {
        chart.hideLoading();

        data.children.forEach((datum: any, index: number) => {
          if (index % 2 === 0) datum.collapsed = true;
        });

        const option: echarts.EChartsOption = {
          tooltip: {
            trigger: 'item',
            triggerOn: 'mousemove'
          },
          series: [
            {
              type: 'tree',
              data: [data],
              top: '1%',
              left: '7%',
              bottom: '1%',
              right: '20%',
              symbolSize: 7,
              label: {
                position: 'left',
                verticalAlign: 'middle',
                align: 'right',
                fontSize: 9
              },
              leaves: {
                label: {
                  position: 'right',
                  verticalAlign: 'middle',
                  align: 'left'
                }
              },
              emphasis: {
                focus: 'descendant'
              },
              expandAndCollapse: true,
              animationDuration: 550,
              animationDurationUpdate: 750
            }
          ]
        };

        chart.setOption(option);
      });
  }


}
