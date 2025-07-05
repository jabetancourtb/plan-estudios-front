import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import * as echarts from 'echarts';
import { HostListener } from '@angular/core';
import { CampoFormacion } from '../../../../models/campo-formacion.model';
import { CampoFormacionService } from '../../../../services/campo-formacion.service';
import { LoaderService } from '../../../../services/loader.service';
import { ResponseListDTO } from '../../../../dto/response-list.model';
import { Router } from '@angular/router';
import { NavbarComponent } from "../../../../shared/components/navbar/navbar.component";
import { FooterComponent } from "../../../../shared/components/footer/footer.component";
import Swal from 'sweetalert2';


@Component({
  selector: 'app-campos-formacion-bubble-chart',
  imports: [NavbarComponent, FooterComponent],
  templateUrl: './campos-formacion-bubble-chart.component.html',
  styleUrl: './campos-formacion-bubble-chart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CamposFormacionBubbleChartComponent {

  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  @ViewChild('contextMenuRef', { static: false }) contextMenuRef!: ElementRef;

  private loaderService: LoaderService = inject(LoaderService);
  private campoFormacionService: CampoFormacionService = inject(CampoFormacionService);

  chartInstance!: echarts.ECharts;

  router = inject(Router);

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


  ngOnInit(): void {
    this.consultarCamposFormacion(1, 100, 'id', true);
  }


  private consultarCampoFormacionPorId(id: number) {
    this.loaderService.show();
    this.campoFormacionService.consultarCamposFormacionPorId(id).subscribe({
      next: (res) => {
        this.campoFormacion.set(res);
        this.showSwalEvent();
        this.loaderService.hide();
      },
      error: (e) => {
        this.loaderService.hide();
      }
    });
  }


  private consultarCamposFormacion(page?: number, pageSize?: number, field?: string, asc?: boolean) {
    this.loaderService.show();
    this.campoFormacionService.consultarCamposFormacion(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListCamposFormacion.set(res);
        this.loadChart();
        this.loaderService.hide();
      },
      error: (e) => {
        this.loaderService.hide();
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
          link: 'https://example.com/sistemas',
          ruta: `/detalle/${data.id}`,
          itemStyle: {
            color: data.colorHtml
          }
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
    // Redirige con click izquierdo
    this.chartInstance.on('click', (params: any) => {
      if (params.data?.ruta && params.data.ruta.startsWith('/')) {
        if (params.data) {
          this.router.navigate(['/bubble-chart/areas-formacion'], { queryParams: { idCampoFormacion: params.data.id, nombreCampoFormacion: params.data.name } });
        }
      }
      else if (params.data?.link) {
        window.open(params.data.link, '_blank'); // navegación externa
      }
    });

    // evita múltiples listeners
    this.chartInstance.off('contextmenu');

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
    }
  }


  // Menú contextual con click derecho o largo
  // Se activa con click derecho o manteniendo presionado el botón del mouse/touch
  @HostListener('mousedown', ['$event'])
  @HostListener('touchstart', ['$event'])
  onHoldStart(event: MouseEvent | TouchEvent) {
    this.holdTimer = setTimeout(() => {
      this.onLongClick(event);
    }, 500);
  }

  @HostListener('mouseup')
  @HostListener('mouseleave')
  @HostListener('touchend')
  @HostListener('touchcancel')
  onHoldEnd() {
    clearTimeout(this.holdTimer);
  }

  holdTimer: any;

  onLongClick(event: any) {
    let clientX = 0;
    let clientY = 0;

    if (event instanceof MouseEvent) {
      clientX = event.clientX;
      clientY = event.clientY;
      event.preventDefault(); // evita menú por defecto
    }
    else if (event instanceof TouchEvent && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    }

    this.menuX = clientX;
    this.menuY = clientY;
    this.menuVisible = true;
  }


  onGlobalContextMenu(event: MouseEvent) {
    event.preventDefault(); // Evita menú del navegador si no se hace en burbuja
    this.menuVisible = true;
  }


  onOptionSelected(action: string) {
    if (!this.clickedData) return;

    if (action === 'ver') {
      this.consultarCampoFormacionPorId(this.clickedData.id);
    }
    else if (action === 'ir') {
      const ruta = this.clickedData.ruta;

      if (ruta?.startsWith('/')) {
        this.router.navigate([ruta]); // ruta interna de Angular
      }
      else {
        window.open(this.clickedData.link, '_blank'); // externo
      }
    }
    this.menuVisible = false;
  }


  showSwalEvent() {
    const a = this.campoFormacion();

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
        </table>
      </div>
      `;

    Swal.fire({
      title: this.campoFormacion().nombre,
      html: html
    });
  }

}
