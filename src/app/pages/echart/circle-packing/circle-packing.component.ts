import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { NgZone } from '@angular/core';
import { CampoFormacion } from '../../../models/campo-formacion.model';
import { AreaFormacion } from '../../../models/area-formacion.model';
import { Asignatura } from '../../../models/asignatura.model';


type EstructuraResultado = Record<string, any>;


@Component({
  selector: 'app-circle-packing',
  imports: [NgxEchartsDirective],
  templateUrl: './circle-packing.component.html',
  styleUrl: './circle-packing.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CirclePackingComponent  { 

  @Input() camposFormacion: CampoFormacion[] = [];
  @Input() areasFormacion: AreaFormacion[] = [];
  @Input() asignaturas: Asignatura[] = [];

  chartInstance!: any;
  chartOption: any = {};

  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) {}


  onChartInit(instance: any) {
    this.chartInstance = instance;
  }


  async loadD3() {
    if (!(window as any).d3) {
      const module = await import('d3-hierarchy');
      (window as any).d3 = module.default ?? module;
    }
  }
  

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['camposFormacion'] && this.camposFormacion?.length > 0 &&
      changes['areasFormacion'] && this.areasFormacion?.length > 0 &&
      changes['asignaturas'] && this.asignaturas?.length > 0
    ) {
      this.ngZone.runOutsideAngular(() => {
        setTimeout(async () => {
          const rawData = await this.loadAndConvertExternalData();
          await this.loadD3();
          const dataWrap = this.prepareData(rawData);
          this.initChart(dataWrap.seriesData, dataWrap.maxDepth);
        }, 0);
      });
    }
  }


  loadAndConvertExternalData() : EstructuraResultado{

    const resultado: EstructuraResultado = {
      $count: this.asignaturas.length,
      color: '#B41E1E'
    };
  
    for(const campo of this.camposFormacion) {
      
      const campoNombre = campo.nombre;
      resultado[campoNombre] = { $count: campo.cantidadAreasFormacion, color: campo.colorHtml };
  
      const areasFiltradas = this.areasFormacion.filter(area => area.idCampoFormacion === campo.id);
  
      for(const area of areasFiltradas) {
        const areaNombre = area.nombre;
        resultado[campoNombre][areaNombre] = { $count: area.cantidadAsignaturas, color: area.colorHtml  };
  
        const asignaturasFiltradas = this.asignaturas.filter(
          asig =>
            asig.campo_formacion === campoNombre &&
            asig.area_formacion === areaNombre
        );
  
        for (const asig of asignaturasFiltradas) {
          resultado[campoNombre][areaNombre][asig.nombre] = {
            $count: 1,
            color: '#FFFFFF' 
          };
        }
      }
    }

    return resultado;
  }


  prepareData(rawData: any) {
    const seriesData: any[] = [];
    let maxDepth = 0;

    function convert(source: any, basePath: string, depth: number) {
      if (!source || depth > 5) return;
      maxDepth = Math.max(depth, maxDepth);
      seriesData.push({ id: basePath, value: source.$count, depth, index: seriesData.length, color: source.color || '#FFFFFF'  });

      for (let key in source) {
        if ((source.hasOwnProperty(key) && !key.startsWith('$')) && key != 'color') {
          convert(source[key], basePath + '.' + key, depth + 1);
        }
      }
    }

    convert(rawData, 'option', 0);
    return { seriesData, maxDepth };
  }

  
  initChart(seriesData: any[], maxDepth: number) {
   
    const d3 = (window as any).d3;   
    
    if (!d3 || typeof d3.stratify !== 'function') {
      console.error('d3-hierarchy was not loaded correctly');
      return;
    }

    const stratify = () => {
      return d3
        .stratify()
        .parentId((d: any) => d.id.substring(0, d.id.lastIndexOf('.')))(seriesData)
        .sum((d: any) => d.value || 0)
        .sort((a: any, b: any) => b.value - a.value);
    };

    let displayRoot = stratify();

    const renderItem = (params: any, api: any) => {
      const context = params.context;
      if (!context.layout) {
        context.layout = true;
        const pack = d3.pack().size([api.getWidth() - 2, api.getHeight() - 2]).padding(3);
        context.nodes = {};
        pack(displayRoot);
        displayRoot.descendants().forEach((node: any) => {
          context.nodes[node.id] = node;
        });
      }

      const node = context.nodes[api.value('id')];
      if (!node) return;

      const isLeaf = !node.children || !node.children.length;
      const nodeName = isLeaf ? node.id.split('.').pop().split(/(?=[A-Z][^A-Z])/g).join('\n') : '';

      return {
        type: 'circle',
        shape: { cx: node.x, cy: node.y, r: node.r },
        transition: ['shape', 'style'],
        style: { fill: api.value('color') },
        textContent: {
          type: 'text',
          style: {
            text: nodeName,
            fontSize: node.r / 3,
            fontFamily: 'Arial',
            width: node.r * 1.3,
            overflow: 'truncate'
          },
        },
        textConfig: { position: 'inside' },
        z2: api.value('depth') * 2
      };
    };

    this.ngZone.run(() => {
      this.chartOption = {
        backgroundColor: '#499bd1',
        dataset: { source: seriesData },
        tooltip: {},
        visualMap: [{
          show: false,
          min: 0,
          max: maxDepth,
          dimension: 'depth',
          inRange: { color: ['#006edd', '#e0ffff'] }
        }],
        hoverLayerThreshold: Infinity,
        series: {
          type: 'custom',
          renderItem,
          coordinateSystem: 'none',
          encode: {
            tooltip: 'value',
            itemName: 'id'
          }
        }
      };
      this.cdr.detectChanges();
    })

    this.chartInstance.on('click', { seriesIndex: 0 }, (params: any) => {
      drillDown(params.data.id);
    });
    

    const drillDown = (targetNodeId: string | null) => {
      displayRoot = stratify();
      if (targetNodeId) {
        displayRoot = displayRoot.descendants().find((node: any) => node.data.id === targetNodeId);
        displayRoot.parent = null;
      }
      this.chartOption = { ...this.chartOption, dataset: { source: seriesData } };
      setTimeout(() => this.chartInstance.resize(), 0);
    };

    setTimeout(() => this.chartInstance.resize(), 0);

    this.chartInstance.getZr().on('click', (event: any) => {
      if (!event.target) drillDown(null);
    });
  }
  

}

