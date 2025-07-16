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


  // Redirige a / luego redigecciona a la ruta deseada
  goToAreasFormacionBubbleChart() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([APP_CONSTANTS.ROUTES.areasFormacionBubbleChart]);
    });
  }


  // Redirige a / luego redigecciona a la ruta deseada
  goToAreasFormacionLista() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([APP_CONSTANTS.ROUTES.areasFormacionLista]);
    });
  }


  // Redirige a / luego redigecciona a la ruta deseada
  goToAsignaturasBubbleChart() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([APP_CONSTANTS.ROUTES.asignaturasBubbleChart]);
    });
  }

  // Redirige a / luego redigecciona a la ruta deseada
  goToAsignaturasLista() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([APP_CONSTANTS.ROUTES.asignaturasLista]);
    });
  }


  // Redirige a / luego redigecciona a la ruta deseada
  goToPrerrequisitosTreeChart() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([APP_CONSTANTS.ROUTES.prerrequisitosTreegraphChart]);
    });
  }


   // Redirige a / luego redigecciona a la ruta deseada
  goToPrerrequisitosBuscar() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([APP_CONSTANTS.ROUTES.prerrequisitosBuscar]);
    });
  }


  // Redirige a / luego redigecciona a la ruta deseada
  goToPlanEstudiosCirclePacking() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([APP_CONSTANTS.ROUTES.planEstudiosCirclePacking]);
    });
  }


  // Redirige a / luego redigecciona a la ruta deseada
  goToPlanEstudiosTabla() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([APP_CONSTANTS.ROUTES.planEstudiosTabla]);
    });
  }


}
