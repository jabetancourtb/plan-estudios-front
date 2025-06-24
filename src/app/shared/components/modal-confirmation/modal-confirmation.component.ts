import { ChangeDetectionStrategy, Component, Input, output } from '@angular/core';

@Component({
  selector: 'app-modal-confirmation',
  imports: [],
  template: `<p>modal-confirmation works!</p>`,
  styleUrl: './modal-confirmation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalConfirmationComponent { 

  @Input() showModal = false;
  @Input() title = '';
  @Input() message = '';

  confirm = output<boolean>();
  cancel = output<boolean>();


  onCancel() {
    this.showModal = false;
    this.cancel.emit(false);
  }


  onConfirm() {
    this.showModal = false;
    this.confirm.emit(true);
  }

}
