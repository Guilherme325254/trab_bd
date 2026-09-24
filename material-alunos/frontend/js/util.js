// Funções utilitárias prontas: formatação, carrinho (localStorage),
// sessão do cliente (localStorage) e montagem do cabeçalho comum.
// Nada aqui fala com o backend — isso fica todo em js/api.js.

const CHAVE_CARRINHO = "loja_carrinho";
const CHAVE_CLIENTE = "loja_cliente";

// ---------- formatação ----------

function formatarMoeda(valor) {
  return (valor ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function criarEstrelas(notaMedia) {
  if (notaMedia === null || notaMedia === undefined) return "Sem avaliações";
  const cheias = Math.round(notaMedia);
  return "★".repeat(cheias) + "☆".repeat(5 - cheias) + ` (${notaMedia.toFixed(1)})`;
}

function obterParametroURL(nome) {
  return new URLSearchParams(window.location.search).get(nome);
}

function mostrarMensagem(container, texto, tipo = "erro") {
  if (typeof container === "string") container = document.getElementById(container);
  if (!container) return;
  container.innerHTML = `<div class="mensagem ${tipo}">${texto}</div>`;
}

function limparMensagem(container) {
  if (typeof container === "string") container = document.getElementById(container);
  if (container) container.innerHTML = "";
}

// ---------- carrinho (persistido no navegador) ----------

function obterCarrinho() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_CARRINHO)) || [];
  } catch {
    return [];
  }
}

function salvarCarrinho(itens) {
  localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(itens));
  atualizarBadgeCarrinho();
}

function adicionarAoCarrinho(produto, quantidade = 1) {
  const itens = obterCarrinho();
  const existente = itens.find((item) => item.produto_id === produto.id);
  if (existente) {
    existente.quantidade += quantidade;
  } else {
    itens.push({
      produto_id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      imagem_url: produto.imagem_url,
      quantidade,
    });
  }
  salvarCarrinho(itens);
}

function definirQuantidadeCarrinho(produtoId, quantidade) {
  let itens = obterCarrinho();
  if (quantidade <= 0) {
    itens = itens.filter((item) => item.produto_id !== produtoId);
  } else {
    const item = itens.find((i) => i.produto_id === produtoId);
    if (item) item.quantidade = quantidade;
  }
  salvarCarrinho(itens);
}

function removerDoCarrinho(produtoId) {
  const itens = obterCarrinho().filter((item) => item.produto_id !== produtoId);
  salvarCarrinho(itens);
}

function limparCarrinho() {
  salvarCarrinho([]);
}

function totalCarrinho() {
  return obterCarrinho().reduce((soma, item) => soma + item.preco * item.quantidade, 0);
}

function quantidadeItensCarrinho() {
  return obterCarrinho().reduce((soma, item) => soma + item.quantidade, 0);
}

function atualizarBadgeCarrinho() {
  const badge = document.getElementById("carrinho-badge");
  if (badge) badge.textContent = quantidadeItensCarrinho();
}

// ---------- sessão do cliente ----------

function obterClienteLogado() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_CLIENTE));
  } catch {
    return null;
  }
}

function salvarClienteLogado(cliente) {
  localStorage.setItem(CHAVE_CLIENTE, JSON.stringify(cliente));
}

/** Remove a sessão sem redirecionar — usado quando a própria página
 * (ex.: checkout) precisa trocar de cliente sem perder o carrinho. */
function limparClienteLogado() {
  localStorage.removeItem(CHAVE_CLIENTE);
}

function logout() {
  limparClienteLogado();
  window.location.href = "index.html";
}

/** Redireciona para login.html se ninguém estiver logado. Retorna o
 * cliente logado (ou undefined, caso já esteja redirecionando). */
function exigirLogin() {
  const cliente = obterClienteLogado();
  if (!cliente) {
    const pagina = window.location.pathname.split("/").pop();
    window.location.href = `login.html?redirect=${encodeURIComponent(pagina)}`;
    return undefined;
  }
  return cliente;
}

// ---------- cabeçalho comum ----------

function inicializarLayout() {
  const logo = document.getElementById("logo-loja");
  if (logo) logo.textContent = LOJA_NOME;

  atualizarBadgeCarrinho();

  const linkConta = document.getElementById("link-conta");
  if (linkConta) {
    const cliente = obterClienteLogado();
    linkConta.textContent = cliente ? `Olá, ${cliente.nome.split(" ")[0]}` : "Entrar";
    linkConta.href = "conta.html";
  }
}

document.addEventListener("DOMContentLoaded", inicializarLayout);
