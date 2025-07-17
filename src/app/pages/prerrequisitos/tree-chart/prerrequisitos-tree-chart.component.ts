import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, signal, ViewChild } from '@angular/core';
import * as echarts from 'echarts';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { AsignaturaService } from '../../../services/asignatura.service';
import { PrerrequisitoService } from '../../../services/prerrequisito.service';
import { ResponseListDTO } from '../../../dto/response-list.model';
import { Asignatura } from '../../../models/asignatura.model';
import { Prerrequisito } from '../../../models/prerrequisito.model';
import Swal from 'sweetalert2';
import { APP_CONSTANTS } from '../../../utils/app-constants';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalAsignaturasAsociadasComponent } from '../../../shared/components/modal-asignaturas-asociadas/modal-asignaturas-asociadas.component';


export interface PrerrequisitoDataGraph {
  id: number;
  prerrequisitoCodigo: number;
  prerrequisito: string;
  asignaturaCodigo: number;
  asignatura: string;
}

export interface NodoFlare {
  name: string;
  subject?: Asignatura | null;
  children: NodoFlare[];
}


@Component({
  selector: 'app-prerrequisitos-tree-chart',
  imports: [NavbarComponent, NgbModalModule],
  templateUrl: './prerrequisitos-tree-chart.component.html',
  styleUrl: './prerrequisitos-tree-chart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrerrequisitosTreeChartComponent {

  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  @ViewChild('contextMenuRef', { static: false }) contextMenuRef!: ElementRef;

  private modalService = inject(NgbModal);
  private asignaturaService: AsignaturaService = inject(AsignaturaService);
  private prerrequisitoService: PrerrequisitoService = inject(PrerrequisitoService);

  asignaturasTreeChartIsLoading = signal(false);

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

  chartInstance!: echarts.ECharts;

  menuVisible = false;
  menuX = 0;
  menuY = 0;
  clickedData: any = null;

  contextualMenuOptions = {
    verDetalles: '🔍 Ver detalles',
    verJustificacion: 'Ver justificación',
    verAsignaturasAsociadas: 'Ver asignaturas asociadas',
    guardarImage: '💾 Guardar imagen',
    copiarImagen: '📋 Copiar imagen',
    irSyllabus: '🔗 Ir al syllabus',
    irObjetosEstudio: '🔗 Ir a objetos de estudio',
    irVerbos: '🔗 Ir a verbos de estudio',
  }

  contextualMenuAction = '';


  ngOnInit() {
    this.consultarAsignaturas(1, 200, 'semestreAsignatura', true);
  }


  private consultarAsignaturas(page: number, pageSize: number, field: string, asc: boolean) {
    this.asignaturasTreeChartIsLoading.set(true);
    this.asignaturaService.consultarAsignaturas(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListAsignaturas.set(res);
        this.consultarPrerrequisitosPorPagnacion(1, 200, 'id', true);
        this.asignaturasTreeChartIsLoading.set(false);
      },
      error: (e) => {
        this.asignaturasTreeChartIsLoading.set(false);
      }
    });
  }


   private consultarPrerrequisitosPorPagnacion(page: number, pageSize: number, field: string, asc: boolean) {
    this.asignaturasTreeChartIsLoading.set(true);
    this.prerrequisitoService.consultarPrerrequisitos(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListPrerrequisitos.set(res);
        this.loadAndConvertExternalData();
        this.asignaturasTreeChartIsLoading.set(false);
      },
      error: (e) => {
        this.asignaturasTreeChartIsLoading.set(false);
      }
    });
  }


  loadAndConvertExternalData() {
    let data = buildTree(this.responseListAsignaturas().content, this.responseListPrerrequisitos().content);

    this.loadChart(data);

    function buildTree(
        asignaturas: Asignatura[],
        prerrequisitos: PrerrequisitoDataGraph[]
      ): NodoFlare {
      const mapaNodos: Map<number, NodoFlare> = new Map();
      const hijosSet: Set<number> = new Set();

      // Crear nodos individuales para cada asignatura
      asignaturas.forEach(asig => {
        mapaNodos.set(asig.codigo, { name: asig.nombre, subject: asig, children: [] });
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
    this.chartInstance = echarts.init(this.chartContainer.nativeElement);
    this.chartInstance.showLoading();

    this.chartInstance.hideLoading();

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
            fontSize: 11
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

    this.chartInstance.setOption(option);

    this.clickEvents();
  }


  saveImage(): void {
    const base64 = this.chartInstance.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff'
    });

    const link = document.createElement('a');
    link.href = base64;
    link.download = 'grafico-prerrequisitos.png';
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


  // Ocultar el menú contextual cuando se da click por fuera.
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (this.menuVisible && this.contextMenuRef && !this.contextMenuRef.nativeElement.contains(event.target)) {
      this.menuVisible = false;
      this.clickedData = null;
    }
  }


  clickEvents() {
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


  onGlobalContextMenu(event: MouseEvent) {
    //event.preventDefault(); // Evita menú del navegador si no se hace en un nodo
    if(this.menuX !== 0 && this.menuY !== 0 && this.clickedData != null) {
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
      case this.contextualMenuOptions.verAsignaturasAsociadas:
        this.abrirModalAsignaturasAsociadas();
        break;
      case this.contextualMenuOptions.guardarImage:
        this.saveImage();
        break;
      case this.contextualMenuOptions.copiarImagen:
        this.copyImage();
        break;
      case this.contextualMenuOptions.irSyllabus:
        window.open(`https://sistematizaciondedatos.com/wp-content/Modul_056_ImprimirSyllabus_07/public/mostrar3.php?codigo_asignatura=${this.clickedData.subject.codigo}`, '_blank'); // externo
        break;
      case this.contextualMenuOptions.irObjetosEstudio:
        window.open(`https://sistematizaciondedatos.com/wp-content/verbos/visualizar_datos.php?asignatura=${this.clickedData.subject.codigo}`, '_blank'); // externo
        break;
      case this.contextualMenuOptions.irVerbos:
        window.open(`https://sistematizaciondedatos.com/wp-content/verbos/results.php?asignatura=${this.clickedData.subject.codigo}`, '_blank'); // externo
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
            <tr><th>Semestre</th><td>${a.semestreAsignatura}</td></tr>

            <tr>
              <th>Campo de Formación</th>
              <td>
                Ver las áreas de formación asociadas:
                <a href="${APP_CONSTANTS.ROUTES.areasFormacionBubbleChart}?nombreCampoFormacion=${encodeURIComponent(a.campoFormacion)}">
                  ${a.campoFormacion}
                </a>
              </td>
            </tr>

            <tr>
              <th>Área de Formación</th>
              <td>
                Ver las asignaturas asociadas:
                <a href="${APP_CONSTANTS.ROUTES.asignaturasBubbleChart}?nombreAreaFormacion=${encodeURIComponent(a.areaFormacion)}">
                  ${a.areaFormacion}
                </a>
              </td>
            </tr>

            <tr>
              <th>Ver syllabus</th>
              <td>
                <a href="https://sistematizaciondedatos.com/wp-content/Modul_056_ImprimirSyllabus_07/public/mostrar3.php?codigo_asignatura=${a.codigo}" target="_blank">
                  https://sistematizaciondedatos.com/wp-content/Modul_056_ImprimirSyllabus_07/public/mostrar3.php?codigo_asignatura=${a.codigo}
                </a>
              </td>
            </tr>

            <tr>
              <th>Ver objetos de estudio</th>
              <td>
                <a href="https://sistematizaciondedatos.com/wp-content/verbos/visualizar_datos.php?asignatura=${a.codigo}" target="_blank">
                  https://sistematizaciondedatos.com/wp-content/verbos/visualizar_datos.php?asignatura=${a.codigo}
                </a>
              </td>
            </tr>

            <tr>
              <th>Ver verbos</th>
              <td>
                <a href="https://sistematizaciondedatos.com/wp-content/verbos/results.php?asignatura=${a.nombre}" target="_blank">
                  https://sistematizaciondedatos.com/wp-content/verbos/results.php?asignatura=${a.nombre}
                </a>
              </td>
            </tr>

            <tr>
              <th>Justificación</th>
              <td>
                <button type="button" id="btnJustificacion" class="btn btn-primary">Ver</button>
              </td>
            </tr>

            <tr>
              <th>Asignaturas Asociadas</th>
              <td>
                <button type="button" id="btnAsignaturasAsociadas" class="btn btn-primary">Ver</button>
              </td>
            </tr>

            <tr><th>Tipo</th><td>${a.Tipo}</td></tr>
            <tr><th>Número de Créditos</th><td>${a.numeroCreditos}</td></tr>
            <tr><th>HTD</th><td>${a.HTD}</td></tr>
            <tr><th>HTC</th><td>${a.HTC}</td></tr>
            <tr><th>HTA</th><td>${a.HTA}</td></tr>
          </table>
        </div>
      `,
      didOpen: () => {
        const btnJust = document.getElementById('btnJustificacion');
        const btnAsociadas = document.getElementById('btnAsignaturasAsociadas');

        if (btnJust) {
          btnJust.addEventListener('click', () => {
            this.showSwalAsignaturaJustificacion();
          });
        }

        if (btnAsociadas) {
          btnAsociadas.addEventListener('click', () => {
            this.abrirModalAsignaturasAsociadas();
            Swal.close();
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


  abrirModalAsignaturasAsociadas() {
    const a = this.clickedData.subject;

    const modalRef = this.modalService.open(ModalAsignaturasAsociadasComponent, {
      size: 'xl',
      scrollable: true
    });

    modalRef.componentInstance.asignatura = a;
  }

}
