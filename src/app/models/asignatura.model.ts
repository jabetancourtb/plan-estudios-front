export interface Asignatura {
  codigo: number;
  carrera: string;
  semestre_asignatura: number;
  codigo_condor: number;
  campo_formacion: string;
  area_formacion: string;
  Espacio_Academico: string;
  Tipo: string;
  nombre: string;
  numero_creditos: number;
  HTD: number;
  HTC: number;
  HTA: number;
  clasificacion_condor: string;
  clasificacion_espacio: number;
  Obligatorio_Basico: string;
  Obligatorio_Complementario: string;
  ElectivoIntrinseco: string;
  ElectivoExtrinseco: string;
  justificacion?: string; // Opcional, ya que en Java no tiene @NotBlank ni @NotNull
}