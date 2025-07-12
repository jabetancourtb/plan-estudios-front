import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AsignaturaService } from '../../../../services/asignatura.service';
import { ResponseListDTO } from '../../../../dto/response-list.model';
import { Asignatura } from '../../../../models/asignatura.model';
import { NavbarComponent } from "../../../../shared/components/navbar/navbar.component";
import { FilterAllFieldsPipe } from '../../../../pipes/filter-all-fields.pipe';
import { FilterPaginationComponent } from "../../../../shared/components/filter-pagination/filter-pagination.component";
import { FilterPaginationDTO } from '../../../../dto/filter-pagination.model';
import { PaginationComponent } from "../../../../shared/components/pagination/pagination.component";
import Swal from 'sweetalert2';
import { APP_CONSTANTS } from '../../../../utils/app-constants';



@Component({
  selector: 'app-asignaturas-lista',
  imports: [NavbarComponent, FormsModule, FilterAllFieldsPipe, FilterPaginationComponent, PaginationComponent],
  templateUrl: './asignaturas-lista.component.html',
  styleUrl: './asignaturas-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsignaturasListaComponent {

  private router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private asignaturaService: AsignaturaService = inject(AsignaturaService);

  isLoading = signal(false);

  responseListAsignaturas = signal<ResponseListDTO<Asignatura>>({
    recordCountPerPage: 0,
    totalRecordCount: 0,
    totalPages: 0,
    content: []
  });

  asignatura = signal<Asignatura>({} as Asignatura);

  filterPaginationDTO = signal<FilterPaginationDTO>(new FilterPaginationDTO());

  fieldsOptions = [
    { value: 'codigo', label: 'Código' },
    { value: 'nombre', label: 'Nombre' },
    { value: 'semestreAsignatura', label: 'Semestre' },
    { value: 'carrera', label: 'Carrera' },
    { value: 'codigoCondor', label: 'Código Condor' },
    { value: 'numeroCreditos', label: 'Número de Créditos' },
    { value: 'justificacion', label: 'Justificación' },
    { value: 'verDetalles', label: 'Ver más detalles' },
  ];


  ngOnInit() {
    this.consultarQueryParams();
  }


  // Consulta los query params de la URL
  // incluso cuando estos cambian.
  // Se ejecuta siempre después de this.setQueryParams()
  consultarQueryParams() {
    this.activatedRoute.queryParams.subscribe(params => {

      this.filterPaginationDTO.set(new FilterPaginationDTO({
        currentPage: params['page'] ? +params['page'] : 1,
        pageSize: params['pageSize'] ? +params['pageSize'] : 10,
        field: params['field'] || 'codigo',
        fieldsOptions: this.fieldsOptions,
        ascending: params['ascending'] || true ,
        searchTerm: params['searchTerm'] || ''
      }));

      this.consultarAsignaturasPorPaginacion(
        this.filterPaginationDTO().currentPage,
        this.filterPaginationDTO().pageSize,
        this.filterPaginationDTO().field ,
        this.filterPaginationDTO().ascending
      );
    });
  }


  private consultarAsignaturasPorPaginacion(page: number, pageSize: number, field: string, asc: boolean) {
    this.isLoading.set(true);
    this.asignaturaService.consultarAsignaturas(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListAsignaturas.set(res);
        this.updatePageInformation();
        this.isLoading.set(false);
      },
      error: (e) => {
        this.updatePageInformation();
        this.isLoading.set(false);
      }
    });
  }


  updatePageInformation(): void {
    if(this.responseListAsignaturas() && this.responseListAsignaturas().content.length > 0) {
      this.filterPaginationDTO.set(new FilterPaginationDTO({
        ...this.filterPaginationDTO(),
        totalItems: this.responseListAsignaturas().totalRecordCount,
        pages: Array.from({ length: this.responseListAsignaturas().totalPages }, (_, i) => i + 1),
      }));
    }
  }


  // Asigna los query params a la URL
  setQueryParams() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        page: this.filterPaginationDTO().currentPage,
        pageSize: this.filterPaginationDTO().pageSize,
        field: this.filterPaginationDTO().field,
        ascending: this.filterPaginationDTO().ascending,
        searchTerm: this.filterPaginationDTO().searchTerm
      },
      queryParamsHandling: 'merge' // para mantener otros parámetros existentes
    });
  }


  filterQuery(event: any): void {
    this.filterPaginationDTO().currentPage = 1,
    this.filterPaginationDTO().pageSize = event.pageSize;
    this.filterPaginationDTO().field = event.field;
    this.filterPaginationDTO().ascending = event.ascending;

    if(event.action == 'clear') {
      this.filterPaginationDTO().searchTerm = event.searchTerm;
    }

    // Evita ejecutar el servicio de consulta ya que se usa el pipe de filtrado
    if(event.searchTerm != this.filterPaginationDTO().searchTerm) {
      this.filterPaginationDTO().searchTerm = event.searchTerm;
      return;
    }

    this.setQueryParams();
  }


  goToPage(page: number) {
    this.filterPaginationDTO().currentPage = page;
    this.setQueryParams();
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


  showSwalAsignaturaDetalles(asignatura: Asignatura) {
    Swal.fire({
      title: asignatura.nombre,
      width: '800px',
      html: `
        <div style="max-height: 300px; overflow-y: auto; overflow-x: auto;">
          <table class="table table-bordered text-start">

            <tr>
              <th>Campo de Formación</th>
              <td>
                Ver las áreas de formación asociadas:
                <a href="${APP_CONSTANTS.ROUTES.camposFormacionLista}?searchTerm=${encodeURIComponent(asignatura.campoFormacion)}">
                  ${asignatura.campoFormacion}
                </a>
              </td>
            </tr>

            <tr>
              <th>Área de Formación</th>
              <td>
                Ver las asignaturas asociadas:
                <a href="${APP_CONSTANTS.ROUTES.areasFormacionLista}?pageSize=50&searchTerm=${encodeURIComponent(asignatura.areaFormacion)}">
                  ${asignatura.areaFormacion}
                </a>
              </td>
            </tr>

            <tr>
              <th>Ver syllabus</th>
              <td>
                <a href="https://sistematizaciondedatos.com/wp-content/Modul_056_ImprimirSyllabus_07/public/mostrar3.php?codigo_asignatura=${asignatura.codigo}" target="_blank">
                  https://sistematizaciondedatos.com/wp-content/Modul_056_ImprimirSyllabus_07/public/mostrar3.php?codigo_asignatura=${asignatura.codigo}
                </a>
              </td>
            </tr>

            <tr>
              <th>Ver objetos de estudio</th>
              <td>
                <a href="https://sistematizaciondedatos.com/wp-content/verbos/visualizar_datos.php?asignatura=${asignatura.codigo}" target="_blank">
                  https://sistematizaciondedatos.com/wp-content/verbos/visualizar_datos.php?asignatura=${asignatura.codigo}
                </a>
              </td>
            </tr>

            <tr>
              <th>Ver verbos</th>
              <td>
                <a href="https://sistematizaciondedatos.com/wp-content/verbos/results.php?asignatura=${asignatura.nombre}" target="_blank">
                  https://sistematizaciondedatos.com/wp-content/verbos/results.php?asignatura=${asignatura.nombre}
                </a>
              </td>
            </tr>

            <tr><th>Tipo</th><td>${asignatura.Tipo}</td></tr>
            <tr><th>HTD</th><td>${asignatura.HTD}</td></tr>
            <tr><th>HTC</th><td>${asignatura.HTC}</td></tr>
            <tr><th>HTA</th><td>${asignatura.HTA}</td></tr>
          </table>
        </div>
      `
    });

  }


}
