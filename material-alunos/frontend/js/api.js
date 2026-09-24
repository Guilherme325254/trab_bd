// Camada de acesso à API — MATERIAL DO ALUNO.
//
// Esta é a ÚNICA parte do frontend que falta completar. Todas as
// páginas (catálogo, produto, carrinho, checkout, login, conta, painel)
// já sabem renderizar os dados — elas só chamam as funções abaixo.
//
// Cada função tem um TODO dizendo o método HTTP e a rota que ela deve
// chamar (contrato completo em docs/especificacao-api.md). Enquanto uma
// função não for completada, ela lança um erro — a página vai mostrar
// esse erro na tela, então dá pra saber exatamente o que falta.

/** Já pronta: faz a chamada HTTP de fato e trata erro/JSON.
 * Use-a dentro de cada função apiXxx abaixo. */
async function _apiRequest(metodo, caminho, corpo) {
  const opcoes = { method: metodo, headers: {} };
  if (corpo !== undefined) {
    opcoes.headers["Content-Type"] = "application/json";
    opcoes.body = JSON.stringify(corpo);
  }

  const resposta = await fetch(`${API_BASE_URL}${caminho}`, opcoes);
  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(dados.erro || `Erro ${resposta.status} ao acessar ${caminho}`);
  }
  return dados;
}

function _naoImplementada(nome) {
  throw new Error(`TODO: implemente ${nome}() em js/api.js`);
}

// ---------- catálogo (Aula 4) ----------

async function apiListarCategorias() {
  // TODO: GET /categorias
  _naoImplementada("apiListarCategorias");
}

async function apiListarProdutos(filtros = {}) {
  // TODO: GET /produtos, passando `filtros` como query string.
  // Dica: monte a query string com `new URLSearchParams(filtros)` —
  // mas remova antes as chaves com valor undefined/null/"" para não
  // mandar "categoria_id=undefined" na URL.
  _naoImplementada("apiListarProdutos");
}

async function apiObterProduto(id) {
  // TODO: GET /produtos/{id}
  _naoImplementada("apiObterProduto");
}

async function apiListarAvaliacoes(produtoId) {
  // TODO: GET /produtos/{produtoId}/avaliacoes
  _naoImplementada("apiListarAvaliacoes");
}

async function apiCriarAvaliacao(produtoId, dados) {
  // TODO: POST /produtos/{produtoId}/avaliacoes, enviando `dados` no corpo
  _naoImplementada("apiCriarAvaliacao");
}

async function apiListarDestaques(limite = 6) {
  // TODO: GET /produtos/destaques?limite={limite}
  _naoImplementada("apiListarDestaques");
}

// ---------- clientes (Aula 4) ----------

async function apiCriarCliente(dados) {
  // TODO: POST /clientes, enviando `dados` no corpo
  _naoImplementada("apiCriarCliente");
}

async function apiLogin(dados) {
  // TODO: POST /clientes/login, enviando `dados` no corpo
  _naoImplementada("apiLogin");
}

async function apiListarPedidosCliente(clienteId) {
  // TODO: GET /clientes/{clienteId}/pedidos
  _naoImplementada("apiListarPedidosCliente");
}

// ---------- cupons e pedidos (Aula 4) ----------

async function apiValidarCupom(codigo) {
  // TODO: GET /cupons/{codigo}/validar
  // Dica: use encodeURIComponent(codigo) ao montar a URL.
  _naoImplementada("apiValidarCupom");
}

async function apiCriarPedido(dados) {
  // TODO: POST /pedidos, enviando `dados` no corpo
  _naoImplementada("apiCriarPedido");
}

async function apiObterPedido(id) {
  // TODO: GET /pedidos/{id}
  _naoImplementada("apiObterPedido");
}

// ---------- relatórios / painel da loja (Aula 4) ----------

async function apiRelatorioResumo() {
  // TODO: GET /relatorios/resumo
  _naoImplementada("apiRelatorioResumo");
}

async function apiRelatorioMaisVendidos(limite = 5) {
  // TODO: GET /relatorios/mais-vendidos?limite={limite}
  _naoImplementada("apiRelatorioMaisVendidos");
}

async function apiRelatorioFaturamentoPorCategoria() {
  // TODO: GET /relatorios/faturamento-por-categoria
  _naoImplementada("apiRelatorioFaturamentoPorCategoria");
}
