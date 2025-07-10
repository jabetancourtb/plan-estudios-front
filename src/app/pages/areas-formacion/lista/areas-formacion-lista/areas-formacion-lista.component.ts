import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { FilterAllFieldsPipe } from '../../../../pipes/filter-all-fields.pipe';
import { NgStyle } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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
  currentPage = 1;
  pageSize = 10;
  totalPages: number[] = [];
  pageSizeOptions = [10, 25];


  ngOnInit() {
    this.currentPage = 1;
    this.consultarQueryParams();
  }


  consultarQueryParams() {
    this.activatedRoute.queryParams.subscribe(params => {

      this.currentPage = params['page'] ? +params['page'] : 1;
      this.pageSize = params['pageSize'] ? +params['pageSize'] : 10;
      const field = params['field'] || 'id';
      const asc = params['asc'] || true ;
      this.searchTerm = params['searchTerm'] || '';

      this.consultarAreasformacionPorPaginacion(this.currentPage, this.pageSize, field, asc);
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
    this.totalPages = Array.from({ length: this.responseListAreasFormacion().totalPages }, (_, i) => i + 1);
    this.currentPage = page
  }


  updatePageSize(): void {
    this.consultarAreasformacionPorPaginacion(1, this.pageSize, 'id', true);
  }


  goToPreviousPage(page: number) {
    if(page == 0) {
      return;
    }

    this.consultarAreasformacionPorPaginacion(page, this.pageSize, 'id', true);
  }


  goToNextPage(page: number) {
    if(page > this.responseListAreasFormacion().totalPages) {
      return;
    }

    this.consultarAreasformacionPorPaginacion(page, this.pageSize, 'id', true);
  }


  goToPage(page: number) {
    this.consultarAreasformacionPorPaginacion(page, this.pageSize, 'id', true);
  }
}
