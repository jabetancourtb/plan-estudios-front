import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import * as echarts from 'echarts';
import { HostListener } from '@angular/core';
import { CampoFormacion } from '../../../models/campo-formacion.model';
import { CampoFormacionService } from '../../../services/campo-formacion.service';
import { ResponseListDTO } from '../../../dto/response-list.model';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import Swal from 'sweetalert2';
import { URLParamsDTO } from '../../../dto/url-params.model';
import { APP_CONSTANTS } from '../../../utils/app-constants';


@Component({
  selector: 'app-campos-formacion-bubble-chart',
  imports: [NavbarComponent],
  templateUrl: './campos-formacion-bubble-chart.component.html',
  styleUrl: './campos-formacion-bubble-chart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CamposFormacionBubbleChartComponent {

  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  @ViewChild('contextMenuRef', { static: false }) contextMenuRef!: ElementRef;

  router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private campoFormacionService: CampoFormacionService = inject(CampoFormacionService);

  camposFormacionBubbleGraphIsLoading = signal(false);

  chartInstance!: echarts.ECharts;

  urlParams = signal<URLParamsDTO>({
    "categoria": '',
    "idCampoFormacion": 0,
    "nombreCampoFormacion": '',
    "idAreaFormacion": 0,
    "nombreAreaFormacion": '',
    "idAsignatura": 0
  })

  campoFormacion = signal<CampoFormacion>({} as CampoFormacion);


  responseListCamposFormacion = signal<ResponseListDTO<CampoFormacion>>({
    recordCountPerPage: 0,
    totalRecordCount: 0,
    totalPages: 0,
    content: []
  });

  menuVisible = false;
  menuX = 0;
  menuY = 0;
  clickedData: any = null;

  contextualMenuOptions = {
    verDetalles: '🔍 Ver detalles',
    irAreasFormacion: '➡️ Ir a áreas de formación',
    guardarImage: '💾 Guardar imagen',
    copiarImagen: '📋 Copiar imagen',
  }

  contextualMenuAction = '';


  ngOnInit(): void {
    this.consultarCamposFormacionPorPaginacion(1, 100, 'id', true);
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


  private consultarCamposFormacionPorPaginacion(page?: number, pageSize?: number, field?: string, asc?: boolean) {
    this.camposFormacionBubbleGraphIsLoading.set(true);
    this.campoFormacionService.consultarCamposFormacion(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListCamposFormacion.set(res);
        this.loadChart();
        this.camposFormacionBubbleGraphIsLoading.set(false);
      },
      error: (e) => {
        this.camposFormacionBubbleGraphIsLoading.set(false);
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

    for(let data of this.responseListCamposFormacion().content) {

      dataGraph.push(
        {
          id: data.id,
          name: data.nombre,
          symbolSize: data.cantidadAsignaturas * 10,
          itemStyle: {
            color: data.colorHtml
          },
          field: data
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
        this.showSwalCampoFormacionDetalles();
      }
    });

    // evita múltiples listeners
    this.chartInstance.off('contextmenu');

    // Abre menú contextual click derecho
    this.chartInstance.on('contextmenu', (params: any) => {
      if (params.data) {
        this.clickedData = params.data;
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
    link.download = 'grafico-campos-formacion.png';
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
    } catch (err) {
      Swal.fire('Error', 'No se pudo copiar la imagen.', 'error');
    }
  }


  onOptionSelected(action: string) {
    if (!this.clickedData) return;

    this.contextualMenuAction = action;

     switch (this.contextualMenuAction) {
      case this.contextualMenuOptions.verDetalles:
        this.showSwalCampoFormacionDetalles();
        break;
      case this.contextualMenuOptions.guardarImage:
        this.saveImage();
        break;
      case this.contextualMenuOptions.copiarImagen:
        this.copyImage();
        break;
      case this.contextualMenuOptions.irAreasFormacion:
        this.router.navigate([APP_CONSTANTS.ROUTES.areasFormacionBubbleChart], { queryParams: { idCampoFormacion: this.clickedData.id, nombreCampoFormacion: this.clickedData.name } });
        break;
      default:
    }

    this.menuVisible = false;
  }


  showSwalCampoFormacionDetalles() {
    const a = this.clickedData.field;

    let html = `
      <div style="max-height: 300px; overflow-y: auto;">
        <table class="table table-bordered text-start">
          <tr><th>Id</th><td>${a.id}</td></tr>
          <tr><th>Color</th>
            <td>
              <span style="
                display: inline-block;
                width: 0;
                height: 0;
                border-top: 10px solid transparent;
                border-bottom: 10px solid transparent;
                border-left: 15px solid ${a.colorHtml};">
              </span>
            </td>
          </tr>
          <tr><th>Cantidad áreas de formación</th><td>${a.cantidadAreasFormacion}</td></tr>
          <tr><th>Cantidad de asignaturas</th><td>${a.cantidadAsignaturas}</td></tr>

          <tr>
            <th>Ver áreas de formación asociadas</th>
            <td>
              <a href="${APP_CONSTANTS.ROUTES.areasFormacionBubbleChart}?nombreCampoFormacion=${encodeURIComponent(a.nombre)}">
                Áreas de formación
              </a>
            </td>
          </tr>

        </table>
      </div>
      `;

    Swal.fire({
      title: a.nombre,
      html: html,
      draggable: true
    });
  }

}
