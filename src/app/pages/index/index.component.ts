import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavbarComponent } from "../../shared/components/navbar/navbar.component";
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { APP_CONSTANTS } from '../../utils/app-constants';


@Component({
  selector: 'app-index',
  imports: [NavbarComponent, MatSlideToggleModule, MatCardModule, MatButtonModule],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndexComponent {

  router = inject(Router);

  menuOpen = false;


  // Redirige a / luego redigecciona a la ruta deseada
  goToCamposFormacionIndex() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([APP_CONSTANTS.ROUTES.camposFormacionIndex]);
    });
  }


  // Redirige a / luego redigecciona a la ruta deseada
  goToAreasFormacionIndex() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([APP_CONSTANTS.ROUTES.areasFormacionIndex]);
    });
  }


   // Redirige a / luego redigecciona a la ruta deseada
  goToAsignaturasIndex() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([APP_CONSTANTS.ROUTES.asignaturasIndex]);
    });
  }


  // Redirige a / luego redigecciona a la ruta deseada
  goToPlanEstudiosIndex() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([APP_CONSTANTS.ROUTES.planEstudiosIndex]);
    });
  }

}
