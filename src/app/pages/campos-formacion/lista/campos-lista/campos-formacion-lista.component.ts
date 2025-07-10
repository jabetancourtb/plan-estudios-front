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

@Component({
  selector: 'app-campos-formacion-lista',
  imports: [NavbarComponent, FormsModule, FilterAllFieldsPipe, NgStyle],
  templateUrl: './campos-formacion-lista.component.html',
  styleUrl: './campos-formacion-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CamposFormacionListaComponent {

  private router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private loaderService: LoaderService = inject(LoaderService);
  private campoFormacionService: CampoFormacionService = inject(CampoFormacionService);

  responseListCamposFormacion = signal<ResponseListDTO<CampoFormacion>>({
    recordCountPerPage: 0,
    totalRecordCount: 0,
    totalPages: 0,
    content: []
  });

  campoFormacion = signal<CampoFormacion>({} as CampoFormacion);

  searchTerm = '';
  field = 'id';
  ascending = true;
  currentPage = 1;
  pageSize = 10;
  totalPages: number[] = [];
  pageSizeOptions = [10, 25, 50, 100];

  fieldsOptions = [
    { value: 'id', label: 'Id' },
    { value: 'nombre', label: 'Nombre' },
    { value: 'color', label: 'Color' },
    { value: 'cantidadAreasFormacion', label: 'Cantidad de áreas de Formación' },
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

      this.consultarCamposformacionPorPaginacion(this.currentPage, this.pageSize, this.field, this.ascending);
    });
  }


  private consultarCamposformacionPorPaginacion(page: number, pageSize: number, field: string, asc: boolean) {
    this.loaderService.show();
    this.campoFormacionService.consultarCamposFormacion(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListCamposFormacion.set(res);
        this.updatePageInformation(page);
        this.loaderService.hide();
      },
      error: (e) => {
        this.updatePageInformation(page);
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
    if(this.responseListCamposFormacion().content.length > 0) {
      this.totalPages = Array.from({ length: this.responseListCamposFormacion().totalPages }, (_, i) => i + 1);
    }
  }


  updateFilters(): void {
    this.consultarCamposformacionPorPaginacion(1, this.pageSize, this.field, true);
  }


  cleanFilters() {
    this.pageSize = 10;
    this.field = 'id';
    this.ascending = true;
    this.searchTerm = '';
    this.consultarCamposformacionPorPaginacion(1, this.pageSize, this.field, this.ascending);
  }


  goToPreviousPage(page: number) {
    if(page == 0) {
      return;
    }

    this.consultarCamposformacionPorPaginacion(page, this.pageSize, this.field, this.ascending);
  }


  goToNextPage(page: number) {
    if(page > this.responseListCamposFormacion().totalPages) {
      return;
    }

    this.consultarCamposformacionPorPaginacion(page, this.pageSize, this.field, this.ascending);
  }


  goToPage(page: number) {
    this.consultarCamposformacionPorPaginacion(page, this.pageSize, this.field, this.ascending);
  }

}
