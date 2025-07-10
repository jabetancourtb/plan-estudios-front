import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoaderService } from '../../../../services/loader.service';
import { AsignaturaService } from '../../../../services/asignatura.service';
import { ResponseListDTO } from '../../../../dto/response-list.model';
import { Asignatura } from '../../../../models/asignatura.model';
import { NavbarComponent } from "../../../../shared/components/navbar/navbar.component";
import { FilterAllFieldsPipe } from '../../../../pipes/filter-all-fields.pipe';


@Component({
  selector: 'app-asignaturas-lista',
  imports: [NavbarComponent, FormsModule, FilterAllFieldsPipe],
  templateUrl: './asignaturas-lista.component.html',
  styleUrl: './asignaturas-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsignaturasListaComponent {

  private router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private loaderService: LoaderService = inject(LoaderService);
  private asignaturaService: AsignaturaService = inject(AsignaturaService);

  responseListAsignaturas = signal<ResponseListDTO<Asignatura>>({
    recordCountPerPage: 0,
    totalRecordCount: 0,
    totalPages: 0,
    content: []
  });

  asignatura = signal<Asignatura>({} as Asignatura);

  searchTerm = '';
  field = 'codigo';
  ascending = true;
  currentPage = 1;
  pageSize = 10;
  totalPages: number[] = [];
  pageSizeOptions = [10, 25, 50, 100];

  fieldsOptions = [
    { value: 'codigo', label: 'Código' },
    { value: 'nombre', label: 'Nombre' },
    { value: 'semestreAsignatura', label: 'Semestre' },
    { value: 'carrera', label: 'Carrera' },
    { value: 'campoFormacion', label: 'Campo de Formación' },
    { value: 'areaFormacion', label: 'Área de Formación' },
    { value: 'codigoCondor', label: 'Código Condor' },
    { value: 'numeroCreditos', label: 'Créditos' },
    { value: 'HTD', label: 'HTD' },
    { value: 'HTC', label: 'HTC' },
    { value: 'HTA', label: 'HTA' },
    { value: 'tipo', label: 'Tipo' }
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
      this.field = params['field'] || 'codigo';
      this.ascending = params['ascending'] || true ;
      this.searchTerm = params['searchTerm'] || '';

      this.consultarAsignaturasPorPaginacion(this.currentPage, this.pageSize, this.field, this.ascending);
    });
  }


  private consultarAsignaturasPorPaginacion(page: number, pageSize: number, field: string, asc: boolean) {
    this.loaderService.show();
    this.asignaturaService.consultarAsignaturas(page, pageSize, field, asc).subscribe({
      next: (res) => {
        this.responseListAsignaturas.set(res);
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
    if(this.responseListAsignaturas().content.length > 0) {
      this.totalPages = Array.from({ length: this.responseListAsignaturas().totalPages }, (_, i) => i + 1);
    }
  }


  updateFilters(): void {
    this.consultarAsignaturasPorPaginacion(1, this.pageSize, this.field, this.ascending);
  }


  cleanFilters() {
    this.pageSize = 10;
    this.field = 'codigo';
    this.ascending = true;
    this.searchTerm = '';
    this.consultarAsignaturasPorPaginacion(1, this.pageSize, this.field, this.ascending);
  }


  goToPreviousPage(page: number) {
    if(page == 0) {
      return;
    }

    this.consultarAsignaturasPorPaginacion(page, this.pageSize, this.field, this.ascending);
  }


  goToNextPage(page: number) {
    if(page > this.responseListAsignaturas().totalPages) {
      return;
    }

    this.consultarAsignaturasPorPaginacion(page, this.pageSize, this.field, this.ascending);
  }


  goToPage(page: number) {
    this.consultarAsignaturasPorPaginacion(page, this.pageSize, this.field, this.ascending);
  }


}
