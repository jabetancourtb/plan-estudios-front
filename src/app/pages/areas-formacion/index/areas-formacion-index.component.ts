import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { APP_CONSTANTS } from '../../../utils/app-constants';

@Component({
  selector: 'app-areas-formacion-index',
  imports: [NavbarComponent, MatSlideToggleModule, MatCardModule, MatButtonModule],
  templateUrl: './areas-formacion-index.component.html',
  styleUrl: './areas-formacion-index.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AreasFormacionIndexComponent {

  router = inject(Router);


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

}
