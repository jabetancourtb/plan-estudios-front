import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, ViewChild  } from '@angular/core';
import * as go from 'gojs';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { AsignaturaService } from '../../../services/asignatura.service';
import { PrerrequisitoService } from '../../../services/prerrequisito.service';
import { ResponseListDTO } from '../../../dto/response-list.model';
import { Asignatura } from '../../../models/asignatura.model';
import { Prerrequisito } from '../../../models/prerrequisito.model';
import { ignoreElements } from 'rxjs';
import { CarreraService } from '../../../services/carrera.service';
import { Carrera } from '../../../models/carrera.model';
import { CampoFormacionService } from '../../../services/campo-formacion.service';
import { AreaFormacionService } from '../../../services/area-formacion.service';
import { AreaFormacion } from '../../../models/area-formacion.model';
import { CampoFormacion } from '../../../models/campo-formacion.model';
import Swal from 'sweetalert2';
import { APP_CONSTANTS } from '../../../utils/app-constants';


@Component({
  selector: 'app-plan-estudios-semestres',
  imports: [CommonModule, NavbarComponent],
  templateUrl: './plan-estudios-semestres.component.html',
  styleUrl: './plan-estudios-semestres.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanEstudiosSemestresComponent {

  @ViewChild('myDiagram', { static: true }) public myDiagramComponent!: ElementRef;

  private carreraService: CarreraService = inject(CarreraService);
  private campoFormacionService: CampoFormacionService = inject(CampoFormacionService);
  private areaFormacionService: AreaFormacionService = inject(AreaFormacionService);
  private asignaturaService: AsignaturaService = inject(AsignaturaService);
  private prerrequisitoService: PrerrequisitoService = inject(PrerrequisitoService);

  asignaturasGraphIsLoading = signal(false);

  responseListCarreras = signal<ResponseListDTO<Carrera>>({
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

  responseListSemestres = signal<ResponseListDTO<number>>({
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


  ngOnInit() {
    this.consultarCarreras();
  }


  private consultarCarreras() {
    this.asignaturasGraphIsLoading.set(true);
    this.carreraService.consultarCarreras(1, 100, 'id' , true).subscribe({
      next: (res) => {
        this.responseListCarreras.set(res);
        this.consultarSemestres();
        this.asignaturasGraphIsLoading.set(false);
      },
      error: (e) => {
        this.asignaturasGraphIsLoading.set(false);
      }
    });
  }

  private consultarSemestres() {
    this.asignaturasGraphIsLoading.set(true);
    this.asignaturaService.consultarSemestres(true).subscribe({
      next: (res) => {
        this.responseListSemestres.set(res);
        this.consultarCamposFormacion();
        this.asignaturasGraphIsLoading.set(false);
      },
      error: (e) => {
        this.asignaturasGraphIsLoading.set(false);
      }
    });
  }


  private consultarCamposFormacion() {
    this.asignaturasGraphIsLoading.set(true);
    this.campoFormacionService.consultarCamposFormacion(1, 100, 'id', true).subscribe({
      next: (res) => {
        this.responseListCamposFormacion.set(res);
        this.consultarAreasFormacion();
        this.asignaturasGraphIsLoading.set(false);
      },
      error: (e) => {
        this.asignaturasGraphIsLoading.set(false);
      }
    });
  }


  private consultarAreasFormacion() {
    this.asignaturasGraphIsLoading.set(true);
    this.areaFormacionService.consultarAreasFormacion(1, 100, 'id', true).subscribe({
      next: (res) => {
        this.responseListAreasFormacion.set(res);
        this.consultarAsignaturas(1, 200, 'semestreAsignatura', true);
        this.asignaturasGraphIsLoading.set(false);
      },
      error: (e) => {
        this.asignaturasGraphIsLoading.set(false);
      }
    });
  }


  private consultarAsignaturas(page: number, pageSize: number, field: string, asc: boolean) {
    this.asignaturasGraphIsLoading.set(true);
    this.asignaturaService.consultarAsignaturas(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListAsignaturas.set(res);
        this.consultarPrerrequisitosPorPagnacion(1, 200, 'id', true);
        this.asignaturasGraphIsLoading.set(false);
      },
      error: (e) => {
        this.asignaturasGraphIsLoading.set(false);
      }
    });
  }


  private consultarPrerrequisitosPorPagnacion(page: number, pageSize: number, field: string, asc: boolean) {
    this.asignaturasGraphIsLoading.set(true);
    this.prerrequisitoService.consultarPrerrequisitos(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListPrerrequisitos.set(res);
        this.loadAndConvertExternalData();
        this.asignaturasGraphIsLoading.set(false);
      },
      error: (e) => {
        this.asignaturasGraphIsLoading.set(false);
      }
    });
  }


  private consultarAsignaturaPorCodigo(codigo: number) {
    this.asignaturasGraphIsLoading.set(true);
    this.asignaturaService.consultarAsignaturaPorCodigo(codigo).subscribe({
      next: (res) => {
        this.asignatura.set(res);
        this.showSwalAsignaturaDetalle();
        this.asignaturasGraphIsLoading.set(false);
      },
      error: (e) => {
        this.asignaturasGraphIsLoading.set(false);
      }
    });
  }


  public loadAndConvertExternalData() {
    this.fillNodeDataExample();
    this.fillNodeDataCarrerasYSemestres();
    this.fillNodeDataAsignaturasYPrerrequisitos();
    this.initDiagram();
  }


  public fillNodeDataExample() {
    let keyExampleCounter = 1000;

    let dataGroupExample = {
        key: keyExampleCounter,
        header: 'Ejemplo',
        isGroup: true,
        footer: 'Ejemplo',
        color: '#f2f5df'
    }
    this.stateData.diagramNodeData.push(dataGroupExample);

    let data1 = {
      key: keyExampleCounter+1,
      header: 'Campo de formación',
      text: 'Asignatura Prerrequisito (Obligatoria para ver la asignatura posterior)',
      footer: 'Área de formación',
      group: keyExampleCounter,
      colorCampoFormacion: '#f2f5df',
      colorBody: 'white',
      colorAreaFormacion: '#f2f5df',
    }
    this.stateData.diagramNodeData.push(data1);

    let data2 = {
      key: keyExampleCounter+2,
      header: 'Campo de formación',
      text: 'Asignatura posterior',
      footer: 'Área de formación',
      group: keyExampleCounter,
      colorCampoFormacion: '#f2f5df',
      colorBody: '#e3d8dc',
      colorAreaFormacion: '#f2f5df',
    }
    this.stateData.diagramNodeData.push(data2);

    this.stateData.diagramLinkData.push({
      key: -keyExampleCounter,
      from: keyExampleCounter+1,
      to: keyExampleCounter+2,
      color: '#ff3c00ff'
    });

  }


  public fillNodeDataCarrerasYSemestres() {
    let keyCarreraCounter = 10000;

    for(let carrera of this.responseListCarreras().content) {
      let data = {
        key: keyCarreraCounter,
        header: carrera.nombre,
        isGroup: true,
        footer: carrera.nombre,
        color: '#f2f5df'
      }
      this.stateData.diagramNodeData.push(data);

      this.stateData.diagramLinkData.push({
        key: -keyCarreraCounter,
        from: keyCarreraCounter,
        to: keyCarreraCounter+1,
        color: '#2957f0ff'
      });

      keyCarreraCounter += 1;
    }

    for(let semestre of this.responseListSemestres().content) {
      let group = this.stateData.diagramNodeData.find(d => d.header == this.responseListAsignaturas().content.find(a => a.semestreAsignatura == semestre)?.carrera)?.key

      let data = {
        key: semestre,
        header: `Semestre ${semestre}`,
        isGroup: true,
        footer: `Semestre ${semestre}`,
        group: group,
        color: '#d3e5ed'
      }
      this.stateData.diagramNodeData.push(data);

      if(semestre != 11) {
        this.stateData.diagramLinkData.push({
          key: -semestre,
          from: semestre,
          to: semestre + 1,
          color: '#43af65a8'
        });
      }
    }
  }


  public fillNodeDataAsignaturasYPrerrequisitos() {
    let keyCounter = this.responseListSemestres().totalRecordCount + 1;

    let prerrequisitos = this.responseListPrerrequisitos().content;

     for(let asignatura of this.responseListAsignaturas().content) {
      let role = prerrequisitos.find(p => p.asignatura == asignatura.nombre) ? 't' : 'b';
      let colorCampoFormacion = this.responseListCamposFormacion().content.find(a => a.nombre == asignatura.campoFormacion)?.colorHtml;
      let colorAreaFormacion = this.responseListAreasFormacion().content.find(a => a.nombre == asignatura.areaFormacion)?.colorHtml;
      let colorBody = prerrequisitos.find(p => p.asignatura == asignatura.nombre) ? '#e3d8dc' : 'white';

      let data = {
        key: keyCounter,
        header: asignatura.campoFormacion,
        text: asignatura.nombre,
        footer: asignatura.areaFormacion,
        group: asignatura.semestreAsignatura,
        colorCampoFormacion: colorCampoFormacion,
        colorAreaFormacion: colorAreaFormacion,
        colorBody: colorBody,
        role: role
      }
      this.stateData.diagramNodeData.push(data);

      let prerrequisitosAsignatura = prerrequisitos.filter(p => p.asignatura == asignatura.nombre);

      for(let prerrequisito of prerrequisitosAsignatura) {
        this.stateData.diagramLinkData.push({
          key: -keyCounter,
          from: this.stateData.diagramNodeData
            .find(n => n.text === prerrequisito.prerrequisito)?.key!,
          to: this.stateData.diagramNodeData
            .find(n => n.text === prerrequisito.asignatura)?.key!,
          color: '#ff3c00ff'
        });
      }

      if(asignatura.semestreAsignatura == 11) {
         this.stateData.diagramLinkData.push({
            key: -keyCounter,
            from: keyCounter,
            to: this.stateData.diagramNodeData.find(n => n.text?.toLocaleLowerCase() == 'ingeniería telemática')?.key || 10001,
            color: '#ff3c00ff'
          });
      }

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
    const imgElement = this.diagram.makeImage({ background: 'white', scale: 0.68 }) as HTMLImageElement;

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
