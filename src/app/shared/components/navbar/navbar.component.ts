import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FooterComponent } from "../footer/footer.component";

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
        this.router.navigate(['/bubble-chart/campos-formacion']);
    });
  }


  // Redirige a / luego redigecciona a la ruta deseada
  goToAreasFormacionBubbleChart() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/bubble-chart/areas-formacion']);
    });
  }


  // Redirige a / luego redigecciona a la ruta deseada
  goToAsignaturasBubbleChart() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/bubble-chart/asignaturas']);
    });
  }


   // Redirige a / luego redigecciona a la ruta deseada
  goToPlanEstudiosBubbleChart() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/circle-packing/plan-estudios']);
    });
  }

}
