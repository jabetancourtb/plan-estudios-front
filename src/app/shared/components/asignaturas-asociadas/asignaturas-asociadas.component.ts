import { ChangeDetectionStrategy, Component, ElementRef, inject, input, signal, SimpleChanges, ViewChild } from '@angular/core';
import { CampoFormacionService } from '../../../services/campo-formacion.service';
import { AreaFormacionService } from '../../../services/area-formacion.service';
import { AsignaturaService } from '../../../services/asignatura.service';
import { PrerrequisitoService } from '../../../services/prerrequisito.service';
import { ResponseListDTO } from '../../../dto/response-list.model';
import { CampoFormacion } from '../../../models/campo-formacion.model';
import { AreaFormacion } from '../../../models/area-formacion.model';
import { Asignatura } from '../../../models/asignatura.model';
import { Prerrequisito } from '../../../models/prerrequisito.model';
import * as go from 'gojs';
import Swal from 'sweetalert2';
import { APP_CONSTANTS } from '../../../utils/app-constants';
import { environment } from '../../../../environments/environment';
go.Diagram.licenseKey = environment.GoJsLicenseKey;


@Component({
  selector: 'app-asignaturas-asociadas',
  imports: [],
  templateUrl: './asignaturas-asociadas.component.html',
  styleUrl: './asignaturas-asociadas.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsignaturasAsociadasComponent {

  @ViewChild('myDiagramDiv', { static: true }) public myDiagramComponent!: ElementRef;

  private campoFormacionService: CampoFormacionService = inject(CampoFormacionService);
  private areaFormacionService: AreaFormacionService = inject(AreaFormacionService);
  private asignaturaService: AsignaturaService = inject(AsignaturaService);
  private prerrequisitoService: PrerrequisitoService = inject(PrerrequisitoService);

  asignaturasAsociadasGraphIsLoading = signal(false);

  asignatura = input.required<Asignatura>();
  simplificarDiagrama = input.required<boolean>();

  diagram!: go.Diagram;

  public stateData = {
    diagramNodeData: [] as {
      key: number;
      header?: string;
      text?: string;
      footer?: string;
      isGroup?: boolean;
      group?: number;
    }[],
    diagramLinkData: [] as {
      key: number;
      from: number;
      to: number;
      color: string;
    }[],
  };

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


  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if(this.asignatura()){
      this.consultarCamposFormacion();
    }
  }


  public consultarCamposFormacion() {
    this.asignaturasAsociadasGraphIsLoading.set(true);
    this.campoFormacionService.consultarCamposFormacion(1, 100, 'id', true).subscribe({
      next: (res) => {
        this.responseListCamposFormacion.set(res);
        this.consultarAreasFormacion();
        this.asignaturasAsociadasGraphIsLoading.set(false);
      },
      error: (e) => {
        this.asignaturasAsociadasGraphIsLoading.set(false);
      }
    });
  }


  private consultarAreasFormacion() {
    this.asignaturasAsociadasGraphIsLoading.set(true);
    this.areaFormacionService.consultarAreasFormacion(1, 100, 'id', true).subscribe({
      next: (res) => {
        this.responseListAreasFormacion.set(res);
        this.consultarAsignaturasPorPaginacion(1, 100, 'codigo', true);
        this.asignaturasAsociadasGraphIsLoading.set(false);
      },
      error: (e) => {
        this.asignaturasAsociadasGraphIsLoading.set(false);
      }
    });
  }


  private consultarAsignaturasPorPaginacion(page: number, pageSize: number, field: string, asc: boolean) {
    this.asignaturasAsociadasGraphIsLoading.set(true);
    this.asignaturaService.consultarAsignaturas(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListAsignaturas.set(res);
        this.consultarPrerrequisitosPorPaginacion(1, 200, 'id', true);
        this.asignaturasAsociadasGraphIsLoading.set(false);
      },
      error: (e) => {
        this.asignaturasAsociadasGraphIsLoading.set(false);
      }
    });
  }


  private consultarPrerrequisitosPorPaginacion(page: number, pageSize: number, field: string, asc: boolean) {
    this.asignaturasAsociadasGraphIsLoading.set(true);
    this.prerrequisitoService.consultarPrerrequisitos(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListPrerrequisitos.set(res);
        this.loadAndConvertExternalData();
        this.asignaturasAsociadasGraphIsLoading.set(false);
      },
      error: (e) => {
        this.asignaturasAsociadasGraphIsLoading.set(false);
      }
    });
  }


  public loadAndConvertExternalData() {
    this.cleanDataGraph();
    this.fillNodeDataGrupos();
    this.fillNodeDataAsignatura();
    let keyCounter = this.fillNodeDataAsignaturasAnteriores();
    this.fillNodeDataAsignaturasPosteriores(keyCounter);
    this.initDiagram();
  }


  cleanDataGraph() {
    if (this.diagram) {
      this.diagram.model = new go.GraphLinksModel();

      this.diagram.div = null;

      this.stateData = {
        diagramNodeData: [] as {
          key: number;
          header?: string;
          text?: string;
          footer?: string;
          isGroup?: boolean;
          group?: number;
        }[],
        diagramLinkData: [] as {
          key: number;
          from: number;
          to: number;
          color: string;
        }[],
      };

    }
    else {
      console.warn('El diagrama no está inicializado aún');
    }
  }


  public fillNodeDataGrupos() {
    let keyExampleCounter = 1000;

    let prerrequisitos = this.responseListPrerrequisitos().content;

    let prerrequisitosAsignatura = prerrequisitos.filter(p => p.asignaturaCodigo == this.asignatura().codigo);

    if(prerrequisitosAsignatura.length > 0) {
        let dataGroupPrerrequisitos = {
        key: keyExampleCounter,
        header: 'Asignaturas prerrequisitos',
        isGroup: true,
        footer: 'Asignaturas prerrequisitos',
        color: '#f2f5df'
      }
      this.stateData.diagramNodeData.push(dataGroupPrerrequisitos);
    }

    let asignaturasPosteriores = prerrequisitos.filter(p => p.prerrequisitoCodigo == this.asignatura().codigo);

    if(asignaturasPosteriores.length > 0) {
      let dataGroupPosteriores = {
        key: keyExampleCounter+1,
        header: 'Asignaturas posteriores',
        isGroup: true,
        footer: 'Asignaturas posteriores',
        color: '#f2f5df'
      }
      this.stateData.diagramNodeData.push(dataGroupPosteriores);
    }

  }


  public fillNodeDataAsignatura() {
    let colorCampoFormacion = this.responseListCamposFormacion().content.find(a => a.nombre == this.asignatura().campoFormacion)?.colorHtml;
    let colorAreaFormacion = this.responseListAreasFormacion().content.find(a => a.nombre == this.asignatura().areaFormacion)?.colorHtml;
    let colorBody = 'white';

    let data = {
      key: this.asignatura().codigo,
      header: this.asignatura().campoFormacion,
      codigoCondor: 'Código cóndor: '+this.asignatura().codigoCondor,
      text: this.asignatura().nombre,
      creditos: 'Créditos: '+this.asignatura().numeroCreditos,
      footer: this.asignatura().areaFormacion,
      colorCampoFormacion: colorCampoFormacion,
      colorAreaFormacion: colorAreaFormacion,
      colorBody: colorBody,
    }
    this.stateData.diagramNodeData.push(data);

  }


  public fillNodeDataAsignaturasAnteriores() {
    let keyCounter = 1;

    let camposFormacion = this.responseListCamposFormacion().content;
    let areasFormacion = this.responseListAreasFormacion().content;
    let asignaturas = this.responseListAsignaturas().content;
    let prerrequisitos = this.responseListPrerrequisitos().content;
    let stateData = this.stateData;
    let simplificarDiagrama = this.simplificarDiagrama;

    buscarAsignaturasAnteriores(this.asignatura());

    function buscarAsignaturasAnteriores(asignaturaFunc: Asignatura) {

      let asignaturasAnteriores = prerrequisitos.filter(p => p.asignaturaCodigo == asignaturaFunc.codigo);

      for(let prerrequisito of asignaturasAnteriores) {

        let asignaturaAnterior = asignaturas.find(a => a.codigo == prerrequisito.prerrequisitoCodigo)!;

        let colorCampoFormacion = camposFormacion.find(a => a.nombre == asignaturaAnterior.campoFormacion)?.colorHtml;
        let colorAreaFormacion = areasFormacion.find(a => a.nombre == asignaturaAnterior.areaFormacion)?.colorHtml;
        let colorBody = 'white';

        if(!stateData.diagramNodeData.find(n => n.key == asignaturaAnterior.codigo)) {
           let data = {
            key: asignaturaAnterior.codigo,
            header: asignaturaAnterior.campoFormacion,
            codigoCondor: 'Código cóndor: '+asignaturaAnterior.codigoCondor,
            text: asignaturaAnterior.nombre,
            creditos: 'Créditos: '+asignaturaAnterior.numeroCreditos,
            footer: asignaturaAnterior.areaFormacion,
            group: stateData.diagramNodeData.find(dn => dn.header == 'Asignaturas prerrequisitos')?.key,
            colorCampoFormacion: colorCampoFormacion,
            colorAreaFormacion: colorAreaFormacion,
            colorBody: colorBody,
          }
          stateData.diagramNodeData.push(data);
        }

        if(!stateData.diagramLinkData.find(l => l.from == prerrequisito.prerrequisitoCodigo && l.to == asignaturaFunc.codigo)) {
          stateData.diagramLinkData.push({
            key: -keyCounter,
            from: prerrequisito.prerrequisitoCodigo,
            to: asignaturaFunc.codigo,
            color: '#ff3c00ff'
          });
        }

        keyCounter += 1;

        if(!simplificarDiagrama()) {
          buscarAsignaturasAnteriores(asignaturaAnterior);
        }
      }

    }

    return keyCounter;

  }


  public fillNodeDataAsignaturasPosteriores(keyCounter: number) {

    let camposFormacion = this.responseListCamposFormacion().content;
    let areasFormacion = this.responseListAreasFormacion().content;
    let asignaturas = this.responseListAsignaturas().content;
    let prerrequisitos = this.responseListPrerrequisitos().content;
    let stateData = this.stateData;
    let simplificarDiagrama = this.simplificarDiagrama;

    buscarAsignaturasPosteriores(this.asignatura());

    function buscarAsignaturasPosteriores(asignaturaFunc: Asignatura) {

      let asignaturasPosteriores = prerrequisitos.filter(p => p.prerrequisitoCodigo == asignaturaFunc.codigo);

      for(let ap of asignaturasPosteriores) {

        let asignaturaPosterior = asignaturas.find(a => a.codigo == ap.asignaturaCodigo)!;

        let colorCampoFormacion = camposFormacion.find(a => a.nombre == asignaturaPosterior.campoFormacion)?.colorHtml;
        let colorAreaFormacion = areasFormacion.find(a => a.nombre == asignaturaPosterior.areaFormacion)?.colorHtml;
        let colorBody = 'white';

        if(!stateData.diagramNodeData.find(n => n.key == asignaturaPosterior.codigo)) {
          let data = {
            key: asignaturaPosterior.codigo,
            header: asignaturaPosterior.campoFormacion,
            codigoCondor: 'Código cóndor: '+asignaturaPosterior.codigoCondor,
            text: asignaturaPosterior.nombre,
            creditos: 'Créditos: '+asignaturaPosterior.numeroCreditos,
            footer: asignaturaPosterior.areaFormacion,
            group: stateData.diagramNodeData.find(dn => dn.header == 'Asignaturas posteriores')?.key,
            colorCampoFormacion: colorCampoFormacion,
            colorAreaFormacion: colorAreaFormacion,
            colorBody: colorBody,
          }
          stateData.diagramNodeData.push(data);
        }

        if(!stateData.diagramLinkData.find(l => l.from == asignaturaFunc.codigo && l.to == asignaturaPosterior.codigo)) {
          stateData.diagramLinkData.push({
            key: -keyCounter,
            from: asignaturaFunc.codigo,
            to: asignaturaPosterior.codigo,
            color: '#ff3c00ff'
          });
        }

        keyCounter += 1;

        if(!simplificarDiagrama()) {
          buscarAsignaturasPosteriores(asignaturaPosterior);
        }
      }

    }
  }


  public initDiagram(): go.Diagram {
    const $ = go.GraphObject.make;

    this.diagram = $(go.Diagram, this.myDiagramComponent.nativeElement, {
      layout: $(go.TreeLayout, {
        setsPortSpot: false,
        setsChildPortSpot: false,
        isRealtime: false
      }),
      'undoManager.isEnabled': true
    });

      this.diagram.groupTemplate = $(
      go.Group, 'Vertical',
      {
        layout: $(go.TreeLayout, {
          setsPortSpot: false,
          setsChildPortSpot: false
        }),
        defaultStretch: go.GraphObject.Horizontal,
        fromSpot: go.Spot.RightSide,
        toSpot: go.Spot.LeftSide
      },
      $(go.Panel, 'Auto',
        $(go.Shape, 'RoundedRectangle', { fill: 'white', parameter2: 1 | 2 })
          .bind('fill', 'role', r => r[0] === 't' ? 'lightgray' : 'white'),
        $(go.TextBlock, { margin: new go.Margin(2, 2, 0, 2), textAlign: 'center' })
          .bind('text', 'header')
      ),
      $(go.Panel, 'Auto',
        $(go.Shape, { fill: 'white' })
          .bind('fill', 'color'),
        $(go.Placeholder, { padding: 20 })
      ),
      $(go.Panel, 'Auto',
        $(go.Shape, 'RoundedRectangle', { fill: 'white', parameter2: 4 | 8 })
          .bind('fill', 'role', r => r[0] === 'b' ? 'lightgray' : 'white'),
        $(go.TextBlock, { margin: new go.Margin(2, 2, 0, 2), textAlign: 'center' })
          .bind('text', 'footer')
      )
    );

    const contextMenu = this.buildContextMenu($);

    this.diagram.nodeTemplate = $(
      go.Node, 'Vertical',
      { defaultStretch: go.GraphObject.Horizontal, fromSpot: go.Spot.RightSide, toSpot: go.Spot.LeftSide, contextMenu: contextMenu },
      /*
      $(go.Panel, 'Auto',
        $(go.Shape, 'RoundedTopRectangle')
          .bind('fill', 'colorCampoFormacion'), // Aquí usas el color definido por nodo
        $(go.TextBlock, { margin: new go.Margin(2, 2, 0, 2), textAlign: 'center' })
          .bind('text', 'header')
      ),
      */
      $(go.Panel, 'Auto',
        $(go.Shape, 'RoundedTopRectangle')
          .bind('fill', 'colorCampoFormacion'),
        $(go.TextBlock, { margin: new go.Margin(2, 2, 0, 2), textAlign: 'center' })
          .bind('text', 'codigoCondor')
      ),
      $(go.Panel, 'Auto', { minSize: new go.Size(NaN, 70) },
        $(go.Shape, 'Rectangle')
          .bind('fill', 'colorBody'), // También se puede usar aquí
        $(go.TextBlock, { width: 120, margin: new go.Margin(2, 2, 0, 2), textAlign: 'center' })
          .bind('text')
      ),
      $(go.Panel, 'Auto',
        $(go.Shape, 'RoundedBottomRectangle')
          .bind('fill', 'colorAreaFormacion'),
        $(go.TextBlock, { margin: new go.Margin(2, 2, 0, 2), textAlign: 'center' })
          .bind('text', 'creditos')
      ),
      /*
      $(go.Panel, 'Auto',
        $(go.Shape, 'RoundedBottomRectangle')
          .bind('fill', 'colorAreaFormacion'), // O aquí también
        $(go.TextBlock, { margin: new go.Margin(2, 2, 0, 2), textAlign: 'center' })
          .bind('text', 'footer')
      )
      */
    );

    this.diagram.linkTemplate = $(
      go.Link,
      { routing: go.Routing.Orthogonal, corner: 5 },
      $(go.Shape)  // Línea principal
        .bind('stroke', 'color')  // <- Asigna color
        .bind('strokeWidth', 'width', w => w || 2), // opcional

      $(go.Shape, { toArrow: 'Triangle' }) // Flecha
        .bind('fill', 'color')             // <- Color de la flecha
        .bind('stroke', 'color')           // <- Borde de la flecha
    );

    const model = new go.GraphLinksModel(this.stateData.diagramNodeData, this.stateData.diagramLinkData);
    model.linkKeyProperty = 'key';
    this.diagram.model = model;

    this.clickListener();

    return this.diagram;
  }


  private buildContextMenu($: any): go.Adornment {
    return $(
      'ContextMenu',
      $('ContextMenuButton',
        $(go.TextBlock, '🔍 Ver detalles'),
        { click: (e: any, obj: any) => this.consultarlAsignaturaDetalle(obj)}
      ),
      $('ContextMenuButton',
        $(go.TextBlock, 'Ver justificación'),
        { click: (e: any, obj: any) => this.consultarlAsignaturaJustificacion(obj)}
      ),
      $('ContextMenuButton',
        $(go.TextBlock, '🔗 Ir a syllabus'),
        { click: (e: any, obj: any) => this.irASyllabyus(obj)}
      ),
      $('ContextMenuButton',
        $(go.TextBlock, '🔗 Ir a objetos de estudio'),
        { click: (e: any, obj: any) => this.irAObjetosEstudio(obj)}
      ),
        $('ContextMenuButton',
        $(go.TextBlock, '🔗 Ir a verbos de estudio'),
        { click: (e: any, obj: any) => this.irAVerbos(obj)}
      ),
      $('ContextMenuButton',
        $(go.TextBlock, '💾 Guardar imagen'),
        { click: (e: any, obj: any) => this.saveImage()}
      )
    );
  }


  async consultarlAsignaturaDetalle(obj: any) {
      const node = obj.part?.adornedPart as go.Node;
      if (!node) return;

      const data = node.data;
      const id = data.key;
      const nombre = data.text;

      if(this.isExampleNode(id)) {
        return;
      }

      let asignatura = this.responseListAsignaturas().content.find(a => a.codigo == id)!;

      this.showSwalAsignaturaDetalle(asignatura);
    }


    async consultarlAsignaturaJustificacion(obj: any) {
      const node = obj.part?.adornedPart as go.Node;
      if (!node) return;

      const data = node.data;
      const id = data.key;
      const nombre = data.text;

      if(this.isExampleNode(id)) {
        return;
      }

      let asignatura = this.responseListAsignaturas().content.find(a => a.codigo == id)!;

      this.showSwalAsignaturaJustificacion(asignatura);
    }


  showSwalAsignaturaDetalle(asignatura: Asignatura) {
    Swal.fire({
      title: asignatura.nombre,
      width: '800px',
      html: `
        <div style="max-height: 300px; overflow-y: auto; overflow-x: auto;">
          <table class="table table-bordered text-start">

            <tr><th>Código</th><td>${asignatura.codigo}</td></tr>
            <tr><th>Carrera</th><td>${asignatura.carrera}</td></tr>
            <tr><th>Semestre</th><td>${asignatura.semestreAsignatura}</td></tr>
            <tr><th>Créditos</th><td>${asignatura.numeroCreditos}</td></tr>
            <tr><th>Código de Cóndor</th><td>${asignatura.codigoCondor}</td></tr>

            <tr>
              <th>Campo de Formación</th>
              <td>
                Ver las áreas de formación asociadas:
                <a href="${APP_CONSTANTS.ROUTES.camposFormacionLista}?searchTerm=${encodeURIComponent(asignatura.campoFormacion)}">
                  ${asignatura.campoFormacion}
                </a>

                 <span style = "
                    display: inline-block;
                    width: 0;
                    height: 0;
                    border-top: 15px solid transparent;
                    border-bottom: 15px solid transparent;
                    border-left: 20px solid  ${this.responseListCamposFormacion().content.find(cf => cf.nombre == asignatura.campoFormacion)?.colorHtml};">
                </span>

              </td>
            </tr>


            <tr>
              <th>Área de Formación</th>
              <td>
                Ver las asignaturas asociadas:
                <a href="${APP_CONSTANTS.ROUTES.areasFormacionLista}?pageSize=50&searchTerm=${encodeURIComponent(asignatura.areaFormacion)}">
                  ${asignatura.areaFormacion}
                </a>

                 <span style = "
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 2px solid #000;
                    background-color: ${this.responseListAreasFormacion().content.find(cf => cf.nombre == asignatura.areaFormacion)?.colorHtml};">
                </span>

              </td>
            </tr>


            <tr>
              <th>Ver syllabus</th>
              <td>
                <a href="${APP_CONSTANTS.ASIGNATURAS_URLS.syllabus}${asignatura.codigo}" target="_blank">
                  ${APP_CONSTANTS.ASIGNATURAS_URLS.syllabus}${asignatura.codigo}
                </a>
              </td>
            </tr>

            <tr>
              <th>Ver objetos de estudio</th>
              <td>
                <a href="${APP_CONSTANTS.ASIGNATURAS_URLS.objetosEstudios}${asignatura.codigo}" target="_blank">
                  ${APP_CONSTANTS.ASIGNATURAS_URLS.objetosEstudios}${asignatura.codigo}
                </a>
              </td>
            </tr>

            <tr>
              <th>Ver verbos</th>
              <td>
                <a href="${APP_CONSTANTS.ASIGNATURAS_URLS.verbos}${asignatura.nombre}" target="_blank">
                  ${APP_CONSTANTS.ASIGNATURAS_URLS.verbos}${asignatura.nombre}
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

            <tr><th>Tipo</th><td>${asignatura.Tipo}</td></tr>
            <tr><th>HTD</th><td>${asignatura.HTD}</td></tr>
            <tr><th>HTC</th><td>${asignatura.HTC}</td></tr>
            <tr><th>HTA</th><td>${asignatura.HTA}</td></tr>
          </table>
        </div>
      `,
      didOpen: () => {
        const btn = document.getElementById('btnJustificacion');
        if (btn) {
          btn.addEventListener('click', () => {
            this.showSwalAsignaturaJustificacion(asignatura); // ✅ Abre el otro swal
          });
        }
      }
    });

  }

  showSwalAsignaturaJustificacion(asignatura: Asignatura) {
    if(!asignatura.justificacion) {
      Swal.fire({
        title: 'Justificación no disponible',
        text: 'No hay justificación disponible para esta asignatura.',
        icon: 'info'
      });
      return;
    }

    Swal.fire({
      title:  asignatura.nombre,
      width: '800px',
      html: `
      <div style="max-height: 300px; overflow-y: auto; overflow-x: auto;">
        <table class="table table-bordered text-start" style="table-layout: fixed; width: 100%;>
          <tr><td style="white-space: pre-line">${asignatura.justificacion}</td></tr>
        </table>
      </div>
      `
    });
  }


  irASyllabyus(obj: any) {
    const node = obj.part?.adornedPart as go.Node;
    const data = node.data;
    const id = data.key;
    const nombre = data.text;

    if(this.isExampleNode(id)) {
      return;
    }

    let codigo: number = this.responseListAsignaturas().content.find(a => a.nombre == nombre)?.codigo || 0;
    window.open(`${APP_CONSTANTS.ASIGNATURAS_URLS.syllabus}${codigo}`, '_blank');
  }


  irAObjetosEstudio(obj: any) {
    const node = obj.part?.adornedPart as go.Node;
    const data = node.data;
    const id = data.key;
    const nombre = data.text;

    if(this.isExampleNode(id)) {
      return;
    }

    let codigo: number = this.responseListAsignaturas().content.find(a => a.nombre == nombre)?.codigo || 0;
    window.open(`${APP_CONSTANTS.ASIGNATURAS_URLS.objetosEstudios}${codigo}`, '_blank');
  }


  irAVerbos(obj: any) {
    const node = obj.part?.adornedPart as go.Node;
    const data = node.data;
    const id = data.key;
    const nombre = data.text;

    if(this.isExampleNode(id)) {
      return;
    }

    window.open(`${APP_CONSTANTS.ASIGNATURAS_URLS.verbos}${nombre}`, '_blank');
  }


  async saveImage(): Promise<void> {
    const imgElement = this.diagram.makeImage({ background: 'white', scale: 1 }) as HTMLImageElement;

    if (!imgElement.src) throw new Error('No se pudo generar la imagen');

    const a = document.createElement('a');
    a.href = imgElement.src;
    a.download = 'diagrama-asignaturas-asociadas.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }


  public clickListener() {
    this.diagram.addDiagramListener('ObjectSingleClicked', (e) => {
      const part = e.subject.part;
      if (!(part instanceof go.Node)) return; // Solo queremos nodos

      if (part instanceof go.Group) {
        // grupo, ejemplo semestre o carrera
      }
      else if (part instanceof go.Node) {
        const nodeData = part.data;
        const id = nodeData.key;
        const nombre = nodeData.text;

        if(this.isExampleNode(id)) {
          return;
        }

        let asignatura = this.responseListAsignaturas().content.find(a => a.codigo == id)!;

        this.showSwalAsignaturaDetalle(asignatura);
      }
    });
  }


  isExampleNode(id: number) {
    let examplesNodes = this.stateData.diagramNodeData.filter(n => n.header?.toLocaleLowerCase() == 'campo de formación');

    if(examplesNodes.map(en => en.key).includes(id)) {
      return true;
    }

    return false;
  }

}
