import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { APP_CONSTANTS } from '../../../utils/app-constants';

@Component({
  selector: 'app-asignaturas-index',
  imports: [NavbarComponent, MatSlideToggleModule, MatCardModule, MatButtonModule],
  templateUrl: './asignaturas-index.component.html',
  styleUrl: './asignaturas-index.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsignaturasIndexComponent {

  router = inject(Router);


  // Redirige a / luego redigecciona a la ruta deseada
  goToAsignaturasBubbleChart() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([APP_CONSTANTS.ROUTES.asignaturasBubbleChart]);
    });
  }

  // Redirige a / luego redigecciona a la ruta deseada
  goToAsignaturasTreeChart() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([APP_CONSTANTS.ROUTES.asignaturasTreeChart]);
    });
  }


  // Redirige a / luego redigecciona a la ruta deseada
  goToAsignaturasLista() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([APP_CONSTANTS.ROUTES.asignaturasLista]);
    });
  }

}
