import { ChangeDetectionStrategy, Component, ElementRef, inject, Input, input, signal, SimpleChanges, ViewChild } from '@angular/core';
import * as echarts from 'echarts';
import { HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { URLParamsDTO } from '../../../dto/url-params.model';

@Component({
  selector: 'app-bubble-chart',
  imports: [],
  templateUrl: './bubble-chart.component.html',
  styleUrl: './bubble-chart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BubbleChartComponent { 

  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  @ViewChild('contextMenuRef', { static: false }) contextMenuRef!: ElementRef;

  chartInstance!: echarts.ECharts;

  //data = input.required<any[]>();
  router = inject(Router);
  @Input() data: any[] = [];
  //dataType = input();

  urlParams = input<URLParamsDTO>();

  menuVisible = false;
  menuX = 0;
  menuY = 0;
  clickedData: any = null;

  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data && this.data.length > 0) {
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
  }


  // Ocultar el menú contextual cuando se da click por fuera.
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (this.menuVisible && this.contextMenuRef && !this.contextMenuRef.nativeElement.contains(event.target)) {
      this.menuVisible = false;
    }
  }


  renderChart() {
    let dataGraph : any[] = [];

    for(let data of this.data) {

      let circleSize = 0;
      let color = '#B0C4DE';

      if(this.urlParams()?.categoria === 'campos-formacion') {
        circleSize = data.cantidadAsignaturas * 10;
        color = data.colorHtml;
      } 
      else if (this.urlParams()?.categoria === 'areas-formacion') {
        circleSize = data.cantidadAsignaturas * 20;
        color = data.colorHtml;
      }
      else if (this.urlParams()?.categoria === 'asignaturas') {
        circleSize = 100;
      }

      dataGraph.push(
        { 
          id: data.id,
          name: data.nombre, 
          symbolSize: circleSize, 
          link: 'https://example.com/sistemas', 
          ruta: `/detalle/${data.id}`,
          itemStyle: { 
            color: color
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

          if(this.urlParams()?.categoria === 'campos-formacion') {
            this.router.navigate(['/index', 'bubble-chart'], { queryParams: { categoria: 'areas-formacion', idCampoFormacion: params.data.id, nombreCampoFormacion: params.data.name } });
          }
          else if(this.urlParams()?.categoria === 'areas-formacion') {
            this.router.navigate(['/index', 'bubble-chart'], {  queryParams: { categoria: 'asignaturas', nombreCampoFormacion: this.urlParams()?.nombreCampoFormacion, nombreAreaFormacion: params.data.name } });
          }
          else if(this.urlParams()?.categoria === 'asignaturas') {
            //window.open(params.data.link, '_blank'); // navegación externa
          }
  
          //this.router.navigate(['/index']);
          //this.router.navigate([params.data.ruta]); // navegación interna
          //window.open(params.data.link, '_blank'); // navegación externa
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


  reloadPage(): void {
    window.location.reload();
  }

}
