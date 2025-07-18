import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, inject, signal, ViewChild } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { NgZone } from '@angular/core';
import { CampoFormacion } from '../../../models/campo-formacion.model';
import { AreaFormacion } from '../../../models/area-formacion.model';
import { Asignatura } from '../../../models/asignatura.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { AsignaturaService } from '../../../services/asignatura.service';
import { CampoFormacionService } from '../../../services/campo-formacion.service';
import { AreaFormacionService } from '../../../services/area-formacion.service';
import { ResponseListDTO } from '../../../dto/response-list.model';
import { NgStyle } from '@angular/common';
import { APP_CONSTANTS } from '../../../utils/app-constants';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalAsignaturasAsociadasComponent } from '../../../shared/components/modal-asignaturas-asociadas/modal-asignaturas-asociadas.component';


type EstructuraResultado = Record<string, any>;

@Component({
  selector: 'app-plan-estudios-circle-packing',
  imports: [NgxEchartsDirective, NavbarComponent, NgStyle],
  templateUrl: './plan-estudios-circle-packing.component.html',
  styleUrl: './plan-estudios-circle-packing.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanEstudiosCirclePackingComponent {

  @ViewChild('contextMenuRef', { static: false }) contextMenuRef!: ElementRef;

  private modalService = inject(NgbModal);
  private asignaturaService: AsignaturaService = inject(AsignaturaService);
  private campoFormacionService: CampoFormacionService = inject(CampoFormacionService);
  private areaFormacionService: AreaFormacionService = inject(AreaFormacionService);

  planEstudiosCirclePackingIsLoading = signal(false);

  chartInstance!: any;
  chartOption: any = {};
  currentSeriesData: any[] = [];
  displayRoot: any;

  responseListAsignaturas = signal<ResponseListDTO<Asignatura>>({
    recordCountPerPage: 0,
    totalRecordCount: 0,
    totalPages: 0,
    content: []
  });

  responseListCamposFormacion = signal<ResponseListDTO<CampoFormacion>>({
    recordCountPerPage: 0,
    totalRecordCount: 0,
    totalPages: 0,
    content: []
  });

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
  depth: number = 0;

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

  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) {}


  ngOnInit(): void {
    this.consultarCamposFormacion(1, 100, undefined, true);
  }


  private consultarCamposFormacion(page?: number, pageSize?: number, field?: string, asc?: boolean) {
    this.planEstudiosCirclePackingIsLoading.set(true);
    this.campoFormacionService.consultarCamposFormacion(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListCamposFormacion.set(res);
        this.consultarAreasFormacion(1, 100, undefined, true);
        this.planEstudiosCirclePackingIsLoading.set(false);
      },
      error: (e) => {
        this.planEstudiosCirclePackingIsLoading.set(false);
      }
    });
  }


  private consultarAreasFormacion(page?: number, pageSize?: number, field?: string, asc?: boolean) {
    this.planEstudiosCirclePackingIsLoading.set(true);
    this.areaFormacionService.consultarAreasFormacion(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListAreasFormacion.set(res);
        this.consultarAsignaturas(1, 100, 'codigo', true);
        this.planEstudiosCirclePackingIsLoading.set(false);
      },
      error: (e) => {
        this.planEstudiosCirclePackingIsLoading.set(false);
      }
    });
  }


  private consultarAsignaturas(page: number, pageSize: number, field: string, asc: boolean) {
    this.planEstudiosCirclePackingIsLoading.set(true);
    this.asignaturaService.consultarAsignaturas(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListAsignaturas.set(res);
        this.loadChart();
        this.planEstudiosCirclePackingIsLoading.set(false);
      },
      error: (e) => {
        this.planEstudiosCirclePackingIsLoading.set(false);
      }
    });
  }


  onChartInit(instance: any) {
    this.chartInstance = instance;
    this.clickEvents();
  }


  async loadD3() {
    if (!(window as any).d3) {
      const module = await import('d3-hierarchy');
      (window as any).d3 = module.default ?? module;
    }
  }


  loadChart(): void {
    if (
      this.responseListCamposFormacion()?.content.length > 0 &&
      this.responseListAreasFormacion()?.content.length > 0 &&
      this.responseListAsignaturas()?.content.length > 0
    ) {
      this.ngZone.runOutsideAngular(() => {
        setTimeout(async () => {
          const rawData = await this.loadAndConvertExternalData();
          await this.loadD3();
          const dataWrap = this.prepareData(rawData);
          this.currentSeriesData = dataWrap.seriesData;
          this.initChart(dataWrap.seriesData, dataWrap.maxDepth);
        }, 0);
      });
    }
  }


  loadAndConvertExternalData(): EstructuraResultado {
    const resultado: EstructuraResultado = {
      $count: this.responseListAsignaturas().content.length,
      color: '#B41E1E'
    };

    for (const campo of this.responseListCamposFormacion().content) {
      const campoNombre = campo.nombre;
      resultado[campoNombre] = { $count: campo.cantidadAreasFormacion, color: campo.colorHtml };

      const areasFiltradas = this.responseListAreasFormacion().content.filter(area => area.idCampoFormacion === campo.id);

      for (const area of areasFiltradas) {
        const areaNombre = area.nombre;
        resultado[campoNombre][areaNombre] = { $count: area.cantidadAsignaturas, color: area.colorHtml };

        const asignaturasFiltradas = this.responseListAsignaturas().content.filter(
          asig =>
            asig.campoFormacion === campoNombre &&
            asig.areaFormacion === areaNombre
        );

        for (const asig of asignaturasFiltradas) {
          resultado[campoNombre][areaNombre][asig.nombre] = {
            $count: 1,
            color: '#dbded1'
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
      seriesData.push({ id: basePath, value: source.$count, depth, index: seriesData.length, color: source.color || '#FFFFFF' });

      for (let key in source) {
        if ((source.hasOwnProperty(key) && !key.startsWith('$')) && key !== 'color') {
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

    this.displayRoot = this.buildHierarchy(seriesData);

    const renderItem = (params: any, api: any) => {

      const context = params.context;

      if (!context.layout) {
        context.layout = true;
        const pack = d3.pack().size([api.getWidth() - 2, api.getHeight() - 2]).padding(3);
        context.nodes = {};
        pack(this.displayRoot);
        this.displayRoot.descendants().forEach((node: any) => {
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
            fontSize: node.r / 5,
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
        //backgroundColor: '#b6cfe3',
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
    });
  }


  private buildHierarchy(seriesData: any[]) {
    const d3 = (window as any).d3;
    return d3.stratify()
      .parentId((d: any) => d.id.substring(0, d.id.lastIndexOf('.')))
      (seriesData)
      .sum((d: any) => d.value || 0)
      .sort((a: any, b: any) => b.value - a.value);
  }


  clickEvents() {
    // Realiza zoom con click izquierdo
    this.chartInstance.on('click', { seriesIndex: 0 }, (params: any) => {
      this.drillDown(params.data.id);
    });

    // Realiza zoom con click izquierdo
    this.chartInstance.getZr().on('click', (event: any) => {
      if (!event.target) this.drillDown(null);
    });

    // Abre menú contextual click derecho
    this.chartInstance.on('contextmenu', (params: any) => {
      this.depth = params.data.depth;
      let nombreComponente = params.data.id.split('.').pop();

      this.menuX = params.event.offsetX;
      this.menuY = params.event.offsetY; // Podrías mejorar esto con lógica para detectar el nodo exacto

      switch(this.depth){
        case 1: // Campos de formación
          this.clickedData = this.responseListCamposFormacion().content.find(cf => cf.nombre == nombreComponente);
          break;
        case 2: // Áreas de formación
          this.clickedData = this.responseListAreasFormacion().content.find(af => af.nombre == nombreComponente);
          break;
        case 3: // Asignaturas
          this.clickedData = this.responseListAsignaturas().content.find(a => a.nombre == nombreComponente);
          break;
        default:
          this.clickedData = null;
      }
    });
  }


  private drillDown(targetNodeId: string | null) {
    if (targetNodeId) {
      this.displayRoot = this.displayRoot.descendants().find((node: any) => node.data.id === targetNodeId);
      if (this.displayRoot) this.displayRoot.parent = null;
    }
    else {
      this.displayRoot = this.buildHierarchy(this.currentSeriesData);
    }

    if (this.chartOption && this.chartOption.series) {
      this.chartOption.series.context = null;
    }

    this.chartOption = { ...this.chartOption, dataset: { source: this.currentSeriesData } };
    setTimeout(() => this.chartInstance.resize(), 0);
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
    event.preventDefault(); // Evita menú del navegador si no se hace en un nodo
    if(this.menuX !== 0 && this.menuY !== 0 && this.clickedData != null) {
      this.menuVisible = true;
    }
  }


  onOptionSelected(action: string) {
    if (!this.clickedData) return;

    this.contextualMenuAction = action;

    // VALIDAR CUANDO EL NODO ES DE CAMPO O ÁREA DE FORMACIÓN

    if(this.depth == 1){
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
        default:
      }
    }
    else if(this.depth == 2){
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
        default:
      }
    }
    else if(this.depth == 3) {
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
          this.irASyllabyus(); // externo
          break;
        case this.contextualMenuOptions.irObjetosEstudio:
          this.irAObjetosEstudio(); // externo
          break;
        case this.contextualMenuOptions.irVerbos:
          this.irAVerbos(); // externo
          break;
        default:
      }
    }

    this.menuVisible = false;
  }


  irASyllabyus() {
    window.open(`https://sistematizaciondedatos.com/wp-content/Modul_056_ImprimirSyllabus_07/public/mostrar3.php?codigo_asignatura=${this.clickedData.codigo}`, '_blank');
  }


  irAObjetosEstudio() {
    window.open(`https://sistematizaciondedatos.com/wp-content/verbos/visualizar_datos.php?asignatura=${this.clickedData.codigo}`, '_blank');
  }


  irAVerbos() {
    window.open(`https://sistematizaciondedatos.com/wp-content/verbos/results.php?asignatura=${this.clickedData.nombre}`, '_blank');
  }


  saveImage(): void {
    const base64 = this.chartInstance.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff'
    });

    const link = document.createElement('a');
    link.href = base64;
    link.download = 'grafico-asignaturas.png';
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

  showSwalCampoFormacionDetalles() {
    const a = this.clickedData;

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
      title: a.nombre,
      html: html
    });
  }


  showSwalAreaFormacionDetalles() {
    const a = this.clickedData;

    let html = `
      <div style="max-height: 300px; overflow-y: auto;">
        <table class="table table-bordered text-start">

          <tr><th>Id</th><td>${a.id}</td></tr>

          <tr><th>Id Campo de Formación</th><td>${a.idCampoFormacion}</td></tr>

          <tr><th>Color</th><td> <span style="display: inline-block; width: 15px; height: 15px; background-color: ${a.colorHtml}; border: 1px solid #000;"></span></td></tr>

          <tr><th>Cantidad de asignaturas</th><td>${a.cantidadAsignaturas}</td></tr>

        </table>
      </div>
      `;

    Swal.fire({
      title: a.nombre,
      html: html
    });
  }


  showSwalAsignaturaDetalles() {
    const a = this.clickedData;

    Swal.fire({
      title: this.clickedData.nombre,
      width: '800px',
      html: `
        <div style="max-height: 300px; overflow-y: auto; overflow-x: auto;">
          <table class="table table-bordered text-start">

            <tr><th>Código</th><td>${a.codigo}</td></tr>
            <tr><th>Carrera</th><td>${a.carrera}</td></tr>
            <tr><th>Semestre</th><td>${a.semestreAsignatura}</td></tr>
            <tr><th>Créditos</th><td>${a.numeroCreditos}</td></tr>
            <tr><th>Código de Cóndor</th><td>${a.codigoCondor}</td></tr>

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
                <button type="button" id="btnJustificacion" class="btn btn-primary">
                  <span class="bi bi-card-text"></span>
                </button>
              </td>
            </tr>

            <tr>
              <th>Asignaturas Asociadas</th>
              <td>
                <button type="button" id="btnAsignaturasAsociadas" class="btn btn-primary">
                  <span class="bi bi-diagram-3-fill"></span>
                </button>
              </td>
            </tr>

            <tr><th>Tipo</th><td>${a.Tipo}</td></tr>
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
    const a =  this.clickedData;

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
    const asignatura = this.clickedData;

    const modalRef = this.modalService.open(ModalAsignaturasAsociadasComponent, {
      size: 'xl',
      scrollable: true
    });

    modalRef.componentInstance.asignatura = asignatura;
  }


}
