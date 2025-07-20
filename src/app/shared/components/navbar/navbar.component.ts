import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FooterComponent } from "../footer/footer.component";
import { APP_CONSTANTS } from '../../../utils/app-constants';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, FooterComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {

  router = inject(Router);

  menuOpen = false;


  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }


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
