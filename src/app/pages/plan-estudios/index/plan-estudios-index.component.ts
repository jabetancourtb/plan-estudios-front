import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { APP_CONSTANTS } from '../../../utils/app-constants';

@Component({
  selector: 'app-plan-estudios-index',
  imports: [NavbarComponent, MatSlideToggleModule, MatCardModule, MatButtonModule],
  templateUrl: './plan-estudios-index.component.html',
  styleUrl: './plan-estudios-index.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanEstudiosIndexComponent {

  router = inject(Router);


  // Redirige a / luego redigecciona a la ruta deseada
  goToPlanEstudiosSemestres() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([APP_CONSTANTS.ROUTES.planEstudiosSemestres]);
    });
  }


  // Redirige a / luego redigecciona a la ruta deseada
  goToPlanEstudiosCirclePacking() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([APP_CONSTANTS.ROUTES.planEstudiosCirclePacking]);
    });
  }





 }
