import { ChangeDetectionStrategy, Component, ElementRef, inject, Input, input, SimpleChanges, ViewChild } from '@angular/core';
import * as echarts from 'echarts';
import { HostListener } from '@angular/core';
import { Router } from '@angular/router';

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
  dataType = input();

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

      if(this.dataType() === 'Campos de formación') {
        circleSize = data.cantidadAsignaturas * 10;
        color = data.colorHtml;
      } 
      else if (this.dataType() === 'Áreas de formación') {
        circleSize = data.cantidadAsignaturas * 20;
        color = data.colorHtml;
      }
      else if (this.dataType() === 'Asignaturas') {
        circleSize = 30;
      }

      dataGraph.push(
        { 
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

    this.chartInstance.off('contextmenu'); // evita múltiples listeners

    this.chartInstance.on('click', (params: any) => {
      if (params.data?.ruta && params.data.ruta.startsWith('/')) {
        this.router.navigate(['/index']);
        //this.router.navigate([params.data.ruta]); // navegación interna
        //window.open(params.data.link, '_blank'); // navegación externa
      } 
      else if (params.data?.link) {
        window.open(params.data.link, '_blank'); // navegación externa
      }
    });

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
