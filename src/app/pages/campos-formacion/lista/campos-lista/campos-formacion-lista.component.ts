import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from '../../../../services/loader.service';
import { CampoFormacionService } from '../../../../services/campo-formacion.service';
import { ResponseListDTO } from '../../../../dto/response-list.model';
import { CampoFormacion } from '../../../../models/campo-formacion.model';
import { NavbarComponent } from "../../../../shared/components/navbar/navbar.component";
import { FormsModule } from '@angular/forms';
import { FilterAllFieldsPipe } from '../../../../pipes/filter-all-fields.pipe';
import { NgStyle } from '@angular/common';
import { FilterPaginationDTO } from '../../../../dto/filter-pagination.model';
import { FilterPaginationComponent } from '../../../../shared/components/filter-pagination/filter-pagination.component';
import { PaginationComponent } from "../../../../shared/components/pagination/pagination.component";
import { AreaFormacionService } from '../../../../services/area-formacion.service';
import { AsignaturaService } from '../../../../services/asignatura.service';
import { AreaFormacion } from '../../../../models/area-formacion.model';
import { Asignatura } from '../../../../models/asignatura.model';
import Swal from 'sweetalert2';
import { APP_CONSTANTS } from '../../../../utils/app-constants';

@Component({
  selector: 'app-campos-formacion-lista',
  imports: [NavbarComponent, FormsModule, FilterAllFieldsPipe, NgStyle, FilterPaginationComponent, PaginationComponent],
  templateUrl: './campos-formacion-lista.component.html',
  styleUrl: './campos-formacion-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CamposFormacionListaComponent {

  private router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private loaderService: LoaderService = inject(LoaderService);
  private campoFormacionService: CampoFormacionService = inject(CampoFormacionService);
  private areaFormacionService: AreaFormacionService = inject(AreaFormacionService);
  private asignaturaService: AsignaturaService = inject(AsignaturaService);

  responseListCamposFormacion = signal<ResponseListDTO<CampoFormacion>>({
    recordCountPerPage: 0,
    totalRecordCount: 0,
    totalPages: 0,
    content: []
  });

  campoFormacion = signal<CampoFormacion>({} as CampoFormacion);

  filterPaginationDTO = signal<FilterPaginationDTO>(new FilterPaginationDTO());

  fieldsOptions = [
    { value: 'id', label: 'Id' },
    { value: 'nombre', label: 'Nombre' },
    { value: 'color', label: 'Color' },
    { value: 'cantidadAreasFormacion', label: 'Cantidad de áreas de Formación' },
    { value: 'cantidadAsignaturas', label: 'Cantidad de asignaturas' },
    { value: 'verAreasFormacion', label: 'Ver áreas de formación asignadas' },
    { value: 'asignaturasAsignadas', label: 'Ver asignaturas asignadas' }
  ];

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

      this.consultarCamposformacionPorPaginacion(
        this.filterPaginationDTO().currentPage,
        this.filterPaginationDTO().pageSize,
        this.filterPaginationDTO().field ,
        this.filterPaginationDTO().ascending
      );
    });
  }


  private consultarCamposformacionPorPaginacion(page: number, pageSize: number, field: string, asc: boolean) {
    this.loaderService.show();
    this.campoFormacionService.consultarCamposFormacion(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListCamposFormacion.set(res);
        this.updatePageInformation();
        this.loaderService.hide();
      },
      error: (e) => {
        this.updatePageInformation();
        this.loaderService.hide();
      }
    });
  }


  updatePageInformation(): void {
    if(this.responseListCamposFormacion() && this.responseListCamposFormacion().content.length > 0) {
      this.filterPaginationDTO.set(new FilterPaginationDTO({
        ...this.filterPaginationDTO(),
        totalItems: this.responseListCamposFormacion().totalRecordCount,
        pages: Array.from({ length: this.responseListCamposFormacion().totalPages }, (_, i) => i + 1),
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


  consultarAreasFormacionPorCampoFormacion(campoFormacion: CampoFormacion) {
    this.loaderService.show();
    this.areaFormacionService.consultarAreasFormacionPorIdCampoFormacion(campoFormacion.id, 1, 100, 'id', true).subscribe({
      next: (res) => {
        this.responseListAreasFormacion.set(res);
        this.showSwalAreasFormacionAsignadas(campoFormacion, this.responseListAreasFormacion().content);
        this.loaderService.hide();
      },
      error: (e) => {
        this.loaderService.hide();
      }
    });
  }


  showSwalAreasFormacionAsignadas(campoFormacion: CampoFormacion, areasFormacion: AreaFormacion[]) {
    let html = `
      <div style="max-height: 300px; overflow-y: auto;">
        <ul style='list-style: none; padding-left: 0;'>
    `;

    for (let areaFormacion of areasFormacion) {
      html += `
        <li class='mb-3'>
          <a href="${APP_CONSTANTS.ROUTES.areasFormacionLista}?pageSize=50&searchTerm=${encodeURIComponent(areaFormacion.nombre)}">
            ${areaFormacion.nombre}
          </a>
        </li>
      `;
    }

    html += `
        </ul>
      </div>
    `;

    Swal.fire({
      title: `areas de formación de ${campoFormacion.nombre}`,
      html: html
    });
  }


  consultarAsignaturasPorCampoFormacion(campoFormacion: CampoFormacion) {
    this.loaderService.show();
    this.asignaturaService.consultarAsignaturasPorCampoFormacion(campoFormacion.nombre, 1, 100, 'codigo', true).subscribe({
      next: (res) => {
        this.responseListAsignaturas.set(res);
        this.showSwalAsignaturasAsignadas(campoFormacion, this.responseListAsignaturas().content);
        this.loaderService.hide();
      },
      error: (e) => {
        this.loaderService.hide();
      }
    });
  }


  showSwalAsignaturasAsignadas(campoFormacion: CampoFormacion, asignaturas: Asignatura[]) {
    let html = `
      <div style="max-height: 300px; overflow-y: auto;">
        <ul style='list-style: none; padding-left: 0;'>
    `;

    for (let asignatura of asignaturas) {
      html += `
        <li class='mb-3'>
          <a href="${APP_CONSTANTS.ROUTES.asignaturasLista}?pageSize=200&searchTerm=${encodeURIComponent(asignatura.nombre)}">
            ${asignatura.nombre}
          </a>
        </li>
      `;
    }

    html += `
        </ul>
      </div>
    `;

    Swal.fire({
      title: `Asignaturas de ${campoFormacion.nombre}`,
      html: html
    });
  }

}
