import db from '../config/database';

function totalPorGrupo(grupoId: string): number {
  const row = db.prepare(`
    SELECT COALESCE(SUM(quantidade), 0) AS total
    FROM movimentacoes
    WHERE grupo_id = ?
  `).get(grupoId) as { total?: number } | undefined;

  return Number(row?.total || 0);
}

/**
 * Vincula duas boletas de transferência (envio e recebimento) e marca conflito
 * quando as quantidades totais divergem.
 */
export function vincularTransferenciaBilateral(grupoOrigem: string, grupoDestino: string) {
  const totalOrigem = totalPorGrupo(grupoOrigem);
  const totalDestino = totalPorGrupo(grupoDestino);
  const conflito = totalOrigem !== totalDestino;

  db.prepare(`
    UPDATE movimentacoes
    SET transferencia_par_grupo_id = ?, transferencia_confirmada = 1, transferencia_conflito = ?
    WHERE grupo_id = ?
  `).run(grupoDestino, conflito ? 1 : 0, grupoOrigem);

  db.prepare(`
    UPDATE movimentacoes
    SET transferencia_par_grupo_id = ?, transferencia_confirmada = 1, transferencia_conflito = ?
    WHERE grupo_id = ?
  `).run(grupoOrigem, conflito ? 1 : 0, grupoDestino);

  return { conflito, totalOrigem, totalDestino };
}
