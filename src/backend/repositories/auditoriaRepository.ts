import { v7 as uuidv7 } from 'uuid';
import db from '../config/database';

export interface RegistroAuditoria {
  usuario_id?: string | null;
  usuario_nome?: string | null;
  perfil?: string | null;
  acao: string;
  entidade_tipo?: string | null;
  entidade_id?: string | null;
  metodo?: string | null;
  rota?: string | null;
  status_http?: number | null;
  detalhes?: any;
}

class AuditoriaRepository {
  registrar(registro: RegistroAuditoria) {
    const id = uuidv7();
    db.prepare(`
      INSERT INTO auditoria_acoes (
        id, usuario_id, usuario_nome, perfil, acao, entidade_tipo, entidade_id,
        metodo, rota, status_http, detalhes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      registro.usuario_id || null,
      registro.usuario_nome || null,
      registro.perfil || null,
      registro.acao,
      registro.entidade_tipo || null,
      registro.entidade_id || null,
      registro.metodo || null,
      registro.rota || null,
      registro.status_http || null,
      registro.detalhes ? JSON.stringify(registro.detalhes).slice(0, 2000) : null,
    );
    return id;
  }

  listar(limite = 200) {
    return db.prepare(`
      SELECT *
      FROM auditoria_acoes
      ORDER BY criado_em DESC
      LIMIT ?
    `).all(Math.min(Math.max(Number(limite) || 200, 1), 500));
  }
}

export default new AuditoriaRepository();
