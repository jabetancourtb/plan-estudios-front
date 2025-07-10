export interface Asignatura {
  codigo: number;
  carrera: string;
  semestreAsignatura: number;
  codigoCondor: number;
  campoFormacion: string;
  areaFormacion: string;
  EspacioAcademico: string;
  Tipo: string;
  nombre: string;
  numeroCreditos: number;
  HTD: number;
  HTC: number;
  HTA: number;
  clasificacionCondor: string;
  clasificacionEspacio: number;
  ObligatorioBasico: string;
  ObligatorioComplementario: string;
  ElectivoIntrinseco: string;
  ElectivoExtrinseco: string;
  justificacion?: string; // Opcional, ya que en Java no tiene @NotBlank ni @NotNull
}
