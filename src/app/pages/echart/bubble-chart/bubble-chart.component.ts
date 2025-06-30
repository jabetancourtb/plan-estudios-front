import { ChangeDetectionStrategy, Component, ElementRef, Input, input, SimpleChanges, ViewChild } from '@angular/core';
import * as echarts from 'echarts';
import { ContextualMenuComponent } from '../../../shared/components/contextual-menu/contextual-menu.component';
import { CampoFormacion } from '../../../models/campo-formacion.model';

@Component({
  selector: 'app-bubble-chart',
  imports: [ContextualMenuComponent],
  templateUrl: './bubble-chart.component.html',
  styleUrl: './bubble-chart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BubbleChartComponent { 

  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  chartInstance!: echarts.ECharts;

  //data = input.required<any[]>();
  @Input() data: any[] = [];

  menuVisible = false;
  menuX = 0;
  menuY = 0;
  clickedData: any = null;

  ngOnInit() {
    this.chartInstance = echarts.init(this.chartContainer.nativeElement);

    /*const data = [
      { name: 'Ciencias  Básicas', symbolSize: 60, link: 'https://example.com/sistemas', itemStyle: { color: '#91CC75' } },
      { name: 'Socio humanística', symbolSize: 50, link: 'https://example.com/industrial', itemStyle: { color: '#FAC858' } },
      { name: 'Ingeniería Aplicada', symbolSize: 50, link: 'https://example.com/industrial', itemStyle: { color: '#FAC858' } },
      { name: 'Básicas de la Ingeniería', symbolSize: 150, link: 'https://example.com/industrial', itemStyle: { color: '#FAC858' } },
      { name: 'Socio  humanística', symbolSize: 50, link: 'https://example.com/industrial', itemStyle: { color: '#FAC858' } },
      { name: 'Económico Administrativa', symbolSize: 50, link: 'https://example.com/industrial', itemStyle: { color: '#FAC858' } },
      { name: 'Ciencias Básicas', symbolSize: 50, link: 'https://example.com/industrial', itemStyle: { color: '#FAC858' } },
    ];



    const option = {
      tooltip: { formatter: '{b}' },
      series: [{
        type: 'graph',
        layout: 'force',
        roam: true,
        label: { show: true, color: '#fff' },
        force: { repulsion: 200 },
        data: this.data
        //data: data
      }]
    };

    this.chartInstance.setOption(option);

    // ✅ Captura el clic derecho sobre una burbuja
    this.chartInstance.on('contextmenu', (params: any) => {
      if (params.data) {
        this.clickedData = params.data;
        this.menuX = params.event.offsetX;
        this.menuY = params.event.offsetY;
        this.menuVisible = true;
        params.event.event.preventDefault(); // previene menú nativo del navegador
      }
    });*/
  }

  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.chartInstance) {
      this.renderChart();
    }
  }


  renderChart() {
    let dataGraph : any[] = [];

    for(let data of this.data) {
      dataGraph.push(
        { name: data.nombre, 
          symbolSize: data.cantidadAsignaturas, 
          link: 'https://example.com/sistemas', 
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

    this.chartInstance.off('contextmenu'); // evita múltiples listeners

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

  
  onGlobalContextMenu(event: MouseEvent) {
    event.preventDefault(); // Evita menú del navegador si no se hace en burbuja
    this.menuVisible = false;
  }


  onOptionSelected(action: string) {
    if (action === 'ver') {
      alert(`Detalles de: ${this.clickedData.name}`);
    } 
    else if (action === 'ir') {
      window.open(this.clickedData.link, '_blank');
    }
    
    this.menuVisible = false;
  }

}
