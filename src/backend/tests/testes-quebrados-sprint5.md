## Inventário de Testes Quebrados — Sprint 5

> **Atualização pós-revisão (2026-06-17):** as causas raiz abaixo foram sanadas — `cookie-parser` e `jest-environment-jsdom` já estão instalados em `node_modules`. As suites listadas como quebradas estão atualmente passando. O inventário mantém o estado histórico no momento do mapeamento e foi complementado com as suites não mapeadas identificadas em revisão.

### Resumo Executivo

| Status | Suites | Casos de Teste |
|--------|--------|----------------|
| Quebrados no momento do mapeamento | 13 | ~116 bloqueados |
| Passando (mapeadas originalmente) | 11 | 75 |
| Passando (identificadas em revisão) | 10 | 54 |
| Passando (unit — alertaService / nascimentoService) | 2 | 10 |
| **Total atual** | **26** | **~245** |

**Status atual: 100% da suite passa** após instalação de `cookie-parser` e `jest-environment-jsdom`. O percentual de 61% inoperante refletia o estado no momento do mapeamento.

---

## CAUSA RAIZ 1 — `cookie-parser` não instalado *(sanada)*

**Erro original:** `TS2307: Cannot find module 'cookie-parser' or its corresponding type declarations` em `src/backend/app.ts:6`  
**Correção aplicada:** `npm install cookie-parser @types/cookie-parser` (já em `package.json` e `node_modules`)

**Impacto: CRÍTICO** — Derruba 12 suites de integração inteiras. Nenhum teste de endpoint, autenticação, sincronização ou offline executa.

### Suites afetadas e seus casos

---

#### 1. `src/backend/tests/alertaIntegration.test.ts` — 5 casos | CRÍTICO
Cobre RF006 (criação de alertas com GPS).

| Caso | Impacto |
|------|---------|
| `201 — cria chamado com payload válido completo (RF006)` | Crítico |
| `201 — alerta retornado contém campos obrigatórios` | Crítico |
| `400 — payload vazio: sem tipo, descrição nem coordenadas (RN06)` | Crítico |
| `400 — sem capataz_id` | Médio |
| `400 — sem coordenadas GPS (RN06)` | Crítico |

---

#### 2. `src/backend/tests/auth-jwt.test.ts` — 4 casos | CRÍTICO
Cobre o fluxo completo de autenticação JWT (login, refresh, proteção de rotas).

| Caso | Impacto |
|------|---------|
| `login retorna access token e define refresh token em cookie httpOnly` | Crítico |
| `refresh emite novo access token quando o refresh token é válido` | Crítico |
| `rota protegida rejeita requisição sem access token` | Crítico |
| `rota protegida aceita access token válido` | Crítico |

---

#### 3. `src/backend/tests/contratos-rnf.test.ts` — 9 casos | CRÍTICO
Cobre RNF02, RNF03, RNF05, RNF-CAP, RN28, fluxo do técnico de infraestrutura.

| Caso | Impacto |
|------|---------|
| `exporta apenas movimentações com validado = 1 (RN28)` | Crítico |
| `impede exportação por perfil diferente de Coordenador (RN28)` | Crítico |
| `rejeita status fora do contrato no banco (RNF05)` | Médio |
| `processa lote heterogêneo e registra resultados (RNF03)` | Crítico |
| `rejeita lote acima do limite de 500 itens (RNF-CAP)` | Crítico |
| `lista tarefas do dia em até 2 segundos com 1.000 tarefas (RNF02)` | Crítico |
| `lista chamados para o painel da equipe de infraestrutura` | Médio |
| `técnico resolve chamado com descrição e foto de evidência` | Crítico |
| `impede resolução por usuário que não seja técnico` | Crítico |

---

#### 4. `src/backend/tests/endpoints.test.ts` — 16 casos | CRÍTICO
Suite de fumaça dos endpoints principais; cobre RF001, RF006, RF008.

| Caso | Impacto |
|------|---------|
| `GET /api/health — retorna 200 com status do sistema` | Médio |
| `POST /api/tarefas — 201 cria tarefa com dados válidos` | Crítico |
| `POST /api/tarefas — 400 campos obrigatórios ausentes` | Médio |
| `POST /api/tarefas — 422 capataz não pertence ao retiro (RN01)` | Crítico |
| `GET /api/tarefas/hoje — 200 retorna lista do capataz` | Crítico |
| `GET /api/tarefas/hoje — 400 capataz_id ausente` | Médio |
| `PATCH /api/tarefas/:id/concluir — 200 conclui tarefa` | Crítico |
| `PATCH /api/tarefas/:id/concluir — 400 capataz_id ausente` | Médio |
| `PATCH /api/tarefas/:id/concluir — 404 tarefa não encontrada` | Médio |
| `POST /api/tarefas/:id/evidencias — 201 anexa evidência` | Crítico |
| `POST /api/tarefas/:id/evidencias — 400 campos ausentes` | Médio |
| `POST /api/tarefas/:id/evidencias — 404 tarefa inexistente` | Médio |
| `POST /api/chamados — 201 cria chamado com dados válidos` | Crítico |
| `POST /api/chamados — 400 campos obrigatórios ausentes` | Médio |
| `POST /api/eventos-zootecnicos/nascimentos — 201 registra nascimento` | Crítico |
| `POST /api/eventos-zootecnicos/nascimentos — 400 campos ausentes` | Médio |

---

#### 5. `src/backend/tests/eventoIntegration.test.ts` — 18 casos | CRÍTICO
Cobre RF008 (nascimentos), RF009/RN07 (óbitos com foto obrigatória), RF013.

| Caso | Impacto |
|------|---------|
| `POST /nascimentos — 201 cria nascimento com payload válido (RF008)` | Crítico |
| `POST /nascimentos — 201 registro retornado contém campos obrigatórios` | Médio |
| `POST /nascimentos — 400 payload vazio` | Médio |
| `POST /nascimentos — 400 sem data` | Médio |
| `POST /nascimentos — 400 sem retiro_id` | Médio |
| `POST /nascimentos — 400 sem categoria` | Médio |
| `POST /nascimentos — 400 sem quantidade` | Médio |
| `POST /nascimentos — 400 sem capataz_id` | Médio |
| `POST /obitos — 201 cria óbito com payload válido (RF009, RN07)` | Crítico |
| `POST /obitos — 201 registro retornado contém movimentacao_id e obito_id` | Médio |
| `POST /obitos — 422 sem foto_base64: evidência obrigatória (RN07)` | Crítico |
| `POST /obitos — 400 payload vazio` | Médio |
| `POST /obitos — 422 sem identificacao_animal (RF013)` | Crítico |
| `POST /obitos — 422 sem causa_morte (RF013)` | Crítico |
| `POST /obitos — 400 sem data (RF013)` | Médio |
| `foto Base64 é persistida na tabela evidencias (RN07)` | Crítico |
| `movimentação é registrada no inventário com quantidade e categoria` | Crítico |
| `registro de óbito vincula movimentação, foto e causa_morte` | Crítico |

---

#### 6. `src/backend/tests/frontend.test.ts` — 3 casos | MÉDIO
Valida o setup de IndexedDB/offline no front-end.

| Caso | Impacto |
|------|---------|
| `renderiza a página inicial com o script do IndexedDB` | Médio |
| `serve o script que inicializa o banco local brpec_local` | Médio |
| `serve a função salvarFila para registrar operações offline pendentes` | Médio |

---

#### 7. `src/backend/tests/offline-operations.test.ts` — 11 casos | CRÍTICO
Cobre a estratégia offline completa (interceptador, handlers, sync.js, db.js, fila).

| Caso | Impacto |
|------|---------|
| `serve o script de interceptação offline` | Crítico |
| `serve o handler para nova-os` | Crítico |
| `serve o handler para resolver chamado` | Crítico |
| `serve o script sync.js para sincronização em lote` | Crítico |
| `o template EJS de novo-chamado carrega o handler offline correto` | Médio |
| `o handler offline do chamado expõe o caminho da API` | Médio |
| `db.js possui todas as funções necessárias` | Crítico |
| `footer.ejs carrega os scripts de offline e db` | Baixo |
| `POST com offline salva na fila ao invés de enviar` | Crítico |
| `PUT para resolver chamado com offline salva na fila` | Crítico |
| `endpoint POST /api/sincronizacao/lote existe para processar fila` | Crítico |

---

#### 8. `src/backend/tests/outros-endpoints.test.ts` — 6 casos | CRÍTICO
Suite complementar de endpoints (health, alertas, nascimentos).

| Caso | Impacto |
|------|---------|
| `HE1. GET /api/health — retorna 200 com informações de saúde` | Médio |
| `AL1. POST /api/chamados — cria alerta com dados válidos (HTTP 201)` | Crítico |
| `AL2. POST /api/chamados — campos obrigatórios ausentes (HTTP 400)` | Médio |
| `N1. POST /nascimentos — registra nascimento animal (HTTP 201)` | Crítico |
| `N2. POST /nascimentos — campos obrigatórios ausentes (HTTP 400)` | Médio |
| `N3. POST /nascimentos — data de nascimento futura (RN27)` | Crítico |

---

#### 9. `src/backend/tests/sincronizacaoIntegration.test.ts` — 12 casos | CRÍTICO
Cobre RF011 (sincronização em lote), RF007 (painel gerencial), RNF-CAP.

| Caso | Impacto |
|------|---------|
| `200 — processa lote misto e retorna totais corretos (RF011)` | Crítico |
| `200 — cada resultado contém entidade_tipo e status (RF011)` | Crítico |
| `200 — item com dados inválidos gera status ERRO sem derrubar o lote` | Crítico |
| `400 — sem campo itens no body` | Médio |
| `400 — itens não é array` | Médio |
| `400 — array de itens vazio` | Médio |
| `413 — lote com mais de 500 itens excede limite (RNF-CAP)` | Crítico |
| `200 — retorna estrutura completa do painel (RF007)` | Crítico |
| `200 — resumo_tarefas reflete as 4 tarefas inseridas` | Crítico |
| `200 — tarefas_por_retiro contém o retiro com tarefas inseridas` | Crítico |
| `400 — sem gerente_id na query string` | Médio |
| `403 — gerente_id pertence a perfil Capataz (ACESSO_NEGADO)` | Crítico |

---

#### 10. `src/backend/tests/tarefaIntegration.test.ts` — 7 casos | CRÍTICO
Cobre RF001 (gestão de tarefas), RN03 (isolamento por capataz).

| Caso | Impacto |
|------|---------|
| `GET /hoje — 200 retorna body com tarefas e campo modo` | Crítico |
| `GET /hoje — 200 cada tarefa contém os campos obrigatórios` | Médio |
| `GET /hoje — 200 retorna apenas tarefas do capataz logado (RN03)` | Crítico |
| `GET /hoje — 400 capataz_id ausente na query` | Médio |
| `PATCH /concluir — 200 altera status para CONCLUIDA no banco` | Crítico |
| `PATCH /concluir — 400 capataz_id ausente no body` | Médio |
| `PATCH /concluir — 404 tarefa inexistente` | Médio |

---

#### 11. `src/backend/tests/uc01-planejar-tarefas.test.ts` — 15 casos | CRÍTICO
Suite primária da US01/RF001. Cobre criação, listagem, conclusão e evidências de tarefas.

| Caso | Impacto |
|------|---------|
| `C1. POST /tarefas — sucesso HTTP 201` | Crítico |
| `C2. POST /tarefas — capataz não pertence ao retiro (HTTP 422, RN01)` | Crítico |
| `C3. POST /tarefas — campos obrigatórios ausentes (HTTP 400)` | Médio |
| `C4. POST /tarefas — persistência com todos os campos corretos` | Crítico |
| `H1. GET /hoje — retorna tarefa do dia (HTTP 200)` | Crítico |
| `H2. GET /hoje — retorna array vazio quando sem tarefas hoje` | Médio |
| `H3. GET /hoje — capataz_id ausente (HTTP 400)` | Médio |
| `K1. PATCH /concluir — conclui tarefa, retorna CONCLUIDA (HTTP 200)` | Crítico |
| `K2. PATCH /concluir — tarefa não pertence ao capataz (HTTP 404)` | Crítico |
| `K3. PATCH /concluir — status e concluida_em atualizados no banco` | Crítico |
| `K4. PATCH /concluir — capataz_id ausente (HTTP 400)` | Médio |
| `E1. POST /evidencias — anexa evidência FOTO (HTTP 201)` | Crítico |
| `E2. POST /evidencias — tarefa não pertence ao capataz (HTTP 404, RN05)` | Crítico |
| `E3. POST /evidencias — tipo ausente (HTTP 400)` | Médio |
| `E4. POST /evidencias — persistência da evidência TEXTO no banco` | Crítico |

---

#### 12. `src/backend/tests/viewRoutes.test.ts` — 8 casos | MÉDIO
Valida renderização de templates EJS e redirecionamentos de rotas protegidas.

| Caso | Impacto |
|------|---------|
| `GET / — renderiza tela de seleção de perfil (rota pública)` | Médio |
| `GET /dashboard sem sessão — redireciona para /` | Médio |
| `GET /dashboard — retorna 200 e renderiza HTML` | Médio |
| `GET /tarefas sem sessão — redireciona para /` | Médio |
| `GET /nova-os sem sessão — redireciona para /` | Médio |
| `GET /historico sem sessão — redireciona para /` | Médio |
| `GET /configuracoes sem sessão — redireciona para /` | Médio |
| `GET /selecionar-retiro — renderiza tela de seleção de retiro` | Médio |

---

## CAUSA RAIZ 2 — `jest-environment-jsdom` não instalado *(sanada)*

**Erro original:** `Test environment jest-environment-jsdom cannot be found. As of Jest 28, must be installed separately.`  
**Correção aplicada:** `npm install --save-dev jest-environment-jsdom` (já em `package.json` e `node_modules`)

**Impacto: MÉDIO** — Isolava apenas 1 suite, com 2 casos de teste.

#### 13. `src/backend/tests/chamados.frontend.test.ts` — 2 casos | MÉDIO
Testa a captura de GPS no front-end (RF006 — coordenadas do chamado).

| Caso | Impacto |
|------|---------|
| `preenche latitude e longitude quando a geolocation retorna coordenadas` | Médio |
| `mostra mensagem de erro quando geolocation não é suportado` | Médio |

---

---

## Suites Passando — Não Mapeadas Originalmente *(identificadas em revisão)*

Suites existentes no momento do mapeamento que não foram incluídas no inventário. Todas passam com 100% de aprovação.

---

### Sincronização Offline

#### 14. `src/backend/tests/sync-retry.test.ts` — 3 casos | PASSANDO | CRÍTICO
Cobre resiliência da fila offline: backoff exponencial com jitter, retry automático até sucesso e bloqueio de retry para erros não-transitórios.

| Caso | Impacto |
|------|---------|
| `calcula backoff exponencial com jitter controlado` | Crítico |
| `retenta falha de comunicacao ate sucesso sem intervencao do usuario` | Crítico |
| `nao retenta erro marcado como nao transitorio` | Crítico |

---

#### 15. `src/backend/tests/unit/cloudSyncService.test.ts` — 15 casos | PASSANDO | CRÍTICO
Suite mais abrangente de sincronização. Cobre CT-CS01 a CT-CS15: suspensão offline, sync de tarefas e alertas, transações com COMMIT e ROLLBACK para todas as movimentações (nascimento, óbito, transferência, compravenda), sync de evidências, retiros e usuários.

| Caso | Impacto |
|------|---------|
| `[CT-CS01] suspende sincronização sem conexão Supabase (offline)` | Crítico |
| `[CT-CS02] processa e sincroniza tarefas com sucesso quando online` | Crítico |
| `[CT-CS03] incrementa tentativas e registra ERRO ao falhar upsert` | Crítico |
| `[CT-CS04] sincroniza alertas com sucesso` | Crítico |
| `[CT-CS05] sincroniza movimentação de nascimento via COMMIT` | Crítico |
| `[CT-CS06] sincroniza movimentação de óbito` | Crítico |
| `[CT-CS07] sincroniza movimentação de transferência` | Crítico |
| `[CT-CS08] sincroniza movimentação de compravenda` | Crítico |
| `[CT-CS09] executa ROLLBACK e marca ERRO quando transação falha` | Crítico |
| `[CT-CS10] sincroniza evidência vinculada a tarefa com sucesso` | Crítico |
| `[CT-CS11] marca ERRO e não atualiza sincronizada se upsert falhar` | Crítico |
| `[CT-CS12] sincroniza retiro com sucesso` | Médio |
| `[CT-CS13] marca ERRO se upsert de retiro falhar` | Médio |
| `[CT-CS14] sincroniza usuário com sucesso` | Médio |
| `[CT-CS15] marca ERRO se upsert de usuário falhar` | Médio |

---

### Autenticação com Timeout

#### 16. `src/backend/tests/critical-timeout.test.ts` — 2 casos | PASSANDO | CRÍTICO
Cobre comportamento de timeout em operações críticas: salva na fila local quando requisição mútavel expira e aplica timeout específico em chamadas de autenticação.

| Caso | Impacto |
|------|---------|
| `salva operacao mutavel na fila local quando a requisicao expira` | Crítico |
| `aplica timeout nas chamadas de autenticacao` | Crítico |

---

### Serviços Unitários

#### 17. `src/backend/tests/unit/tarefaService.test.ts` — 13 casos | PASSANDO | CRÍTICO
Cobre CT-UT01 a CT-UT13: conclusão, validação de propriedade, evidências (foto/texto, limite de 5 MB, base64 inválido, prefixo data URI), e criação com validação de data retroativa e descrição em branco.

| Caso | Impacto |
|------|---------|
| `[CT-UT01] conclui tarefa e retorna registro atualizado` | Crítico |
| `[CT-UT02] lança erro quando tarefa já está concluída` | Crítico |
| `[CT-UT03] lança erro quando tarefa não pertence ao capataz` | Crítico |
| `[CT-UT04] salva evidência e retorna evidencia_id` | Crítico |
| `[CT-UT05] lança erro quando tarefa não pertence ao capataz (evidência)` | Crítico |
| `[CT-UT06] lança erro quando arquivo_base64 excede 5 MB` | Crítico |
| `[CT-UT07] lança erro quando base64 contém caracteres inválidos` | Médio |
| `[CT-UT08] aceita e normaliza base64 com prefixo data URI` | Médio |
| `[CT-UT09] lança erro quando arquivo_base64 é string vazia` | Médio |
| `[CT-UT10] salva evidência de texto sem arquivo_base64` | Médio |
| `[CT-UT11] cria tarefa e retorna registro persistido` | Crítico |
| `[CT-UT12] lança erro quando data de agendamento é retroativa` | Crítico |
| `[CT-UT13] lança erro quando descrição é fornecida em branco` | Médio |

---

#### 18. `src/backend/tests/unit/healthService.test.ts` — 4 casos | PASSANDO | MÉDIO
Cobre CT-HS01 a CT-HS04: status "ok"/"erro" do banco, propagação de mensagem de erro e presença de timestamp/uptime.

| Caso | Impacto |
|------|---------|
| `[CT-HS01] retorna status "ok" e banco "conectado" quando repositório não lança erro` | Médio |
| `[CT-HS02] retorna status "erro" e banco "desconectado" quando repositório lança exceção` | Médio |
| `[CT-HS03] inclui mensagem de erro no campo "erro" quando banco falha` | Médio |
| `[CT-HS04] inclui sempre timestamp e uptime no resultado` | Baixo |

---

#### 19. `src/backend/tests/unit/database.test.ts` — 4 casos | PASSANDO | MÉDIO
Valida resolução de caminho do banco: padrão, DB_PATH customizado, criação de diretório inexistente e uso de `:memory:`.

| Caso | Impacto |
|------|---------|
| `usa o caminho padrão quando DB_PATH não está definido` | Médio |
| `usa DB_PATH customizado e resolve para caminho absoluto` | Médio |
| `cria o diretório quando ele não existe` | Médio |
| `usa :memory: diretamente sem resolver caminho no disco` | Médio |

---

#### 20. `src/backend/tests/unit/obitoService.test.ts` — 4 casos | PASSANDO | CRÍTICO
Cobre CT-OB01 a CT-OB04: criação válida, rejeição por foto ausente (RN07), causa_morte ausente e identificacao_animal ausente (RF013).

| Caso | Impacto |
|------|---------|
| `[CT-OB01] salva e retorna o registro quando dados são válidos` | Crítico |
| `[CT-OB02] lança erro quando foto_base64 estiver vazia` | Crítico |
| `[CT-OB03] lança erro quando causa_morte estiver vazia` | Crítico |
| `[CT-OB04] lança erro quando identificacao_animal estiver vazia` | Crítico |

---

#### 21. `src/backend/tests/unit/eventoService.test.ts` — 4 casos | PASSANDO | MÉDIO
Valida listagem de eventos: todos, filtrado por retiro, retiro sem eventos e filtro por tipo.

| Caso | Impacto |
|------|---------|
| `retorna todos os eventos repassando objeto vazio ao repositório` | Médio |
| `retorna apenas eventos do retiro filtrado` | Médio |
| `retorna lista vazia quando o retiro não possui eventos` | Médio |
| `repassa filtro de tipo ao repositório e retorna apenas eventos do tipo solicitado` | Médio |

---

#### 22. `src/backend/tests/unit/exportacaoService.test.ts` — 4 casos | PASSANDO | CRÍTICO
Cobre controle de acesso à exportação (ACESSO_NEGADO para perfil Capataz), erro de usuário não encontrado, geração de CSV com cabeçalhos e contagem de registros.

| Caso | Impacto |
|------|---------|
| `lança ACESSO_NEGADO quando perfil do usuário for Capataz` | Crítico |
| `lança erro quando usuário não for encontrado` | Crítico |
| `gera CSV com cabeçalhos separados por ponto-e-vírgula` | Médio |
| `retorna total_registros igual ao número de linhas consultadas` | Médio |

---

### Documentação de API

#### 23. `src/backend/tests/swagger.test.ts` — 1 caso | PASSANDO | BAIXO
Valida que a documentação Swagger cobre os endpoints de sincronização em lote e painel gerencial.

| Caso | Impacto |
|------|---------|
| `documenta sincronização em lote e painel gerencial` | Baixo |

---

## Casos de Teste Ausentes (não escritos)

Lacunas de cobertura em suites existentes. Nenhuma suite está quebrada por estas ausências — os casos faltantes são validações complementares.

| Arquivo | CTs faltando | Cobertura ausente |
|---------|-------------|-------------------|
| `src/backend/tests/unit/nascimentoService.test.ts` | CT-NA02, CT-NA03, CT-NA04, CT-NA05 | Validação individual de `retiro_id`, `categoria`, `quantidade`, `capataz_id` ausentes (RF008). CT-NA06 (data futura) já implementado. |
| `src/backend/tests/unit/alertaService.test.ts` | CT-UA02, CT-UA03, CT-UA04 | Validação individual de `tipo`, `descricao`, `capataz_id` ausentes em `criarAlerta`. Os casos CT-UA07 a CT-UA11 para `resolverChamado` estão implementados e passando. |

---

## Priorização para Correção *(atualizada)*

**1 — CONCLUÍDO | Instalar `cookie-parser` e `jest-environment-jsdom`**
Ambos instalados. As 13 suites que estavam quebradas passam atualmente.

**2 — BAIXO | Implementar CT-NA02–05 e CT-UA02–04**
Fechar as lacunas de cobertura nos serviços de nascimento e alerta. Baixo porque os fluxos felizes e a maioria das validações já são cobertos; o que falta são validações de campos obrigatórios individuais.
