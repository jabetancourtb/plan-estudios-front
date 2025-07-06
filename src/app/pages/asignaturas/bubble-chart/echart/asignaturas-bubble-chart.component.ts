import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import * as echarts from 'echarts';
import Swal from 'sweetalert2';
import { HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { URLParamsDTO } from '../../../../dto/url-params.model';
import { Asignatura } from '../../../../models/asignatura.model';
import { ResponseListDTO } from '../../../../dto/response-list.model';
import { LoaderService } from '../../../../services/loader.service';
import { AsignaturaService } from '../../../../services/asignatura.service';
import { NavbarComponent } from "../../../../shared/components/navbar/navbar.component";
import { APP_CONSTANTS } from '../../../../utils/app-constants';


@Component({
  selector: 'app-asignaturas-bubble-chart',
  imports: [NavbarComponent],
  templateUrl: './asignaturas-bubble-chart.component.html',
  styleUrl: './asignaturas-bubble-chart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsignaturasBubbleChartComponent {

  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  @ViewChild('contextMenuRef', { static: false }) contextMenuRef!: ElementRef;

  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private loaderService: LoaderService = inject(LoaderService);
  private asignaturaService: AsignaturaService= inject(AsignaturaService);

  chartInstance!: echarts.ECharts;

  router = inject(Router);

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

  asignatura = signal<Asignatura>({} as Asignatura);

  menuVisible = false;
  menuX = 0;
  menuY = 0;
  clickedData: any = null;

  contextualMenuOptions = {
    verDetalles: '🔍 Ver detalles',
    verJustificacion: 'Ver justificación',
    irSyllabus: '🔗 Ir al syllabus',
    irObjetosEstudio: '🔗 Ir a objetos de estudio',
    irVerbos: '🔗 Ir a verbos de estudio',
  }

  contextualMenuAction = '';


  ngOnInit(): void {
    this.obtenerUrlParams();
    this.consultarAsignaturas();
  }


  obtenerUrlParams() {
    this.activatedRoute.paramMap.subscribe((params) => {
      const tipoGrafico = params.get('tipoGrafico') ?? '';
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


  consultarAsignaturas() {
    if(this.urlParams().nombreCampoFormacion && this.urlParams().nombreAreaFormacion) {
      this.consultarAsignaturasPorCampoFormacionYAreaFormacion(this.urlParams().nombreCampoFormacion, this.urlParams().nombreAreaFormacion, 1, 100, 'codigo', true);
    }
    else if(this.urlParams().nombreAreaFormacion) {
      this.consultarAsignaturasPorAreaFormacion(this.urlParams().nombreAreaFormacion, 1, 100, 'codigo', true);
    }
    else {
      this.consultarAsignaturasPorPaginacion(1, 100, 'codigo', true);
    }
  }

  private consultarAsignaturasPorPaginacion(page: number, pageSize: number, field: string, asc: boolean) {
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


  private consultarAsignaturasPorCampoFormacionYAreaFormacion(camporFormacion:string, areaFormacion: string, page: number, pageSize: number, field: string, asc: boolean) {
    this.loaderService.show();
    this.asignaturaService.consultarAsignaturasPorCampoFormacionYAreaFormacion(camporFormacion, areaFormacion, page, pageSize, field, asc).subscribe({
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


  private consultarAsignaturasPorAreaFormacion(areaFormacion: string, page: number, pageSize: number, field: string, asc: boolean) {
    this.loaderService.show();
    this.asignaturaService.consultarAsignaturasPorAreaFormacion(areaFormacion, page, pageSize, field, asc).subscribe({
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


  loadChart() {
    if (!this.chartInstance && this.chartContainer?.nativeElement?.clientHeight > 0) {
      this.chartInstance = echarts.init(this.chartContainer.nativeElement);
    }

    if (this.chartInstance) {
      this.renderChart();
    }

    window.addEventListener('resize', () => {
      if (this.chartInstance) {
        this.chartInstance.resize();
      }
    });
  }


  renderChart() {
    let dataGraph : any[] = [];

    for(let data of this.responseListAsignaturas().content) {
      dataGraph.push(
        {
          id: data.codigo,
          name: data.nombre,
          symbolSize: 100,
          syllabusURL: `https://sistematizaciondedatos.com/wp-content/Modul_056_ImprimirSyllabus_07/public/mostrar3.php?codigo_asignatura=${data.codigo}`,
          studyObjectsURL: `https://sistematizaciondedatos.com/wp-content/verbos/visualizar_datos.php?asignatura=${data.codigo}`,
          verbsURL: `https://sistematizaciondedatos.com/wp-content/verbos/results.php?asignatura=${data.nombre}`,
          itemStyle: {
            color: this.getRandomColor(),
          },
          subject: data
        },
      );
    }

    const option = {
      tooltip: { formatter: '{b}' },
      series: [{
        type: 'graph',
        layout: 'force',
        roam: true,
        label: { show: true, color: '#000000' },
        force: { repulsion: 1000 },
        data: dataGraph
      }]
    };

    this.chartInstance.setOption(option, true);

    this.clickEvents();
  }


  private getRandomColor(): string {
    const lightLetters = '89ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += lightLetters[Math.floor(Math.random() * lightLetters.length)];
    }
    return color;
  }


  clickEvents() {
    // Muestra detalles con click izquierdo
    this.chartInstance.on('click', (params: any) => {
      if (params.data) {
        this.clickedData = params.data;
        this.showSwalAsignaturaDetalles();
      }
    });

    // Evita múltiples listeners
    this.chartInstance.off('contextmenu', (params: any) => {
      this.clickedData = null;
    });

    // Abre menú contextual click derecho
    this.chartInstance.on('contextmenu', (params: any) => {
      if (params.data) {
        this.clickedData = params.data;
        this.menuX = params.event.event.pageX;
        this.menuY = params.event.event.pageY;
        this.menuVisible = true;
        params.event.event.preventDefault();
      }
    });
  }


  // Ocultar el menú contextual cuando se da click por fuera.
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (this.menuVisible && this.contextMenuRef && !this.contextMenuRef.nativeElement.contains(event.target)) {
      this.menuVisible = false;
      this.clickedData = null;
    }
  }


  onGlobalContextMenu(event: MouseEvent) {
    event.preventDefault(); // Evita menú del navegador si no se hace en burbuja
    if(this.menuX !== 0 && this.menuY !== 0) {
      this.menuVisible = true;
    }
  }


  onOptionSelected(action: string, event: any) {
    if (!this.clickedData) return;

    this.contextualMenuAction = action;

    switch (this.contextualMenuAction) {
      case this.contextualMenuOptions.verDetalles:
        this.showSwalAsignaturaDetalles();
        break;
      case this.contextualMenuOptions.verJustificacion:
        this.showSwalAsignaturaJustificacion();
        break;
      case this.contextualMenuOptions.irSyllabus:
        window.open(this.clickedData.syllabusURL, '_blank'); // externo
        break;
      case this.contextualMenuOptions.irObjetosEstudio:
        window.open(this.clickedData.studyObjectsURL, '_blank'); // externo
        break;
      case this.contextualMenuOptions.irVerbos:
        window.open(this.clickedData.verbsURL, '_blank'); // externo
        break;
      default:
    }

    this.menuVisible = false;
  }


  showSwalAsignaturaDetalles() {
    const a = this.clickedData.subject;

    Swal.fire({
      title: this.clickedData.subject.nombre,
      width: '800px',
      html: `
        <div style="max-height: 300px; overflow-y: auto; overflow-x: auto;">
          <table class="table table-bordered text-start">
            <tr><th>Código</th><td>${a.codigo}</td></tr>
            <tr><th>Carrera</th><td>${a.carrera}</td></tr>
            <tr><th>Semestre</th><td>${a.semestre_asignatura}</td></tr>

            <tr>
              <th>Campo de Formación</th>
              <td>
                Ver las áreas de formación asociadas:
                <a href="${APP_CONSTANTS.ROUTES.areasFormacionEchartBubbleChart}?nombreCampoFormacion=${encodeURIComponent(a.campo_formacion)}">
                  ${a.campo_formacion}
                </a>
              </td>
            </tr>

            <tr>
              <th>Área de Formación</th>
              <td>
                Ver las asignaturas asociadas:
                <a href="${APP_CONSTANTS.ROUTES.asignaturasEchartBubbleChart}?nombreAreaFormacion=${encodeURIComponent(a.area_formacion)}">
                  ${a.area_formacion}
                </a>
              </td>
            </tr>

            <tr>
              <th>Ver syllabus</th>
              <td>
                <a href="${this.clickedData.syllabusURL}" target="_blank">
                  ${this.clickedData.syllabusURL}
                </a>
              </td>
            </tr>

            <tr>
              <th>Ver objetos de estudio</th>
              <td>
                <a href="${this.clickedData.studyObjectsURL}" target="_blank">
                  ${this.clickedData.studyObjectsURL}
                </a>
              </td>
            </tr>

            <tr>
              <th>Ver verbos</th>
              <td>
                <a href="${this.clickedData.verbsURL}" target="_blank">
                  ${this.clickedData.verbsURL}
                </a>
              </td>
            </tr>

            <tr>
              <th>Justificación</th>
              <td>
                <button type="button" id="btnJustificacion" class="btn btn-primary">Ver</button>
              </td>
            </tr>

            <tr><th>Tipo</th><td>${a.Tipo}</td></tr>
            <tr><th>Número de Créditos</th><td>${a.numero_creditos}</td></tr>
            <tr><th>HTD</th><td>${a.HTD}</td></tr>
            <tr><th>HTC</th><td>${a.HTC}</td></tr>
            <tr><th>HTA</th><td>${a.HTA}</td></tr>
          </table>
        </div>
      `,
      didOpen: () => {
        const btn = document.getElementById('btnJustificacion');
        if (btn) {
          btn.addEventListener('click', () => {
            this.showSwalAsignaturaJustificacion(); // ✅ Abre el otro swal
          });
        }
      }
    });
  }


  showSwalAsignaturaJustificacion() {
    const a =  this.clickedData.subject;

    if(!a.justificacion) {
      Swal.fire({
        title: 'Justificación no disponible',
        text: 'No hay justificación disponible para esta asignatura.',
        icon: 'info'
      });
      return;
    }

    Swal.fire({
      title:  a.nombre,
      width: '800px',
      html: `
      <div style="max-height: 300px; overflow-y: auto; overflow-x: auto;">
        <table class="table table-bordered text-start" style="table-layout: fixed; width: 100%;>
          <tr><td style="white-space: pre-line">${a.justificacion}</td></tr>
        </table>
      </div>
      `
    });
  }


}
