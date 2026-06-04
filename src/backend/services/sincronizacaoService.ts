import sincronizacaoRepository from '../repositories/sincronizacaoRepository';

class SincronizacaoService {
  async processarLote(lote: any[]): Promise<any> {
    const resultados: any[] = [];

    for (const item of lote) {
      let entidade_id: string | null = null;

      switch (item.tipo) {
        case 'TAREFA':
          entidade_id = await sincronizacaoRepository.inserirTarefa(item.dados);
          break;

        case 'ALERTA':
          entidade_id = await sincronizacaoRepository.inserirAlerta(item.dados);
          break;

        case 'MOVIMENTACAO':
          entidade_id = await sincronizacaoRepository.inserirMovimentacao(item.dados);
          break;

        case 'EVIDENCIA':
          entidade_id = await sincronizacaoRepository.inserirEvidencia(item.dados);
          break;

        default:
          throw new Error(`Tipo de sincronização inválido: ${item.tipo}`);
      }

      await sincronizacaoRepository.registrar(
        item.tipo,
        entidade_id,
        'SINCRONIZADO'
      );

      resultados.push({
        tipo: item.tipo,
        entidade_id,
        status: 'SINCRONIZADO'
      });
    }

    return {
      sucesso: true,
      total_processado: resultados.length,
      resultados
    };
  }
}

export default new SincronizacaoService();