/**
 * Interceptador de Requisições Offline
 * Monitora a conectividade e salva requisições falhas na fila sync_queue
 */

let isOnline = navigator.onLine;

// Atualizar status quando mudar conectividade
window.addEventListener('online', () => {
  isOnline = true;
  console.log('[Offline Interceptor] Voltou online - iniciando sincronização');
  atualizarStatusBadge();
  sincronizarFilaPendente();
});

window.addEventListener('offline', () => {
  isOnline = false;
  console.log('[Offline Interceptor] Ficou offline - futuras requisições serão salvas localmente');
  atualizarStatusBadge();
});

/**
 * Fazer requisição com tratamento offline
 * Se falhar e estiver offline, salva na fila para sincronizar depois
 */
export async function fazerRequisicaoComOffline(url, opcoes = {}) {
  const { metodo = 'POST', dados = null, tipo = 'chamado' } = opcoes;

  try {
    const response = await fetch(url, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
        ...opcoes.headers,
      },
      body: dados ? JSON.stringify(dados) : null,
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const resultado = await response.json();
    console.log('[Offline Interceptor] Requisição bem-sucedida', resultado);
    return { sucesso: true, dados: resultado };
  } catch (erro) {
    console.error('[Offline Interceptor] Erro na requisição:', erro);

    // Se estiver offline, salvar na fila
    if (!isOnline) {
      console.log('[Offline Interceptor] Dispositivo offline - salvando na fila local');
      try {
        const id = await salvarNaFila(tipo, {
          url,
          metodo,
          dados,
          tentativas: 0,
          ultimaTentativa: new Date().toISOString(),
        });

        return {
          sucesso: false,
          offline: true,
          mensagem: 'Operação salva localmente. Será sincronizada quando houver conexão.',
          idFila: id,
        };
      } catch (erroDb) {
        console.error('[Offline Interceptor] Erro ao salvar na fila:', erroDb);
        return {
          sucesso: false,
          offline: true,
          mensagem: 'Erro ao salvar localmente. Tente novamente.',
        };
      }
    }

    // Se estiver online, retornar erro
    return {
      sucesso: false,
      offline: false,
      mensagem: erro.message,
      erro: erro,
    };
  }
}

/**
 * Sincronizar fila de requisições pendentes
 */
export async function sincronizarFilaPendente() {
  if (!isOnline) {
    console.log('[Sincronização] Dispositivo offline - pulando sincronização');
    return;
  }

  try {
    console.log('[Sincronização] Buscando registros pendentes...');
    const fila = await window.brpecIndexedDb.listarFila();

    if (!fila || fila.length === 0) {
      console.log('[Sincronização] Nenhum registro pendente');
      return;
    }

    console.log(`[Sincronização] Encontrados ${fila.length} registros para sincronizar`);

    let sucessos = 0;
    let erros = 0;

    for (const registro of fila) {
      try {
        const { url, metodo, dados } = registro.dados;

        console.log(`[Sincronização] Sincronizando registro ${registro.id}...`);

        const response = await fetch(url, {
          method: metodo,
          headers: { 'Content-Type': 'application/json' },
          body: dados ? JSON.stringify(dados) : null,
        });

        if (response.ok) {
          // Remover da fila ao sincronizar com sucesso
          await window.brpecIndexedDb.removerFila(registro.id);
          sucessos++;
          console.log(`[Sincronização] Registro ${registro.id} sincronizado com sucesso`);
        } else {
          erros++;
          console.error(`[Sincronização] Erro ao sincronizar ${registro.id}: ${response.status}`);

          // Atualizar tentativas
          registro.dados.tentativas = (registro.dados.tentativas || 0) + 1;
          registro.dados.ultimaTentativa = new Date().toISOString();
          await window.brpecIndexedDb.atualizarFila(registro);
        }
      } catch (erro) {
        erros++;
        console.error(`[Sincronização] Erro ao processar registro ${registro.id}:`, erro);
      }
    }

    console.log(
      `[Sincronização] Concluída - ${sucessos} sucessos, ${erros} erros`
    );
  } catch (erro) {
    console.error('[Sincronização] Erro ao sincronizar:', erro);
  }
}

/**
 * Salvar na fila (wrapper para salvarFila)
 */
async function salvarNaFila(tipo, dados) {
  return window.brpecIndexedDb.salvarFila(tipo, dados);
}

/**
 * Atualizar badge de status online/offline
 */
function atualizarStatusBadge() {
  const badge = document.getElementById('onlineStatus');
  if (badge) {
    if (isOnline) {
      badge.textContent = '🟢 Online';
      badge.style.backgroundColor = '#4CAF50';
    } else {
      badge.textContent = '🔴 Offline';
      badge.style.backgroundColor = '#f44336';
    }
  }
}

/**
 * Verificar se está online
 */
export function estaOnline() {
  return isOnline;
}

/**
 * Forçar sincronização (pode ser chamado manualmente)
 */
export async function forcarSincronizacao() {
  if (isOnline) {
    await sincronizarFilaPendente();
  }
}

// Inicializar status ao carregar
window.addEventListener('load', () => {
  atualizarStatusBadge();

  // Se estiver online ao carregar, sincronizar automaticamente
  if (isOnline) {
    setTimeout(() => {
      sincronizarFilaPendente();
    }, 1000);
  }
});

// Expor globalmente para uso em templates
window.offlineInterceptor = {
  fazerRequisicaoComOffline,
  sincronizarFilaPendente,
  estaOnline,
  forcarSincronizacao,
};
