import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import * as echarts from 'echarts';
import { NavbarComponent } from "../../../../../shared/components/navbar/navbar.component";
import { LoaderService } from '../../../../../services/loader.service';
import { AsignaturaService } from '../../../../../services/asignatura.service';
import { PrerrequisitoService } from '../../../../../services/prerrequisito.service';
import { ResponseListDTO } from '../../../../../dto/response-list.model';
import { Asignatura } from '../../../../../models/asignatura.model';
import { Prerrequisito } from '../../../../../models/prerrequisito.model';


export interface EstructuraDataGraph {
  name: string;
  children: any[];
}

export interface AsignaturaDataGraph {
  codigo: number;
  nombre: string;
}

export interface PrerrequisitoDataGraph {
  id: number;
  prerrequisitoCodigo: number;
  prerrequisito: string;
  asignaturaCodigo: number;
  asignatura: string;
}

export interface NodoFlare {
  name: string;
  children: NodoFlare[];
}

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
    this.consultarAsignaturas(1, 200, 'semestreAsignatura', true);
    //this.consultarAsignaturasPosterioresPorCodigoPrerrequisito(1, 1, 100, 'id', true);
    //this.consultarAsignaturaPrerrequisitosPorCodigoAsignatura(1, 1, 100, 'id', true);
    //this.consultarPrerrequisitosPorPagnacion(1, 100, 'id', true);
  }


  private consultarAsignaturas(page: number, pageSize: number, field: string, asc: boolean) {
    this.loaderService.show();
    this.asignaturaService.consultarAsignaturas(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListAsignaturas.set(res);
        this.consultarPrerrequisitosPorPagnacion(1, 200, 'id', true);
        this.loaderService.hide();
      },
      error: (e) => {
        this.loaderService.hide();
      }
    });
  }


   private consultarPrerrequisitosPorPagnacion(page: number, pageSize: number, field: string, asc: boolean) {
    this.loaderService.show();
    this.prerrequisitoService.consultarPrerrequisitos(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListPrerrequisitos.set(res);
        this.loadAndConvertExternalData();
        this.loaderService.hide();
      },
      error: (e) => {
        this.loaderService.hide();
      }
    });
  }


  /*
  loadAndConvertExternalData() {
    let resultado: EstructuraDataGraph[] = [];

    const asignaturasMap = this.responseListAsignaturas().content.map(asignatura => ({
      codigo: asignatura.codigo,
      nombre: asignatura.nombre,
      semestre: asignatura.semestre_asignatura,
    }));

    const prerrequisitos = this.responseListPrerrequisitos().content;

    for(let i=0; i<asignaturasMap.length; i++) {

      if(i==asignaturasMap.length) break;

      let sourceElement: EstructuraDataGraph = {
        name: '',
        children: []
      };

      sourceElement['name'] = asignaturasMap[i].nombre;

      const asignaturasPosterioresMap = prerrequisitos
        .filter(pr => pr.prerrequisitoCodigo === asignaturasMap[i].codigo)
        .map(asignatura => ({
            codigo: asignatura.asignaturaCodigo,
            nombre: asignatura.asignatura,
            semestre: asignatura.asignaturaSemestre,
        }));


      for(let j=0; j<asignaturasPosterioresMap.length; j++) {

        if (!sourceElement['children']) {
          sourceElement['children'] = [];
        }

        sourceElement['children'].push({
          name: asignaturasPosterioresMap[j].nombre,
          children: []
        });
      }

      resultado.push(sourceElement);
    }

    console.log('Resultado:', resultado);

    this.loadChart(resultado);
  }
  */


  loadAndConvertExternalData() {

    const asignaturasMap = this.responseListAsignaturas().content.map(asignatura => ({
      codigo: asignatura.codigo,
      nombre: asignatura.nombre,
      semestre: asignatura.semestre_asignatura,
    }));

    let data = construirArbol(asignaturasMap, this.responseListPrerrequisitos().content);

    this.loadChart(data);

    function construirArbol(
        asignaturas: AsignaturaDataGraph[],
        prerrequisitos: PrerrequisitoDataGraph[]
      ): NodoFlare {
      const mapaNodos: Map<number, NodoFlare> = new Map();
      const hijosSet: Set<number> = new Set();

      // Crear nodos individuales para cada asignatura
      asignaturas.forEach(asig => {
        mapaNodos.set(asig.codigo, { name: asig.nombre, children: [] });
      });

      // Crear relaciones padre-hijo a partir de los prerrequisitos
      prerrequisitos.forEach(pr => {
        const nodoPadre = mapaNodos.get(pr.prerrequisitoCodigo);
        const nodoHijo = mapaNodos.get(pr.asignaturaCodigo);
        if (nodoPadre && nodoHijo) {
          nodoPadre.children.push(nodoHijo);
          hijosSet.add(pr.asignaturaCodigo); // Marcar como no-raíz
        }
      });

      // Detectar nodos raíz (que nunca son asignatura destino)
      const nodosRaiz = asignaturas
        .filter(asig => !hijosSet.has(asig.codigo))
        .map(asig => mapaNodos.get(asig.codigo)!)
        .filter(nodo => nodo !== undefined);

      return {
        name: 'Asignaturas',
        children: nodosRaiz
      };
    }

  }


  loadChart(data: any): void {
    const chart = echarts.init(this.chartContainer.nativeElement);
    chart.showLoading();

    chart.hideLoading();

    /*
    data.children.forEach((datum: any, index: number) => {
      if (index % 2 === 0) datum.collapsed = true;
    });
    */

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
          roam: true, // ✅ Permite zoom y pan
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
  }


}
