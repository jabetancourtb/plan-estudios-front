import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LoaderService } from '../../../services/loader.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-loader',
  imports: [AsyncPipe],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent {

  visible = false;

  loaderService: LoaderService = inject(LoaderService);
  
  ngOnInit() {
    this.loaderService.loading$.subscribe(loading => {
      this.visible = loading;
    });
  }

}
