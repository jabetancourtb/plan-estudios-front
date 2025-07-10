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

@Component({
  selector: 'app-areas-formacion-lista',
  imports: [NavbarComponent, FormsModule, FilterAllFieldsPipe, NgStyle],
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

  searchTerm = '';
  field = 'id';
  ascending = true;
  currentPage = 1;
  pageSize = 10;
  totalPages: number[] = [];
  pageSizeOptions = [10, 25, 50, 100];

  fieldsOptions = [
    { value: 'id', label: 'Id' },
    { value: 'idCampoFormacion', label: 'Id campo de formación' },
    { value: 'nombre', label: 'Nombre' },
    { value: 'color', label: 'Color' },
    { value: 'cantidadAsignaturas', label: 'Cantidad de asignaturas' }
  ];

  ascendingOptions = [
    { value: true, label: 'Ascendente' },
    { value: false, label: 'Descendente' }
  ];


  ngOnInit() {
    this.consultarQueryParams();
  }


  consultarQueryParams() {
    this.activatedRoute.queryParams.subscribe(params => {

      this.currentPage = params['page'] ? +params['page'] : 1;
      this.pageSize = params['pageSize'] ? +params['pageSize'] : 10;
      this.field = params['field'] || 'id';
      this.ascending = params['ascending'] || true ;
      this.searchTerm = params['searchTerm'] || '';

      this.consultarAreasformacionPorPaginacion(this.currentPage, this.pageSize, this.field, this.ascending);
    });
  }


  private consultarAreasformacionPorPaginacion(page: number, pageSize: number, field: string, asc: boolean) {
    this.loaderService.show();
    this.areaFormacionService.consultarAreasFormacion(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListAreasFormacion.set(res);
        this.updatePageInformation(page);
        this.loaderService.hide();
      },
      error: (e) => {
        this.loaderService.hide();
      }
    });
  }


  updatePageInformation(page: number): void {
    this.currentPage = page;
    this.setQueryParams();
    this.loadOptions();
  }


  setQueryParams() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        page: this.currentPage,
        pageSize: this.pageSize,
        field: this.field,
        ascending: this.ascending,
        searchTerm: this.searchTerm
      },
      queryParamsHandling: 'merge' // para mantener otros parámetros existentes
    });
  }


  loadOptions() {
    if(this.responseListAreasFormacion().content.length > 0) {
      this.totalPages = Array.from({ length: this.responseListAreasFormacion().totalPages }, (_, i) => i + 1);
    }
  }


  updateFilters(): void {
    this.consultarAreasformacionPorPaginacion(1, this.pageSize, this.field, true);
  }


  cleanFilters() {
    this.pageSize = 10;
    this.field = 'id';
    this.ascending = true;
    this.searchTerm = '';
    this.consultarAreasformacionPorPaginacion(1, this.pageSize, this.field, this.ascending);
  }


  goToPreviousPage(page: number) {
    if(page == 0) {
      return;
    }

    this.consultarAreasformacionPorPaginacion(page, this.pageSize, this.field, this.ascending);
  }


  goToNextPage(page: number) {
    if(page > this.responseListAreasFormacion().totalPages) {
      return;
    }

    this.consultarAreasformacionPorPaginacion(page, this.pageSize, this.field, this.ascending);
  }


  goToPage(page: number) {
    this.consultarAreasformacionPorPaginacion(page, this.pageSize, this.field, this.ascending);
  }

}
