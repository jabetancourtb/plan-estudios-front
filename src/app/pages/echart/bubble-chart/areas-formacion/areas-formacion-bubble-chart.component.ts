import { AreaFormacion } from '../../../../models/area-formacion.model';
import { ChangeDetectionStrategy, Component, ElementRef, inject, Input, input, signal, SimpleChanges, ViewChild } from '@angular/core';
import * as echarts from 'echarts';
import { HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { URLParamsDTO } from '../../../../dto/url-params.model';
import { LoaderService } from '../../../../services/loader.service';
import { AreaFormacionService } from '../../../../services/area-formacion.service';
import { ResponseListDTO } from '../../../../dto/response-list.model';


@Component({
  selector: 'app-areas-formacion-bubble-chart',
  imports: [],
  templateUrl: './areas-formacion-bubble-chart.component.html',
  styleUrl: './areas-formacion-bubble-chart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AreasFormacionBubbleChartComponent { 

  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  @ViewChild('contextMenuRef', { static: false }) contextMenuRef!: ElementRef;

  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private loaderService: LoaderService = inject(LoaderService);
  private areaFormacionService: AreaFormacionService= inject(AreaFormacionService);

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

  menuVisible = false;
  menuX = 0;
  menuY = 0;
  clickedData: any = null;


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
    else {
      this.consultarAreasFormacionPorPaginacion(1, 100, 'id', true);
    }
  }
  

  private consultarAreasFormacionPorPaginacion(page?: number, pageSize?: number, field?: string, asc?: boolean) {
    this.loaderService.show();
    this.areaFormacionService.consultarAreasFormacion(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListAreasFormacion.set(res);
        this.loadChart();
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

    for(let data of this.responseListAreasFormacion().content) {
   
      dataGraph.push(
        { 
          id: data.id,
          name: data.nombre, 
          symbolSize: data.cantidadAsignaturas * 20,
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
          if(this.urlParams()?.nombreCampoFormacion) {
            this.router.navigate(['/bubble-chart/asignaturas'], {  queryParams: { nombreCampoFormacion: this.urlParams()?.nombreCampoFormacion, nombreAreaFormacion: params.data.name } });
          }
          else {
            this.router.navigate(['/bubble-chart/asignaturas'], {  queryParams: { nombreAreaFormacion: params.data.name } });
          }
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
  

  onGlobalContextMenu(event: MouseEvent) {
    event.preventDefault(); // Evita menú del navegador si no se hace en burbuja
    this.menuVisible = true;
  }


  onOptionSelected(action: string) {
    if (!this.clickedData) return;

    if (action === 'ver') {
      alert(`Detalles de: ${this.clickedData.name}`);
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

}
