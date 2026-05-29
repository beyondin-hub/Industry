// Horario hábil Novak: Lun-Vie 8:00-18:00 (hora local).
const HORA_INICIO = 8;
const HORA_FIN = 18;

/**
 * Calcula la fecha límite de cotización agregando `horas` hábiles a partir de `desde`,
 * respetando horario laboral (Lun-Vie 8-18). Cumple la Garantía Purple Cow de 2h.
 */
export function deadlineHabil(horas: number, desde: Date = new Date()): Date {
  const d = new Date(desde);
  let restante = horas * 60; // minutos

  while (restante > 0) {
    const dia = d.getDay(); // 0=Dom, 6=Sáb
    const finde = dia === 0 || dia === 6;
    const dentroHorario = d.getHours() >= HORA_INICIO && d.getHours() < HORA_FIN;

    if (finde || !dentroHorario) {
      // Avanzar al siguiente inicio de jornada hábil.
      d.setMinutes(0, 0, 0);
      if (d.getHours() >= HORA_FIN) {
        d.setDate(d.getDate() + 1);
      }
      d.setHours(HORA_INICIO, 0, 0, 0);
      // Saltar fines de semana.
      while (d.getDay() === 0 || d.getDay() === 6) {
        d.setDate(d.getDate() + 1);
      }
      continue;
    }

    // Consumir hasta el fin de jornada o lo que reste.
    const minHastaFin = (HORA_FIN - d.getHours()) * 60 - d.getMinutes();
    const consumo = Math.min(restante, minHastaFin);
    d.setMinutes(d.getMinutes() + consumo);
    restante -= consumo;
  }

  return d;
}
