import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  asc = true;
  currentPage = 1;
  pageSize = 10;
  totalPages: number[] = [];
  pageSizeOptions = [10, 25, 50, 100];


  ngOnInit() {
    this.currentPage = 1;
    this.consultarQueryParams();
  }


  consultarQueryParams() {
    this.activatedRoute.queryParams.subscribe(params => {

      this.currentPage = params['page'] ? +params['page'] : 1;
      this.pageSize = params['pageSize'] ? +params['pageSize'] : 10;
      this.field = params['field'] || 'id';
      this.asc = params['asc'] || true ;
      this.searchTerm = params['searchTerm'] || '';

      this.consultarCamposformacionPorPaginacion(this.currentPage, this.pageSize, this.field, this.asc);
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
        this.loaderService.hide();
      }
    });
  }


  updatePageInformation(page: number): void {
    this.totalPages = Array.from({ length: this.responseListCamposFormacion().totalPages }, (_, i) => i + 1);
    this.currentPage = page
  }


  updatePageSize(): void {
    //this.consultarCamposformacionPorPaginacion(1, this.pageSize, 'id', true);
  }


  goToPreviousPage(page: number) {
    if(page == 0) {
      return;
    }

    this.consultarCamposformacionPorPaginacion(page, this.pageSize, this.field, this.asc);
  }


  goToNextPage(page: number) {
    if(page > this.responseListCamposFormacion().totalPages) {
      return;
    }

    this.consultarCamposformacionPorPaginacion(page, this.pageSize, this.field, this.asc);
  }


  goToPage(page: number) {
    this.consultarCamposformacionPorPaginacion(page, this.pageSize, this.field, this.asc);
  }

}
