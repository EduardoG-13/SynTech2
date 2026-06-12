/* Service Worker BRPec — offline-first */
const CACHE_NAME = 'brpec-v6';

// 1) Assets estáticos: cacheados imediatamente na instalação do SW
const ASSETS_ESTATICOS = [
  '/',
  '/public/styles.css',
  '/public/app.js',
  '/public/js/db.js',
  '/public/js/dashboard.js',
  '/public/js/configuracoes.js',
  '/public/js/chamados.js',
  '/public/js/novo-chamado-handler.js',
  '/public/js/chamado-resolver-handler.js',
  '/public/js/offline-interceptor.js',
  '/public/css/dashboard.css',
  '/public/css/tarefas.css',
  '/public/css/nova-os.css',
  '/public/css/boletas.css',
  '/public/css/configuracoes.css',
  '/public/css/infraestrutura.css',
  '/public/css/chamado.css',
  '/public/css/login.css',
  '/manifest.json',
  // Icones
  '/public/Icons/alerta.ico',
  '/public/Icons/andamento.ico',
  '/public/Icons/bebedouro.ico',
  '/public/Icons/capataz.ico',
  '/public/Icons/cerca.ico',
  '/public/Icons/cerca_eletrica.ico',
  '/public/Icons/cerca_quebrada.ico',
  '/public/Icons/concluido.ico',
  '/public/Icons/configuracao.ico',
  '/public/Icons/coordenador.ico',
  '/public/Icons/eletrica.ico',
  '/public/Icons/gerente.ico',
  '/public/Icons/grava_audio.ico',
  '/public/Icons/hidraulica.ico',
  '/public/Icons/home.ico',
  '/public/Icons/infra.ico',
  '/public/Icons/iniciar_task.ico',
  '/public/Icons/localizacao.ico',
  '/public/Icons/movimentacao.ico',
  '/public/Icons/nascimento.ico',
  '/public/Icons/obto.ico',
  '/public/Icons/offline.ico',
  '/public/Icons/pendente.ico',
  '/public/Icons/salvar.ico',
  '/public/Icons/sincronizacao.ico',
  '/public/Icons/tarefas.ico',
  '/public/Icons/tira_foto.ico',
  '/public/icons-pwa/icon-192.png',
  '/public/icons-pwa/icon-512.png',
  // Logos da marca Syntech (sidebar branca + login verde)
  '/public/syntech-verde.png',
  '/public/syntech-branco.png',
  // Ícones temáticos usados na nova-os, detalhe-boleta, chamados
  '/public/Icons/Brinco.ico',
  '/public/Icons/GPS.ico',
  '/public/Icons/Pasto.ico',
  '/public/Icons/Placa_de_carro.ico',
  '/public/Icons/abaco_calculo_total.ico',
  '/public/Icons/acesso_restrito.ico',
  '/public/Icons/aperto_maos_acordo.ico',
  '/public/Icons/bloqueado.ico',
  '/public/Icons/bussola_direcao_guia.ico',
  '/public/Icons/calendario_pagina_agenda.ico',
  '/public/Icons/caminhao_transporte_gado.ico',
  '/public/Icons/carrinho_compras_gado.ico',
  '/public/Icons/cedula_dinheiro_bovino.ico',
  '/public/Icons/comitiva_peao_a_cavalo.ico',
  '/public/Icons/dashboard_analise_dados.ico',
  '/public/Icons/destido.ico',
  '/public/Icons/editar.ico',
  '/public/Icons/entrada_animais_recebimento_compra.ico',
  '/public/Icons/envio_animais_caixa.ico',
  '/public/Icons/evolucao.ico',
  '/public/Icons/excluir.ico',
  '/public/Icons/exit.ico',
  '/public/Icons/historico_tempo_voltar.ico',
  '/public/Icons/identidade.ico',
  '/public/Icons/instalar_aplicativo_celular.ico',
  '/public/Icons/lupa.ico',
  '/public/Icons/olho_senha_aberto.ico',
  '/public/Icons/olho_senha_fechado.ico',
];

// 2) Rotas autenticadas: pré-cacheadas DEPOIS do login (cliente avisa via postMessage)
// Por perfil — só baixa o que faz sentido pra quem está logado.
// Cada perfil tem:
//   - estaticas: páginas + APIs sem ID dinâmico
//   - listas: APIs que retornam arrays — depois de cachear, o SW lê o JSON e
//     pré-cacheia cada item individual (ver expandirListas() abaixo).
const ROTAS_POR_PERFIL = {
  Capataz: {
    estaticas: [
      '/tarefas', '/nova-os', '/historico', '/novo-chamado', '/sucesso',
      '/api/dados/form-nova-os',
      '/api/tarefas?status=ABERTA',
      '/api/tarefas?status=CONCLUIDA',
      '/api/boletas/minhas',
      '/api/historico/boletas',
    ],
    listas: [
      { url: '/api/tarefas?status=ABERTA',    chave: 'tarefas',  detalhePage: '/tarefa/',  detalheApi: '/api/tarefas/' },
      { url: '/api/tarefas?status=CONCLUIDA', chave: 'tarefas',  detalhePage: '/tarefa/',  detalheApi: '/api/tarefas/' },
      { url: '/api/historico/boletas',        chave: null,       detalhePage: '/boleta/',  detalheApi: '/api/boletas/' },
    ],
  },
  Gerente: {
    estaticas: [
      '/dashboard', '/configuracoes', '/infraestrutura', '/historico', '/nova-tarefa',
      '/api/dashboard/resumo', '/api/dashboard/retiros',
      '/api/admin/retiros', '/api/admin/usuarios',
      '/api/dados/form-nova-os',
      '/api/historico/boletas', '/api/historico/chamados',
    ],
    listas: [
      { url: '/api/historico/boletas',  chave: null, detalhePage: '/boleta/',  detalheApi: '/api/boletas/'  },
      { url: '/api/historico/chamados', chave: null, detalhePage: '/chamado/', detalheApi: '/api/chamados/' },
    ],
  },
  Coordenador: {
    estaticas: [
      '/dashboard', '/boletas', '/historico',
      '/api/dashboard/resumo', '/api/dashboard/retiros',
      '/api/coordenador/boletas-pendentes',
      '/api/historico/boletas', '/api/historico/chamados',
    ],
    listas: [
      { url: '/api/coordenador/boletas-pendentes', chave: null, detalhePage: '/boleta/', detalheApi: '/api/boletas/' },
      { url: '/api/historico/boletas',             chave: null, detalhePage: '/boleta/', detalheApi: '/api/boletas/' },
      { url: '/api/historico/chamados',            chave: null, detalhePage: '/chamado/', detalheApi: '/api/chamados/' },
    ],
  },
  Infraestrutura: {
    estaticas: ['/infraestrutura', '/historico', '/api/chamados', '/api/historico/chamados'],
    listas: [
      { url: '/api/chamados', chave: 'chamados', detalhePage: '/chamado/', detalheApi: '/api/chamados/' },
    ],
  },
};

// Limites de segurança pra evitar estourar storage
const LIMITE_ITENS_POR_LISTA = 50;

// ============ INSTALL: cacheia estáticos ============
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // addAll falha tudo se um arquivo der erro — mais robusto adicionar individualmente
      Promise.all(ASSETS_ESTATICOS.map((url) =>
        cache.add(url).catch((err) => console.warn('[SW] falha ao cachear', url, err))
      ))
    )
  );
  self.skipWaiting();
});

// ============ ACTIVATE: limpa caches antigos ============
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ============ MENSAGEM DO CLIENTE: pré-cache pós-login ============
// Faz 2 etapas:
//  1) Cacheia páginas estáticas + APIs de lista (rápido)
//  2) Lê o JSON das listas e expande pra cachear cada item individual
//     (ex: /api/tarefas → /tarefa/:id + /api/tarefas/:id pra cada item)
self.addEventListener('message', (event) => {
  if (!event.data || event.data.tipo !== 'pre-cache-perfil') return;
  const perfil = event.data.perfil;
  const cfg = ROTAS_POR_PERFIL[perfil];
  if (!cfg) return;
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    let totalEstaticas = 0;
    let totalDinamicas = 0;

    // === Etapa 1: rotas estáticas ===
    await Promise.all(cfg.estaticas.map(async (url) => {
      try {
        const res = await fetch(url, { credentials: 'same-origin' });
        if (res && res.ok) {
          await cache.put(url, res.clone());
          totalEstaticas++;
        }
      } catch (_) { /* offline: ignora */ }
    }));

    // === Etapa 2: expandir listas em itens individuais ===
    for (const lista of (cfg.listas || [])) {
      try {
        const resp = await caches.match(lista.url);
        if (!resp) continue;
        const json = await resp.clone().json();
        // O array pode estar diretamente no JSON ou dentro de uma chave (ex: { tarefas: [...] })
        let itens = Array.isArray(json) ? json : (lista.chave ? json[lista.chave] : null);
        if (!Array.isArray(itens)) {
          // Tenta achar qualquer array no top-level
          itens = Object.values(json).find(v => Array.isArray(v));
        }
        if (!Array.isArray(itens) || !itens.length) continue;

        // Limita pra não estourar storage
        const seleciona = itens.slice(0, LIMITE_ITENS_POR_LISTA);

        await Promise.all(seleciona.map(async (item) => {
          const id = item && (item.id || item.grupo_id);
          if (!id) return;
          const pageUrl = lista.detalhePage + id;
          const apiUrl  = lista.detalheApi  + id;
          await Promise.all([pageUrl, apiUrl].map(async (u) => {
            try {
              const r = await fetch(u, { credentials: 'same-origin' });
              if (r && r.ok) {
                await cache.put(u, r.clone());
                totalDinamicas++;
              }
            } catch (_) { /* ignora */ }
          }));
        }));
      } catch (_) { /* ignora erros de parse/fetch */ }
    }

    console.log(`[SW] Pré-cache pós-login concluído para ${perfil}: ${totalEstaticas} estáticas + ${totalDinamicas} dinâmicas`);
  })());
});

// ============ FETCH: network-first + fallback do cache ============
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Não cacheamos cross-origin (CDNs externas etc)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cacheia respostas OK para uso offline futuro
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
