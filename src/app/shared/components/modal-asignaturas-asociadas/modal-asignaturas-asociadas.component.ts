import { ChangeDetectionStrategy, Component, output, signal, ViewChild } from '@angular/core';
import { AsignaturasAsociadasComponent } from '../asignaturas-asociadas/asignaturas-asociadas.component';
import { Asignatura } from '../../../models/asignatura.model';

@Component({
  selector: 'app-modal-asignaturas-asociadas',
  imports: [AsignaturasAsociadasComponent],
  templateUrl: `./modal-asignaturas-asociadas.component.html`,
  styleUrl: './modal-asignaturas-asociadas.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalAsignaturasAsociadasComponent {

  @ViewChild(AsignaturasAsociadasComponent, { static: false }) asignaturasAsociadas!: AsignaturasAsociadasComponent;

  showModal = signal<boolean>(false);

  asignatura = signal<Asignatura>({} as Asignatura);

  confirm = output<boolean>();
  close = output<boolean>();

  mostrarComponenteHijo = false;

  onClose() {
    this.removeGraph();
    this.showModal.set(false);
    this.close.emit(false);
  }


  onConfirm() {
    this.showModal.set(false);
    this.confirm.emit(true);
  }


  public verAsignaturasAsociadas(asignatura: Asignatura) {
    this.showModal.set(true);
    this.asignatura.set(asignatura);
    this.mostrarComponenteHijo = true;

    setTimeout(() => {
      this.asignaturasAsociadas.consultarCamposFormacion();
    });
  }


  removeGraph() {
    this.asignatura = signal<Asignatura>({} as Asignatura);
  }

}
