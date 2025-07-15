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

  diagram!: go.Diagram;

  contextualMenuOptions = {
    verDetalles: '🔍 Ver detalles',
    verJustificacion: 'Ver justificación',
    guardarImage: '💾 Guardar imagen',
    copiarImagen: '📋 Copiar imagen',
    irSyllabus: '🔗 Ir al syllabus',
    irObjetosEstudio: '🔗 Ir a objetos de estudio',
    irVerbos: '🔗 Ir a verbos de estudio',
  }

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


  public loadAndConvertExternalData() {
    this.fillNodeDataCarrerasYSemestres();
    this.fillNodeDataAsignaturasYPrerrequisitos();
    this.initDiagram();
  }


  public fillNodeDataCarrerasYSemestres() {
    let keyCarreraCounter = 10000

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
        color: '#dff5e6'
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
          color: '#FF5722'
        });
      }

      if(asignatura.semestreAsignatura == 11) {
         this.stateData.diagramLinkData.push({
            key: -keyCounter,
            from: keyCounter,
            to: this.stateData.diagramNodeData[1].key,
            color: '#FF5722'
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
        { click: (e: any, obj: any) => this.showDetailsAsignatura(e, obj)}
      ),
      $('ContextMenuButton',
        $(go.TextBlock, '📋 Copiar nombre'),
        { click: (e: any, obj: any) => this.copyImage()}
      ),
      $('ContextMenuButton',
        $(go.TextBlock, '💾 Guardar imagen'),
        { click: (e: any, obj: any) => this.saveImage()}
      )
    );
  }


  async showDetailsAsignatura(e: any, obj: any) {
    const node = obj.part?.adornedPart as go.Node;
    if (!node) return;

    const data = node.data;
    const id = data.key;
    const nombre = data.text;

    Swal.fire({
      title: 'Asignatura (menú contextual)',
      html: `ID: <strong>${id}</strong><br>Nombre: <strong>${nombre}</strong>`,
      icon: 'info'
    });
}


  async saveImage(): Promise<void> {
    const diagram = go.Diagram.fromDiv(this.myDiagramComponent.nativeElement);
    const imgElement = this.diagram.makeImage({ background: 'white', scale: 1 }) as HTMLImageElement;

    if (!imgElement.src) throw new Error('No se pudo generar la imagen');

    const a = document.createElement('a');
    a.href = imgElement.src;
    a.download = 'diagrama-plan-estudios.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }


  async copyImage(): Promise<void> {
    try {
      const diagram = go.Diagram.fromDiv(this.myDiagramComponent.nativeElement);
      const image = this.diagram.makeImage({ background: 'white', scale: 1 }) as HTMLImageElement;

      // Crear un canvas temporal
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No se pudo obtener el contexto del canvas');

      ctx.drawImage(image, 0, 0);

      // Convertir el canvas a blob PNG
      const blob = await new Promise<Blob | null>(resolve =>
        canvas.toBlob(resolve, 'image/png')
      );
      if (!blob) throw new Error('No se pudo generar el blob de imagen');

      // Copiar al portapapeles
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);

      Swal.fire('Copiado', 'La imagen fue copiada al portapapeles.', 'success');
    }
    catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo copiar la imagen.', 'error');
    }
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

        Swal.fire('Asignatura seleccionada', `ID: ${id}<br>Nombre: ${nombre}`, 'info');
      }
    });
  }

}
