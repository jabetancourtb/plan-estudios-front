import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { AsignaturaService } from '../../../services/asignatura.service';
import { PrerrequisitoService } from '../../../services/prerrequisito.service';
import { ResponseListDTO } from '../../../dto/response-list.model';
import { Asignatura } from '../../../models/asignatura.model';
import { Prerrequisito } from '../../../models/prerrequisito.model';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FilterAllFieldsPipe } from '../../../pipes/filter-all-fields.pipe';
import * as go from 'gojs';
import Swal from 'sweetalert2';
import { APP_CONSTANTS } from '../../../utils/app-constants';
import { CampoFormacionService } from '../../../services/campo-formacion.service';
import { AreaFormacionService } from '../../../services/area-formacion.service';
import { AreaFormacion } from '../../../models/area-formacion.model';
import { CampoFormacion } from '../../../models/campo-formacion.model';

@Component({
  selector: 'app-prerrequisitos-buscar',
  imports: [NavbarComponent, FormsModule, FilterAllFieldsPipe],
  templateUrl: './prerrequisitos-buscar.component.html',
  styleUrl: './prerrequisitos-buscar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrerrequisitosBuscarComponent {

  @ViewChild('myDiagram', { static: true }) public myDiagramComponent!: ElementRef;

  private router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private campoFormacionService: CampoFormacionService = inject(CampoFormacionService);
  private areaFormacionService: AreaFormacionService = inject(AreaFormacionService);
  private asignaturaService: AsignaturaService = inject(AsignaturaService);
  private prerrequisitoService: PrerrequisitoService = inject(PrerrequisitoService);

  prerrequisitosGraphIsLoading = signal(false);

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

  asignatura = signal<Asignatura>({} as Asignatura);

  asignaturas = signal<any[]>([]);

  fieldsOptions = [
    { value: 'codigo', label: 'Código' },
    { value: 'nombre', label: 'Nombre' },
    { value: 'VerAsignaturasAsociadas', label: 'Ver asignaturas asociadas' }
  ];

  searchTerm = signal<string>('');


  ngOnInit() {
    this.consultarQueryParams();
  }


  // Consulta los query params de la URL
  // incluso cuando estos cambian.
  // Se ejecuta siempre después de this.setQueryParams()
  consultarQueryParams() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.searchTerm.set(params['searchTerm'] || '');
      this.consultarAsignaturasPorPaginacion(1, 100, 'codigo', true);
    });
  }


  private consultarAsignaturasPorPaginacion(page: number, pageSize: number, field: string, asc: boolean) {
    this.prerrequisitosGraphIsLoading.set(true);
    this.asignaturaService.consultarAsignaturas(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListAsignaturas.set(res);

        this.responseListAsignaturas().content.forEach(a => {
          this.asignaturas().push({codigo: a.codigo, nombre: a.nombre});
        })

        this.prerrequisitosGraphIsLoading.set(false);
      },
      error: (e) => {
        this.prerrequisitosGraphIsLoading.set(false);
      }
    });
  }


  private consultarAsignaturaPorCodigo(codigo: number) {
    this.prerrequisitosGraphIsLoading.set(true);
    this.asignaturaService.consultarAsignaturaPorCodigo(codigo).subscribe({
      next: (res) => {
        this.asignatura.set(res);
        this.showSwalAsignaturaDetalle();
        this.prerrequisitosGraphIsLoading.set(false);
      },
      error: (e) => {
        this.prerrequisitosGraphIsLoading.set(false);
      }
    });
  }


  private consultarCamposFormacion() {
    this.prerrequisitosGraphIsLoading.set(true);
    this.campoFormacionService.consultarCamposFormacion(1, 100, 'id', true).subscribe({
      next: (res) => {
        this.responseListCamposFormacion.set(res);
        this.consultarAreasFormacion();
        this.prerrequisitosGraphIsLoading.set(false);
      },
      error: (e) => {
        this.prerrequisitosGraphIsLoading.set(false);
      }
    });
  }


  private consultarAreasFormacion() {
    this.prerrequisitosGraphIsLoading.set(true);
    this.areaFormacionService.consultarAreasFormacion(1, 100, 'id', true).subscribe({
      next: (res) => {
        this.responseListAreasFormacion.set(res);
        this.consultarPrerrequisitosPorPagnacion(1, 200, 'id', true);
        this.prerrequisitosGraphIsLoading.set(false);
      },
      error: (e) => {
        this.prerrequisitosGraphIsLoading.set(false);
      }
    });
  }


  private consultarPrerrequisitosPorPagnacion(page: number, pageSize: number, field: string, asc: boolean) {
    this.prerrequisitosGraphIsLoading.set(true);
    this.prerrequisitoService.consultarPrerrequisitos(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListPrerrequisitos.set(res);
        this.loadAndConvertExternalData();
        this.prerrequisitosGraphIsLoading.set(false);
      },
      error: (e) => {
        this.prerrequisitosGraphIsLoading.set(false);
      }
    });
  }


  verAsignaturasAsociadas(asignatura: any) {
    let asignaturaFound = this.responseListAsignaturas().content.find(a => a.codigo == asignatura.codigo)!;
    this.asignatura.set(asignaturaFound);
    this.consultarCamposFormacion();
  }


  public loadAndConvertExternalData() {
    this.cleanDataGraph();
    this.fillNodeDataGrupos();
    this.fillNodeDataAsignatura();
    let keyCounter = this.fillNodeDataPrerrequisitos();
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
    let keyCounter = 1;

    let prerrequisitos = this.responseListPrerrequisitos().content;

    let role = prerrequisitos.find(p => p.asignatura == this.asignatura().nombre) ? 't' : 'b';
    let colorCampoFormacion = this.responseListCamposFormacion().content.find(a => a.nombre == this.asignatura().campoFormacion)?.colorHtml;
    let colorAreaFormacion = this.responseListAreasFormacion().content.find(a => a.nombre == this.asignatura().areaFormacion)?.colorHtml;
    let colorBody = 'white';

    let data = {
      key: keyCounter,
      header: this.asignatura().campoFormacion,
      text: this.asignatura().nombre,
      footer: this.asignatura().areaFormacion,
      group: this.asignatura().semestreAsignatura,
      colorCampoFormacion: colorCampoFormacion,
      colorAreaFormacion: colorAreaFormacion,
      colorBody: colorBody,
      role: role
    }
    this.stateData.diagramNodeData.push(data);

  }


  public fillNodeDataPrerrequisitos() {
    let keyCounter = 2;

    let prerrequisitos = this.responseListPrerrequisitos().content;

    let prerrequisitosAsignatura = prerrequisitos.filter(p => p.asignaturaCodigo == this.asignatura().codigo);

    for(let prerrequisito of prerrequisitosAsignatura) {

      let asignaturaPrerrequisito = this.responseListAsignaturas().content.find(a => a.codigo == prerrequisito.prerrequisitoCodigo)!;

      let colorCampoFormacion = this.responseListCamposFormacion().content.find(a => a.nombre == asignaturaPrerrequisito.campoFormacion)?.colorHtml;
      let colorAreaFormacion = this.responseListAreasFormacion().content.find(a => a.nombre == asignaturaPrerrequisito.areaFormacion)?.colorHtml;
      let colorBody = 'white';

      let data = {
        key: keyCounter+1,
        header: asignaturaPrerrequisito.campoFormacion,
        text: asignaturaPrerrequisito.nombre,
        footer: asignaturaPrerrequisito.areaFormacion,
        group: this.stateData.diagramNodeData.find(dn => dn.header == 'Asignaturas prerrequisitos')?.key,
        colorCampoFormacion: colorCampoFormacion,
        colorAreaFormacion: colorAreaFormacion,
        colorBody: colorBody,
      }
      this.stateData.diagramNodeData.push(data);

      this.stateData.diagramLinkData.push({
        key: -keyCounter,
        from: keyCounter+1,
        to: 1,
        color: '#ff3c00ff'
      });

      keyCounter += 1;
    }

    return keyCounter;
  }


  public fillNodeDataAsignaturasPosteriores(keyCounter: number) {

    let prerrequisitos = this.responseListPrerrequisitos().content;

    let asignaturasPosteriores = prerrequisitos.filter(p => p.prerrequisitoCodigo == this.asignatura().codigo);

    for(let ap of asignaturasPosteriores) {

      let asignaturaPosterior = this.responseListAsignaturas().content.find(a => a.codigo == ap.asignaturaCodigo)!;

      let colorCampoFormacion = this.responseListCamposFormacion().content.find(a => a.nombre == asignaturaPosterior.campoFormacion)?.colorHtml;
      let colorAreaFormacion = this.responseListAreasFormacion().content.find(a => a.nombre == asignaturaPosterior.areaFormacion)?.colorHtml;
      let colorBody = 'white';

      let data = {
        key: keyCounter+1,
        header: asignaturaPosterior.campoFormacion,
        text: asignaturaPosterior.nombre,
        footer: asignaturaPosterior.areaFormacion,
        group: this.stateData.diagramNodeData.find(dn => dn.header == 'Asignaturas posteriores')?.key,
        colorCampoFormacion: colorCampoFormacion,
        colorAreaFormacion: colorAreaFormacion,
        colorBody: colorBody,
      }
      this.stateData.diagramNodeData.push(data);

      this.stateData.diagramLinkData.push({
        key: -keyCounter,
        from: 1,
        to: keyCounter+1,
        color: '#ff3c00ff'
      });


      keyCounter += 1;
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
      $(go.Panel, 'Auto',
        $(go.Shape, 'RoundedTopRectangle')
          .bind('fill', 'colorCampoFormacion'), // Aquí usas el color definido por nodo
        $(go.TextBlock, { margin: new go.Margin(2, 2, 0, 2), textAlign: 'center' })
          .bind('text', 'header')
      ),
      $(go.Panel, 'Auto', { minSize: new go.Size(NaN, 70) },
        $(go.Shape, 'Rectangle')
          .bind('fill', 'colorBody'), // También se puede usar aquí
        $(go.TextBlock, { width: 120, margin: new go.Margin(2, 2, 0, 2), textAlign: 'center' })
          .bind('text')
      ),
      $(go.Panel, 'Auto',
        $(go.Shape, 'RoundedBottomRectangle')
          .bind('fill', 'colorAreaFormacion'), // O aquí también
        $(go.TextBlock, { margin: new go.Margin(2, 2, 0, 2), textAlign: 'center' })
          .bind('text', 'footer')
      )
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
        $(go.TextBlock, '🔗 Ir a Syllabus'),
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

      let codigo: number = this.responseListAsignaturas().content.find(a => a.nombre == nombre)?.codigo || 0;
      this.consultarAsignaturaPorCodigo(codigo);
    }


  showSwalAsignaturaDetalle() {
    Swal.fire({
      title: this.asignatura().nombre,
      width: '800px',
      html: `
        <div style="max-height: 300px; overflow-y: auto; overflow-x: auto;">
          <table class="table table-bordered text-start">

            <tr><th>Codigo</th><td>${this.asignatura().codigo}</td></tr>

            <tr>
              <th>Campo de Formación</th>
              <td>
                Ver las áreas de formación asociadas:
                <a href="${APP_CONSTANTS.ROUTES.camposFormacionLista}?searchTerm=${encodeURIComponent(this.asignatura().campoFormacion)}">
                  ${this.asignatura().campoFormacion}
                </a>
              </td>
            </tr>

            <tr>
              <th>Área de Formación</th>
              <td>
                Ver las asignaturas asociadas:
                <a href="${APP_CONSTANTS.ROUTES.areasFormacionLista}?pageSize=50&searchTerm=${encodeURIComponent(this.asignatura().areaFormacion)}">
                  ${this.asignatura().areaFormacion}
                </a>
              </td>
            </tr>

            <tr>
              <th>Ver syllabus</th>
              <td>
                <a href="https://sistematizaciondedatos.com/wp-content/Modul_056_ImprimirSyllabus_07/public/mostrar3.php?codigo_asignatura=${this.asignatura().codigo}" target="_blank">
                  https://sistematizaciondedatos.com/wp-content/Modul_056_ImprimirSyllabus_07/public/mostrar3.php?codigo_asignatura=${this.asignatura().codigo}
                </a>
              </td>
            </tr>

            <tr>
              <th>Ver objetos de estudio</th>
              <td>
                <a href="https://sistematizaciondedatos.com/wp-content/verbos/visualizar_datos.php?asignatura=${this.asignatura().codigo}" target="_blank">
                  https://sistematizaciondedatos.com/wp-content/verbos/visualizar_datos.php?asignatura=${this.asignatura().codigo}
                </a>
              </td>
            </tr>

            <tr>
              <th>Ver verbos</th>
              <td>
                <a href="https://sistematizaciondedatos.com/wp-content/verbos/results.php?asignatura=${this.asignatura().nombre}" target="_blank">
                  https://sistematizaciondedatos.com/wp-content/verbos/results.php?asignatura=${this.asignatura().nombre}
                </a>
              </td>
            </tr>

            <tr>
              <th>Justificación</th>
              <td>
                <button type="button" id="btnJustificacion" class="btn btn-primary">Ver</button>
              </td>
            </tr>

            <tr><th>Tipo</th><td>${this.asignatura().Tipo}</td></tr>
            <tr><th>Número de Créditos</th><td>${this.asignatura().numeroCreditos}</td></tr>
            <tr><th>Codigo de Cóndor</th><td>${this.asignatura().codigoCondor}</td></tr>
            <tr><th>HTD</th><td>${this.asignatura().HTD}</td></tr>
            <tr><th>HTC</th><td>${this.asignatura().HTC}</td></tr>
            <tr><th>HTA</th><td>${this.asignatura().HTA}</td></tr>
          </table>
        </div>
      `,
      didOpen: () => {
        const btn = document.getElementById('btnJustificacion');
        if (btn) {
          btn.addEventListener('click', () => {
            this.showSwalAsignaturaJustificacion(); // ✅ Abre el otro swal
          });
        }
      }
    });

  }

  showSwalAsignaturaJustificacion() {
    if(!this.asignatura().justificacion) {
      Swal.fire({
        title: 'Justificación no disponible',
        text: 'No hay justificación disponible para esta asignatura.',
        icon: 'info'
      });
      return;
    }

    Swal.fire({
      title:  this.asignatura().nombre,
      width: '800px',
      html: `
      <div style="max-height: 300px; overflow-y: auto; overflow-x: auto;">
        <table class="table table-bordered text-start" style="table-layout: fixed; width: 100%;>
          <tr><td style="white-space: pre-line">${this.asignatura().justificacion}</td></tr>
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
    window.open(`https://sistematizaciondedatos.com/wp-content/Modul_056_ImprimirSyllabus_07/public/mostrar3.php?codigo_asignatura=${codigo}`, '_blank');
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
    window.open(`https://sistematizaciondedatos.com/wp-content/verbos/visualizar_datos.php?asignatura=${codigo}`, '_blank');
  }


  irAVerbos(obj: any) {
    const node = obj.part?.adornedPart as go.Node;
    const data = node.data;
    const id = data.key;
    const nombre = data.text;

    if(this.isExampleNode(id)) {
      return;
    }

    window.open(`https://sistematizaciondedatos.com/wp-content/verbos/results.php?asignatura=${nombre}`, '_blank');
  }


  async saveImage(): Promise<void> {
    const imgElement = this.diagram.makeImage({ background: 'white', scale: 1 }) as HTMLImageElement;

    if (!imgElement.src) throw new Error('No se pudo generar la imagen');

    const a = document.createElement('a');
    a.href = imgElement.src;
    a.download = 'diagrama-plan-estudios.png';
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

        let codigo: number = this.responseListAsignaturas().content.find(a => a.nombre == nombre)?.codigo || 0;
        this.consultarAsignaturaPorCodigo(codigo);
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
