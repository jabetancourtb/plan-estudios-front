import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavbarComponent } from "../../shared/components/navbar/navbar.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";


@Component({
  selector: 'app-index',
  imports: [NavbarComponent, FooterComponent],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndexComponent {


}
