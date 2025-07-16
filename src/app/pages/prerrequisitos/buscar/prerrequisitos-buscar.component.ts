import { ChangeDetectionStrategy, Component, inject, signal, ViewChild } from '@angular/core';
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { AsignaturaService } from '../../../services/asignatura.service';
import { ResponseListDTO } from '../../../dto/response-list.model';
import { Asignatura } from '../../../models/asignatura.model';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FilterAllFieldsPipe } from '../../../pipes/filter-all-fields.pipe';
import { AsignaturasAsociadasComponent } from "../../../shared/components/asignaturas-asociadas/asignaturas-asociadas.component";
import { NgStyle } from '@angular/common';


@Component({
  selector: 'app-prerrequisitos-buscar',
  imports: [NavbarComponent, FormsModule, FilterAllFieldsPipe, AsignaturasAsociadasComponent, NgStyle],
  templateUrl: './prerrequisitos-buscar.component.html',
  styleUrl: './prerrequisitos-buscar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrerrequisitosBuscarComponent {

  @ViewChild(AsignaturasAsociadasComponent, { static: false }) asignaturasAsociadas!: AsignaturasAsociadasComponent;

  private router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private asignaturaService: AsignaturaService = inject(AsignaturaService);

  prerrequisitosBuscarIsLoading = signal(false);

  responseListAsignaturas = signal<ResponseListDTO<Asignatura>>({
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

  mostrarComponenteHijo = false;

  estilosTablaDiv = {
    'max-height': '60vh',
    'max-width': '200vh',
    'overflow': 'auto'
  };


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


  // Asigna los query params a la URL
  setQueryParams() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        searchTerm: this.searchTerm()
      },
      queryParamsHandling: 'merge' // para mantener otros parámetros existentes
    });
  }

  private consultarAsignaturasPorPaginacion(page: number, pageSize: number, field: string, asc: boolean) {
    this.prerrequisitosBuscarIsLoading.set(true);
    this.asignaturaService.consultarAsignaturas(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListAsignaturas.set(res);

        this.responseListAsignaturas().content.forEach(a => {
          this.asignaturas().push({codigo: a.codigo, nombre: a.nombre});
        })

        this.prerrequisitosBuscarIsLoading.set(false);
      },
      error: (e) => {
        this.prerrequisitosBuscarIsLoading.set(false);
      }
    });
  }


  verAsignaturasAsociadas(asignatura: any) {
    let asignaturaFound = this.responseListAsignaturas().content.find(a => a.codigo == asignatura.codigo)!;
    this.asignatura.set(asignaturaFound);

    this.estilosTablaDiv['max-height'] = '10vh';

    this.mostrarComponenteHijo = true;

    setTimeout(() => {
      this.asignaturasAsociadas.consultarCamposFormacion();
    });
  }


  removeGraph() {
    this.asignatura.set({} as Asignatura);
    this.estilosTablaDiv['max-height'] = '60vh';
  }


}
