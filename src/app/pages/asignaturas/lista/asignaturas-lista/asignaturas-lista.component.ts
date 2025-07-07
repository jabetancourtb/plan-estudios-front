import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoaderService } from '../../../../services/loader.service';
import { AsignaturaService } from '../../../../services/asignatura.service';
import { ResponseListDTO } from '../../../../dto/response-list.model';
import { Asignatura } from '../../../../models/asignatura.model';
import { NavbarComponent } from "../../../../shared/components/navbar/navbar.component";


@Component({
  selector: 'app-asignaturas-lista',
  imports: [NavbarComponent],
  templateUrl: './asignaturas-lista.component.html',
  styleUrl: './asignaturas-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsignaturasListaComponent {

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
  currentPage = 1;
  pageSize = 10;
  totalPages: number[] = [];


  ngOnInit() {
    this.currentPage = 1;
    this.consultarAsignaturasPorPaginacion(this.currentPage, this.pageSize, 'codigo', true);
  }




  consultarQueryParams() {
    this.activatedRoute.queryParams.subscribe(params => {
      const page = params['page'] ? +params['page'] : 1;
      const pageSize = params['pageSize'] ? +params['pageSize'] : 10;
      const field = params['field'] || 'codigo';
      const asc = params['asc'] === 'true';

      this.consultarAsignaturasPorPaginacion(page, pageSize, field, asc);
    });

    // Si se pasa un código de asignatura, se consulta
    if (this.activatedRoute.snapshot.queryParams['codigo']) {
      const codigo = +this.activatedRoute.snapshot.queryParams['codigo'];
      this.consultarAsignaturaPorCodigo(codigo);
    }
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
        this.loaderService.hide();
      }
    });
  }


  private consultarAsignaturaPorCodigo(codigo: number) {
    this.loaderService.show();
    this.asignaturaService.consultarAsignaturaPorCodigo(codigo).subscribe({
      next: (res) => {
        this.asignatura.set(res);
        this.loaderService.hide();
      },
      error: (e) => {
        this.loaderService.hide();
      }
    });
  }


  updatePageInformation(page: number): void {
    this.totalPages = Array.from({ length: this.responseListAsignaturas().totalPages }, (_, i) => i + 1);
    this.currentPage = page
  }


  goToPreviousPage(page: number) {
    if(page == 0) {
      return;
    }

    this.consultarAsignaturasPorPaginacion(page, this.pageSize, 'codigo', true);
  }


  goToNextPage(page: number) {
    if(page > this.responseListAsignaturas().totalPages) {
      return;
    }

    this.consultarAsignaturasPorPaginacion(page, this.pageSize, 'codigo', true);
  }


  goToPage(page: number) {
    this.consultarAsignaturasPorPaginacion(page, this.pageSize, 'codigo', true);
  }


}
