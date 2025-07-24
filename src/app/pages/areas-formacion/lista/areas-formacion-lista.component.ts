import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { FilterAllFieldsPipe } from '../../../pipes/filter-all-fields.pipe';
import { NgStyle } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AreaFormacionService } from '../../../services/area-formacion.service';
import { AreaFormacion } from '../../../models/area-formacion.model';
import { ResponseListDTO } from '../../../dto/response-list.model';
import { FilterPaginationDTO } from '../../../dto/filter-pagination.model';
import { FilterPaginationComponent } from '../../../shared/components/filter-pagination/filter-pagination.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { AsignaturaService } from '../../../services/asignatura.service';
import { Asignatura } from '../../../models/asignatura.model';
import Swal from 'sweetalert2';
import { APP_CONSTANTS } from '../../../utils/app-constants';
import { CampoFormacionService } from '../../../services/campo-formacion.service';
import { CampoFormacion } from '../../../models/campo-formacion.model';


@Component({
  selector: 'app-areas-formacion-lista',
  imports: [NavbarComponent, FormsModule, FilterAllFieldsPipe, NgStyle, FilterPaginationComponent, PaginationComponent],
  templateUrl: './areas-formacion-lista.component.html',
  styleUrl: './areas-formacion-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AreasFormacionListaComponent {

  private router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private campoFormacionService: CampoFormacionService = inject(CampoFormacionService);
  private areaFormacionService: AreaFormacionService = inject(AreaFormacionService);
  private asignaturaService: AsignaturaService = inject(AsignaturaService);

  public APP_CONSTANTS = APP_CONSTANTS;

  areasFormacionTableIsLoading = signal(false);
  swalAsignaturasIsLoading = signal(false);

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

  areaFormacion = signal<AreaFormacion>({} as AreaFormacion);

  filterPaginationDTO = signal<FilterPaginationDTO>(new FilterPaginationDTO());

  fieldsOptions = [
    { value: 'id', label: 'Id' },
    { value: 'idCampoFormacion', label: 'Id campo de formación' },
    { value: 'nombreCampoFormacion', label: 'Nombre campo de formación' },
    { value: 'nombre', label: 'Nombre' },
    { value: 'color', label: 'Color' },
    { value: 'cantidadAsignaturas', label: 'Cantidad de asignaturas' },
    { value: 'asignaturasAsignadas', label: 'Ver asignaturas asignadas' }
  ];

  responseListAsignaturas = signal<ResponseListDTO<Asignatura>>({
    recordCountPerPage: 0,
    totalRecordCount: 0,
    totalPages: 0,
    content: []
  });


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
        field: params['field'] || 'id',
        fieldsOptions: this.fieldsOptions,
        ascending: params['ascending'] || true ,
        searchTerm: params['searchTerm'] || ''
      }));

      this.consultarAreasformacionPorPaginacion(
        this.filterPaginationDTO().currentPage,
        this.filterPaginationDTO().pageSize,
        this.filterPaginationDTO().field ,
        this.filterPaginationDTO().ascending
      );
    });
  }


  private consultarAreasformacionPorPaginacion(page: number, pageSize: number, field: string, asc: boolean) {
    this.areasFormacionTableIsLoading.set(true);
    this.areaFormacionService.consultarAreasFormacion(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListAreasFormacion.set(res);
        this.consultarCamposformacionPorPaginacion(1, 100, 'id', true);
        this.areasFormacionTableIsLoading.set(false);
      },
      error: (e) => {
        this.updatePageInformation();
        this.areasFormacionTableIsLoading.set(false);
      }
    });
  }


  private consultarCamposformacionPorPaginacion(page: number, pageSize: number, field: string, asc: boolean) {
    this.areasFormacionTableIsLoading.set(true);
    this.campoFormacionService.consultarCamposFormacion(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListCamposFormacion.set(res);

        this.responseListAreasFormacion().content.forEach(af => {
          af.nombreCampoFormacion = this.responseListCamposFormacion().content.find(cf => cf.id == af.idCampoFormacion)?.nombre || '';
        });

        this.updatePageInformation();
        this.areasFormacionTableIsLoading.set(false);
      },
      error: (e) => {
        this.updatePageInformation();
        this.areasFormacionTableIsLoading.set(false);
      }
    });
  }



  updatePageInformation(): void {
   if(this.responseListAreasFormacion() && this.responseListAreasFormacion().content.length > 0) {
      this.filterPaginationDTO.set(new FilterPaginationDTO({
        ...this.filterPaginationDTO(),
        totalItems: this.responseListAreasFormacion().totalRecordCount,
        pages: Array.from({ length: this.responseListAreasFormacion().totalPages }, (_, i) => i + 1),
      }));
    }
  }


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


  consultarAsignaturasPorAreaFormacion(areaFormacion: AreaFormacion) {
    this.swalAsignaturasIsLoading.set(true);
    this.asignaturaService.consultarAsignaturasPorAreaFormacion(areaFormacion.nombre, 1, 100, 'codigo', true).subscribe({
      next: (res) => {
        this.responseListAsignaturas.set(res);
        this.swalAsignaturasIsLoading.set(false);
        this.showSwalAsignaturasAsignadas(areaFormacion, this.responseListAsignaturas().content);
      },
      error: (e) => {
        this.swalAsignaturasIsLoading.set(false);
      }
    });
  }


  showSwalAsignaturasAsignadas(areaFormacion: AreaFormacion, asignaturas: Asignatura[]) {
    let html = `
      <div style="max-height: 300px; overflow-y: auto;">
        <ul style='list-style: none; padding-left: 0;'>
    `;

    if(this.swalAsignaturasIsLoading()) {
      html += `
      <div class="spinner-container">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>`;
    }
    else {
      for (let asignatura of asignaturas) {
        html += `
          <li class='mb-3'>
            <a href="${APP_CONSTANTS.ROUTES.asignaturasLista}?pageSize=200&searchTerm=${encodeURIComponent(asignatura.nombre)}">
              ${asignatura.nombre}
            </a>
          </li>
        `;
      }
    }

    html += `
        </ul>
      </div>
    `;

    Swal.fire({
      title: `Asignaturas de ${areaFormacion.nombre}`,
      html: html,
      draggable: true
    });
  }

}
