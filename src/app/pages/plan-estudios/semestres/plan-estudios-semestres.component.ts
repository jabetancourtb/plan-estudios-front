import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, ViewChild  } from '@angular/core';
import * as go from 'gojs';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { AsignaturaService } from '../../../services/asignatura.service';
import { PrerrequisitoService } from '../../../services/prerrequisito.service';
import { ResponseListDTO } from '../../../dto/response-list.model';
import { Asignatura } from '../../../models/asignatura.model';
import { Prerrequisito } from '../../../models/prerrequisito.model';
import { CarreraService } from '../../../services/carrera.service';
import { Carrera } from '../../../models/carrera.model';
import { CampoFormacionService } from '../../../services/campo-formacion.service';
import { AreaFormacionService } from '../../../services/area-formacion.service';
import { AreaFormacion } from '../../../models/area-formacion.model';
import { CampoFormacion } from '../../../models/campo-formacion.model';
import Swal from 'sweetalert2';
import { APP_CONSTANTS } from '../../../utils/app-constants';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalAsignaturasAsociadasComponent } from '../../../shared/components/modal-asignaturas-asociadas/modal-asignaturas-asociadas.component';
go.Diagram.licenseKey = 'Tdfgihsdgiopsdhjg';


@Component({
  selector: 'app-plan-estudios-semestres',
  imports: [CommonModule, NavbarComponent, NgbModalModule],
  templateUrl: './plan-estudios-semestres.component.html',
  styleUrl: './plan-estudios-semestres.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanEstudiosSemestresComponent {

  @ViewChild('myDiagram', { static: true }) public myDiagramComponent!: ElementRef;

  private modalService = inject(NgbModal);
  private carreraService: CarreraService = inject(CarreraService);
  private campoFormacionService: CampoFormacionService = inject(CampoFormacionService);
  private areaFormacionService: AreaFormacionService = inject(AreaFormacionService);
  private asignaturaService: AsignaturaService = inject(AsignaturaService);
  private prerrequisitoService: PrerrequisitoService = inject(PrerrequisitoService);

  planEstudiosGraphIsLoading = signal(false);

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
      codigoCondor?: string;
      creditos?: string;
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
    this.planEstudiosGraphIsLoading.set(true);
    this.carreraService.consultarCarreras(1, 100, 'id' , true).subscribe({
      next: (res) => {
        this.responseListCarreras.set(res);
        this.consultarSemestres();
        this.planEstudiosGraphIsLoading.set(false);
      },
      error: (e) => {
        this.planEstudiosGraphIsLoading.set(false);
      }
    });
  }

  private consultarSemestres() {
    this.planEstudiosGraphIsLoading.set(true);
    this.asignaturaService.consultarSemestres(true).subscribe({
      next: (res) => {
        this.responseListSemestres.set(res);
        this.consultarCamposFormacion();
        this.planEstudiosGraphIsLoading.set(false);
      },
      error: (e) => {
        this.planEstudiosGraphIsLoading.set(false);
      }
    });
  }


  private consultarCamposFormacion() {
    this.planEstudiosGraphIsLoading.set(true);
    this.campoFormacionService.consultarCamposFormacion(1, 100, 'id', true).subscribe({
      next: (res) => {
        this.responseListCamposFormacion.set(res);
        this.consultarAreasFormacion();
        this.planEstudiosGraphIsLoading.set(false);
      },
      error: (e) => {
        this.planEstudiosGraphIsLoading.set(false);
      }
    });
  }


  private consultarAreasFormacion() {
    this.planEstudiosGraphIsLoading.set(true);
    this.areaFormacionService.consultarAreasFormacion(1, 100, 'id', true).subscribe({
      next: (res) => {
        this.responseListAreasFormacion.set(res);
        this.consultarAsignaturas(1, 200, 'semestreAsignatura', true);
        this.planEstudiosGraphIsLoading.set(false);
      },
      error: (e) => {
        this.planEstudiosGraphIsLoading.set(false);
      }
    });
  }


  private consultarAsignaturas(page: number, pageSize: number, field: string, asc: boolean) {
    this.planEstudiosGraphIsLoading.set(true);
    this.asignaturaService.consultarAsignaturas(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListAsignaturas.set(res);
        this.consultarPrerrequisitosPorPagnacion(1, 200, 'id', true);
        this.planEstudiosGraphIsLoading.set(false);
      },
      error: (e) => {
        this.planEstudiosGraphIsLoading.set(false);
      }
    });
  }


  private consultarPrerrequisitosPorPagnacion(page: number, pageSize: number, field: string, asc: boolean) {
    this.planEstudiosGraphIsLoading.set(true);
    this.prerrequisitoService.consultarPrerrequisitos(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListPrerrequisitos.set(res);
        this.loadAndConvertExternalData();
        this.planEstudiosGraphIsLoading.set(false);
      },
      error: (e) => {
        this.planEstudiosGraphIsLoading.set(false);
      }
    });
  }


  public loadAndConvertExternalData() {
    this.fillNodeDataExample();
    this.fillNodeDataCarreras();
    this.fillNodeDataSemestres();
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
      codigoCondor: 'Código cóndor',
      text: 'Asignatura Prerrequisito (Obligatoria para ver la asignatura posterior)',
      creditos: 'Créditos',
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
      codigoCondor: 'Código cóndor',
      text: 'Asignatura posterior',
      creditos: 'Créditos',
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


  public fillNodeDataCarreras() {
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

    let carrera = this.responseListCarreras().content.find(c => c.nombre.startsWith('Tecnología'));

    let data = {
      key: keyCarreraCounter,
      header: carrera?.nombre,
      isGroup: true,
      footer: carrera?.nombre,
      color: '#f2f5df'
    }
    this.stateData.diagramNodeData.push(data);

    this.stateData.diagramLinkData.push({
      key: -keyCarreraCounter,
      from: keyCarreraCounter,
      to: keyCarreraCounter+1,
      color: '#2957f0ff'
    });

  }


  public fillNodeDataSemestres() {
    for(let semestre of this.responseListSemestres().content) {
      if(semestre != 11) {
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

        this.stateData.diagramLinkData.push({
          key: -semestre,
          from: semestre,
          to: semestre + 1,
          color: '#43af65a8'
        });
      }
      else {
        let group2 = this.stateData.diagramNodeData.filter(n => n.header?.toLowerCase().startsWith('tecnología'))[1].key;

        let data = {
          key: semestre,
          header: `Semestre ${semestre}`,
          isGroup: true,
          footer: `Semestre ${semestre}`,
          group: group2,
          color: '#d3e5ed'
        }
        this.stateData.diagramNodeData.push(data);
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
        codigoCondor: 'Código cóndor: '+asignatura.codigoCondor,
        text: asignatura.nombre,
        creditos: 'Créditos: '+asignatura.numeroCreditos,
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
            to: this.stateData.diagramNodeData.find(n => n.header?.toLocaleLowerCase().startsWith('ingeniería'))?.key!,
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

      /*
      $(go.Panel, 'Auto',
        $(go.Shape, 'RoundedTopRectangle')
          .bind('fill', 'colorCampoFormacion'), // Aquí usas el color definido por nodo
        $(go.TextBlock, { margin: new go.Margin(2, 2, 0, 2), textAlign: 'center' })
          .bind('text', 'header')
      ),*/
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
      )*/
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
        { click: (e: any, obj: any) => this.consultarJustificacion(obj)}
      ),
      $('ContextMenuButton',
        $(go.TextBlock, 'Ver asignaturas asociadas'),
        { click: (e: any, obj: any) => this.abrirModalAsignaturasAsociadas(obj)}
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

    let asignatura = this.responseListAsignaturas().content.find(a => a.nombre == nombre)!;
    this.asignatura.set(asignatura);
    this.showSwalAsignaturaDetalle();
  }


  async consultarJustificacion(obj: any) {
    const node = obj.part?.adornedPart as go.Node;
    if (!node) return;

    const data = node.data;
    const id = data.key;
    const nombre = data.text;

    if(this.isExampleNode(id)) {
      return;
    }

    let asignatura = this.responseListAsignaturas().content.find(a => a.nombre == nombre)!;
    this.asignatura.set(asignatura);
    this.showSwalAsignaturaJustificacion();
  }


  showSwalAsignaturaDetalle() {
    Swal.fire({
      title: this.asignatura().nombre,
      width: '800px',
      html: `
        <div style="max-height: 300px; overflow-y: auto; overflow-x: auto;">
          <table class="table table-bordered text-start">

            <tr><th>Codigo</th><td>${this.asignatura().codigo}</td></tr>
            <tr><th>Codigo de Cóndor</th><td>${this.asignatura().codigoCondor}</td></tr>
            <tr><th>Créditos</th><td>${this.asignatura().numeroCreditos}</td></tr>

            <tr>
              <th>Campo de Formación</th>
              <td>
                Ver las áreas de formación asociadas:
                <a href="${APP_CONSTANTS.ROUTES.camposFormacionLista}?searchTerm=${encodeURIComponent(this.asignatura().campoFormacion)}">
                  ${this.asignatura().campoFormacion}
                </a>

                <span style = "
                    display: inline-block;
                    width: 0;
                    height: 0;
                    border-top: 15px solid transparent;
                    border-bottom: 15px solid transparent;
                    border-left: 20px solid  ${this.responseListCamposFormacion().content.find(cf => cf.nombre == this.asignatura().campoFormacion)?.colorHtml};">
                </span>
              </td>
            </tr>

            <tr>
              <th>Área de Formación</th>
              <td>
                Ver las asignaturas asociadas:
                <a href="${APP_CONSTANTS.ROUTES.areasFormacionLista}?pageSize=50&searchTerm=${encodeURIComponent(this.asignatura().areaFormacion)}">
                  ${this.asignatura().areaFormacion}
                </a>

                <span style = "
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 2px solid #000;
                    background-color: ${this.responseListAreasFormacion().content.find(cf => cf.nombre == this.asignatura().areaFormacion)?.colorHtml};">
                </span>

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

            <tr><th>Tipo</th><td>${this.asignatura().Tipo}</td></tr>
            <tr><th>HTD</th><td>${this.asignatura().HTD}</td></tr>
            <tr><th>HTC</th><td>${this.asignatura().HTC}</td></tr>
            <tr><th>HTA</th><td>${this.asignatura().HTA}</td></tr>
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
            this.abrirModalAsignaturasAsociadas(null);
            Swal.close();
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

        let asignatura = this.responseListAsignaturas().content.find(a => a.nombre == nombre)!;
        this.asignatura.set(asignatura);
        this.showSwalAsignaturaDetalle();
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


  abrirModalAsignaturasAsociadas(obj?: any) {
    if(obj) {
      const node = obj.part?.adornedPart as go.Node;
      const data = node.data;
      const id = data.key;
      const nombre = data.text;

      if(this.isExampleNode(id)) {
        return;
      }

      let asignatura = this.responseListAsignaturas().content.find(a => a.nombre == nombre)!;
      this.asignatura.set(asignatura);
    }

    const modalRef = this.modalService.open(ModalAsignaturasAsociadasComponent, {
      size: 'xl',
      scrollable: true
    });

    modalRef.componentInstance.asignatura = this.asignatura();
  }


}
