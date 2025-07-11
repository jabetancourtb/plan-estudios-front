import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { FilterAllFieldsPipe } from '../../../../pipes/filter-all-fields.pipe';
import { NgStyle } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from '../../../../services/loader.service';
import { AreaFormacionService } from '../../../../services/area-formacion.service';
import { AreaFormacion } from '../../../../models/area-formacion.model';
import { ResponseListDTO } from '../../../../dto/response-list.model';
import { FilterPaginationDTO } from '../../../../dto/filter-pagination.model';
import { FilterPaginationComponent } from "../../../../shared/components/filter-pagination/filter-pagination.component";
import { PaginationComponent } from "../../../../shared/components/pagination/pagination.component";

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
  private loaderService: LoaderService = inject(LoaderService);
  private areaFormacionService: AreaFormacionService = inject(AreaFormacionService);

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
    { value: 'nombre', label: 'Nombre' },
    { value: 'color', label: 'Color' },
    { value: 'cantidadAsignaturas', label: 'Cantidad de asignaturas' }
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
    this.loaderService.show();
    this.areaFormacionService.consultarAreasFormacion(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListAreasFormacion.set(res);
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
   if(this.responseListAreasFormacion().content.length > 0) {
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

}
