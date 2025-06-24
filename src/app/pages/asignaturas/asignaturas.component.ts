import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsignaturaService } from '../../services/asignatura.service';
import { Asignatura } from '../../models/asignatura.model';
import { ResponseList } from '../../dto/response-list.model';
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { HeaderComponent } from "../../shared/components/header/header.component";
import { BubbleChartComponent } from "../echart/bubble-chart/bubble-chart.component";

@Component({
  selector: 'app-asignaturas',
  imports: [FooterComponent, HeaderComponent, BubbleChartComponent],
  templateUrl: './asignaturas.component.html',
  styleUrl: './asignaturas.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsignaturasComponent { 

  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private asignaturaService: AsignaturaService = inject(AsignaturaService);

  asignaturas = signal<Asignatura[]>([]);

  responseListDTO = signal<ResponseList<Asignatura>>({
    recordCountPerPage: 0,
    totalRecordCount: 0,
    totalPages: 0,
    content: []
  });


  ngOnInit(): void {
    this.consultarAsignaturas(1, 100, 'codigo', true);
    
  }


  private consultarAsignaturasPorCarrera(carrera: string, page: number, pageSize: number, field: string, asc: boolean) {
    this.asignaturaService.consultarAsignaturasPorCarrera(carrera, 1, 100, 'codigo', true).subscribe({
      next: (res) => {
        this.responseListDTO.set(res);
      },
      error: (e) => {

      }
    });
  }

  
  private consultarAsignaturas(page: number, pageSize: number, field: string, asc: boolean) {
    this.asignaturaService.consultarAsignaturas(1, 100, 'codigo', true).subscribe({
      next: (res) => {
        this.responseListDTO.set(res);
      },
      error: (e) => {

      }
    });
  }

}
