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


@Component({
  selector: 'app-plan-estudios-tabla',
  imports: [CommonModule, NavbarComponent],
  templateUrl: './plan-estudios-tabla.component.html',
  styleUrl: './plan-estudios-tabla.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanEstudiosTablaComponent {

  @ViewChild('myDiagram', { static: true }) public myDiagramComponent!: ElementRef;

  private carreraService: CarreraService = inject(CarreraService);
  private asignaturaService: AsignaturaService = inject(AsignaturaService);
  private prerrequisitoService: PrerrequisitoService = inject(PrerrequisitoService);

  asignaturasGraphIsLoading = signal(false);

  responseListCarreras = signal<ResponseListDTO<Carrera>>({
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


  obtenerColorPorArea(area: string): string {
    const colores: Record<string, string> = {
      'Matemáticas': '#A5D6A7',
      'Lenguaje': '#FFCC80',
      'Física': '#90CAF9',
      'Química': '#CE93D8',
      'Biología': '#FFF176',
      'Ingeniería': '#B0BEC5'
    };
    return colores[area] || '#E0E0E0'; // color por defecto
  }


  public loadAndConvertExternalData() {

    let keyCarreraCounter = 10000

    for(let carrera of this.responseListCarreras().content) {
      this.stateData.diagramNodeData.push({
        key: keyCarreraCounter,
        header: carrera.nombre,
        isGroup: true,
        footer: ''
      });

      this.stateData.diagramLinkData.push({
        key: -keyCarreraCounter,
        from: keyCarreraCounter,
        to: keyCarreraCounter+1,
        color: '#FF5722'
      });

      keyCarreraCounter += 1;
    }

    for(let semestre of this.responseListSemestres().content) {
      let group = this.stateData.diagramNodeData.find(d => d.header == this.responseListAsignaturas().content.find(a => a.semestreAsignatura == semestre)?.carrera)?.key

      let data = {
        key: semestre,
        header: `Semestre ${semestre}`,
        isGroup: true,
        footer: this.responseListAsignaturas().content.find(a => a.semestreAsignatura == semestre)?.carrera,
        group: group
      }
      this.stateData.diagramNodeData.push(data);
    }


    let keyCounter = this.responseListSemestres().totalRecordCount + 1;

    let prerrequisitos = this.responseListPrerrequisitos().content;

    for(let asignatura of this.responseListAsignaturas().content) {
      let role = prerrequisitos.find(p => p.prerrequisito == asignatura.nombre) ? 't' : '';

      let data = {
        key: keyCounter,
        header: asignatura.areaFormacion,
        text: asignatura.nombre,
        footer: asignatura.EspacioAcademico,
        group: asignatura.semestreAsignatura,
        color: this.obtenerColorPorArea(asignatura.areaFormacion),
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

    this.initDiagram();
  }


  public initDiagram(): go.Diagram {
    const $ = go.GraphObject.make;

    const diagram = $(go.Diagram, this.myDiagramComponent.nativeElement, {
      layout: $(go.TreeLayout, {
        setsPortSpot: false,
        setsChildPortSpot: false,
        isRealtime: false
      }),
      'undoManager.isEnabled': true
    });

     diagram.groupTemplate = $(
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
        $(go.Shape, { fill: 'white' }),
        $(go.Placeholder, { padding: 20 })
      ),
      $(go.Panel, 'Auto',
        $(go.Shape, 'RoundedRectangle', { fill: 'white', parameter2: 4 | 8 })
          .bind('fill', 'role', r => r[0] === 'b' ? 'lightgray' : 'white'),
        $(go.TextBlock, { margin: new go.Margin(2, 2, 0, 2), textAlign: 'center' })
          .bind('text', 'footer')
      )
    );

    diagram.nodeTemplate = $(
      go.Node, 'Vertical',
      { defaultStretch: go.GraphObject.Horizontal, fromSpot: go.Spot.RightSide, toSpot: go.Spot.LeftSide },
      $(go.Panel, 'Auto',
        $(go.Shape, 'RoundedTopRectangle')
          .bind('fill', 'color'), // Aquí usas el color definido por nodo
        $(go.TextBlock, { margin: new go.Margin(2, 2, 0, 2), textAlign: 'center' })
          .bind('text', 'header')
      ),
      $(go.Panel, 'Auto', { minSize: new go.Size(NaN, 70) },
        $(go.Shape, 'Rectangle')
          .bind('fill', 'color'), // También se puede usar aquí
        $(go.TextBlock, { width: 120, margin: new go.Margin(2, 2, 0, 2), textAlign: 'center' })
          .bind('text')
      ),
      $(go.Panel, 'Auto',
        $(go.Shape, 'RoundedBottomRectangle')
          .bind('fill', 'color'), // O aquí también
        $(go.TextBlock, { margin: new go.Margin(2, 2, 0, 2), textAlign: 'center' })
          .bind('text', 'footer')
      )
    );

    diagram.linkTemplate = $(
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
    diagram.model = model;

    return diagram;
  }



}
