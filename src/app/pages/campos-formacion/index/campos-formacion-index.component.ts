import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { APP_CONSTANTS } from '../../../utils/app-constants';

@Component({
  selector: 'app-campos-formacion-index',
  imports: [NavbarComponent, MatSlideToggleModule, MatCardModule, MatButtonModule],
  templateUrl: './campos-formacion-index.component.html',
  styleUrl: './campos-formacion-index.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CamposFormacionIndexComponent {

  router = inject(Router);


  // Redirige a / luego redigecciona a la ruta deseada
  goToCamposFormacionBubbleChart() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([APP_CONSTANTS.ROUTES.camposFormacionBubbleChart]);
    });
  }


   // Redirige a / luego redigecciona a la ruta deseada
  goToCamposFormacionLista() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([APP_CONSTANTS.ROUTES.camposFormacionLista]);
    });
  }

}
