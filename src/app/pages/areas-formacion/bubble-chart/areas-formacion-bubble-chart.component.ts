import { AreaFormacion } from '../../../models/area-formacion.model';
import { ChangeDetectionStrategy, Component, ElementRef, inject, Input, input, signal, SimpleChanges, ViewChild } from '@angular/core';
import * as echarts from 'echarts';
import { HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { URLParamsDTO } from '../../../dto/url-params.model';
import { AreaFormacionService } from '../../../services/area-formacion.service';
import { ResponseListDTO } from '../../../dto/response-list.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import Swal from 'sweetalert2';
import { APP_CONSTANTS } from '../../../utils/app-constants';


@Component({
  selector: 'app-areas-formacion-bubble-chart',
  imports: [NavbarComponent],
  templateUrl: './areas-formacion-bubble-chart.component.html',
  styleUrl: './areas-formacion-bubble-chart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AreasFormacionBubbleChartComponent {

  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  @ViewChild('contextMenuRef', { static: false }) contextMenuRef!: ElementRef;

  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private areaFormacionService: AreaFormacionService= inject(AreaFormacionService);

  areasFormacionBubbleGraphIsLoading = signal(false);

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

  responseListAreasFormacion = signal<ResponseListDTO<AreaFormacion>>({
    recordCountPerPage: 0,
    totalRecordCount: 0,
    totalPages: 0,
    content: []
  });

  areaFormacion = signal<AreaFormacion>({} as AreaFormacion);

  menuVisible = false;
  menuX = 0;
  menuY = 0;
  clickedData: any = null;

  contextualMenuOptions = {
    verDetalles: '🔍 Ver detalles',
    irAsignaturas: '➡️ Ir a asignaturas',
    guardarImage: '💾 Guardar imagen',
    copiarImagen: '📋 Copiar imagen',
  }

  contextualMenuAction = '';


  ngOnInit(): void {
    this.obtenerUrlParams();
    this.consultarAreasFormacion();
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


  consultarAreasFormacion() {
    if(this.urlParams().idCampoFormacion) {
      this.consultarAreasFormacionPorIdCampoFormacion(this.urlParams().idCampoFormacion, 1, 100, 'id', true);
    }
    else if(this.urlParams().nombreCampoFormacion) {
      this.consultarAreasFormacionPorNombreCampoFormacion(this.urlParams().nombreCampoFormacion, 1, 100, 'id', true);
    }
    else {
      this.consultarAreasFormacionPorPaginacion(1, 100, 'id', true);
    }
  }


  private consultarAreasFormacionPorPaginacion(page?: number, pageSize?: number, field?: string, asc?: boolean) {
    this.areasFormacionBubbleGraphIsLoading.set(true);
    this.areaFormacionService.consultarAreasFormacion(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListAreasFormacion.set(res);
        this.loadChart();
        this.areasFormacionBubbleGraphIsLoading.set(false);
      },
      error: (e) => {
        this.areasFormacionBubbleGraphIsLoading.set(false);
      }
    });
  }


  private consultarAreasFormacionPorIdCampoFormacion(idCampoFormacion: number, page?: number, pageSize?: number, field?: string, asc?: boolean) {
    this.areasFormacionBubbleGraphIsLoading.set(true);
    this.areaFormacionService.consultarAreasFormacionPorIdCampoFormacion(idCampoFormacion, page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListAreasFormacion.set(res);
        this.loadChart();
        this.areasFormacionBubbleGraphIsLoading.set(false);
      },
      error: (e) => {
        this.areasFormacionBubbleGraphIsLoading.set(false);
      }
    });
  }


  private consultarAreasFormacionPorNombreCampoFormacion(nombreCampoFormacion: string, page?: number, pageSize?: number, field?: string, asc?: boolean) {
    this.areasFormacionBubbleGraphIsLoading.set(true);
    this.areaFormacionService.consultarAreasFormacionPorNombreCampoFormacion(nombreCampoFormacion, page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListAreasFormacion.set(res);
        this.loadChart();
        this.areasFormacionBubbleGraphIsLoading.set(false);
      },
      error: (e) => {
        this.areasFormacionBubbleGraphIsLoading.set(false);
      }
    });
  }


  loadChart() {
    // Solo inicializar una vez
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

    for(let data of this.responseListAreasFormacion().content) {

      dataGraph.push(
        {
          id: data.id,
          name: data.nombre,
          symbolSize: data.cantidadAsignaturas * 20,
          itemStyle: {
            color: data.colorHtml
          },
          area: data
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


  clickEvents() {
    // Muestra detalles con click izquierdo
    this.chartInstance.on('click', (params: any) => {
      if (params.data) {
        this.clickedData = params.data;
        this.showSwalAreaFormacionDetalles();
      }
    });

    // Evita múltiples listeners
    this.chartInstance.off('contextmenu');

    // Abre menú contextual click derecho
    this.chartInstance.on('contextmenu', (params: any) => {
      if (params.data) {
        this.clickedData = params.data;
        console.log(params.event)
        this.menuX = params.event.offsetX;
        this.menuY = params.event.offsetY;
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
    //event.preventDefault(); // Evita menú del navegador si no se hace en burbuja
    if(this.menuX !== 0 && this.menuY !== 0 && this.clickedData != null) {
      this.menuVisible = true;
    }
  }


  saveImage(): void {
    const base64 = this.chartInstance.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff'
    });

    const link = document.createElement('a');
    link.href = base64;
    link.download = 'grafico-areas-formacion.png';
    link.click();
  }


  async copyImage(): Promise<void> {
    const base64 = this.chartInstance.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff'
    });

    try {
      const blob = await fetch(base64).then(res => res.blob());
      const item = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([item]);

      Swal.fire('Copiado', 'La imagen fue copiada al portapapeles.', 'success');
    }
    catch (err) {
      Swal.fire('Error', 'No se pudo copiar la imagen.', 'error');
    }
  }


  onOptionSelected(action: string) {
    if (!this.clickedData) return;

    this.contextualMenuAction = action;

     switch (this.contextualMenuAction) {
      case this.contextualMenuOptions.verDetalles:
        this.showSwalAreaFormacionDetalles();
        break;
      case this.contextualMenuOptions.guardarImage:
        this.saveImage();
        break;
      case this.contextualMenuOptions.copiarImagen:
        this.copyImage();
        break;
      case this.contextualMenuOptions.irAsignaturas:
        if(this.urlParams()?.nombreCampoFormacion) {
          this.router.navigate([APP_CONSTANTS.ROUTES.asignaturasBubbleChart], {  queryParams: { nombreCampoFormacion: this.urlParams()?.nombreCampoFormacion, nombreAreaFormacion: this.clickedData.name } });
        }
        else {
          this.router.navigate([APP_CONSTANTS.ROUTES.asignaturasBubbleChart], {  queryParams: { nombreAreaFormacion: this.clickedData.name } });
        }
        break;
      default:
    }

    this.menuVisible = false;
  }


  showSwalAreaFormacionDetalles() {
    const a = this.clickedData.area;

    let html = `
      <div style="max-height: 300px; overflow-y: auto;">
        <table class="table table-bordered text-start">
          <tr><th>Id</th><td>${a.id}</td></tr>

          <tr>
            <th>Id Campo de Formación</th>
            <td>
              Ver las áreas de formación asociadas al campo de formación con id:
              <a href="${APP_CONSTANTS.ROUTES.areasFormacionBubbleChart}?idCampoFormacion=${encodeURIComponent(a.idCampoFormacion)}">
                ${a.idCampoFormacion}
              </a>
            </td>
          </tr>`;

          if(this.urlParams().nombreCampoFormacion !== '') {
            html += `
            <tr>
              <th>Campo de Formación</th>
              <td>
                Ver las áreas de formación asociadas a:
                <a href="${APP_CONSTANTS.ROUTES.areasFormacionBubbleChart}?nombreCampoFormacion=${encodeURIComponent(this.urlParams()?.nombreCampoFormacion)}">
                  ${this.urlParams()?.nombreCampoFormacion}
                </a>
              </td>
            </tr>
            `
          }

          html += `<tr><th>Color</th><td> <span style="display: inline-block; width: 15px; height: 15px; background-color: ${a.colorHtml}; border: 1px solid #000;"></span></td></tr>
          <tr><th>Cantidad de asignaturas</th><td>${a.cantidadAsignaturas}</td></tr>`

          if(this.urlParams().nombreCampoFormacion !== '') {
            html += `
            <tr>
              <th>Ver asignaturas asociadas</th>
              <td>
                <a href="${APP_CONSTANTS.ROUTES.asignaturasBubbleChart}?nombreCampoFormacion=${encodeURIComponent(this.urlParams().nombreCampoFormacion)}&nombreAreaFormacion=${encodeURIComponent(a.nombre)}">
                  Asignaturas
                </a>
              </td>
            </tr>`
          }
          else {
            html += `
            <tr>
              <th>Ver asignaturas asociadas</th>
              <td>
                <a href="${APP_CONSTANTS.ROUTES.asignaturasBubbleChart}?nombreAreaFormacion=${encodeURIComponent(a.nombre)}">
                  Asignaturas
                </a>
              </td>
            </tr>`
          }

        `</table>
      </div>
      `;

    Swal.fire({
      title: a.nombre,
      html: html
    });
  }

}
