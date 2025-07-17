import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Asignatura } from '../../../models/asignatura.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AsignaturasAsociadasComponent } from "../asignaturas-asociadas/asignaturas-asociadas.component";

@Component({
  selector: 'app-modal-asignaturas-asociadas',
  imports: [AsignaturasAsociadasComponent],
  templateUrl: `./modal-asignaturas-asociadas.component.html`,
  styleUrl: './modal-asignaturas-asociadas.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalAsignaturasAsociadasComponent {

  @Input() asignatura: any;

  constructor(public activeModal: NgbActiveModal) {}

  onClose() {
    this.removeGraph();
    this.activeModal.dismiss();
  }

  removeGraph() {
    this.asignatura = {} as Asignatura;
  }

}
