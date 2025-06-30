import { ChangeDetectionStrategy, Component, Input, input } from '@angular/core';

@Component({
  selector: 'app-contextual-menu',
  imports: [],
  templateUrl: './contextual-menu.component.html',
  styleUrl: './contextual-menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextualMenuComponent { 

  @Input() menuVisible = false;
  @Input() menuX = 0;
  @Input() menuY = 0;

  clickedData: any = null;


  ngOnInit() {
  }

  onGlobalContextMenu(event: MouseEvent) {
    event.preventDefault(); // Evita menú del navegador si no se hace en burbuja
    this.menuVisible = false;
  }


  onOptionSelected(action: string) {
    if (action === 'ver') {
      alert(`Detalles de: ${this.clickedData.name}`);
    } 
    else if (action === 'ir') {
      window.open(this.clickedData.link, '_blank');
    }
    
    this.menuVisible = false;
  }

}
