// Lógica da página de detalhe do produto (produto.html) — já pronta.

const produtoId = obterParametroURL("id");
let produtoCarregado = null;

document.addEventListener("DOMContentLoaded", () => {
  carregarProduto();
  carregarAvaliacoes();
  document.getElementById("form-avaliacao").addEventListener("submit", enviarAvaliacao);
});

async function carregarProduto() {
  const container = document.getElementById("produto-conteudo");
  try {
    const produto = await apiObterProduto(produtoId);
    produtoCarregado = produto;
    document.title = `${produto.nome} — Minha Loja`;
    container.innerHTML = `
      <img src="${produto.imagem_url || "https://via.placeholder.com/400"}" alt="${produto.nome}">
      <div>
        <span class="categoria">${produto.categoria_nome}</span>
        <h1>${produto.nome}</h1>
        <p class="avaliacao">${criarEstrelas(produto.avaliacao_media)} · ${produto.total_avaliacoes} avaliação(ões)</p>
        <p>${produto.descricao || ""}</p>
        <p class="preco">${formatarMoeda(produto.preco)}</p>
        <p>Estoque disponível: ${produto.estoque}</p>
        <div class="campo">
          <label for="quantidade">Quantidade</label>
          <input type="number" id="quantidade" min="1" max="${produto.estoque}" value="1">
        </div>
        <button class="botao" id="botao-adicionar" ${produto.estoque === 0 ? "disabled" : ""}>
          ${produto.estoque === 0 ? "Sem estoque" : "Adicionar ao carrinho"}
        </button>
      </div>
    `;
    const botao = document.getElementById("botao-adicionar");
    if (botao) {
      botao.addEventListener("click", () => {
        const quantidade = parseInt(document.getElementById("quantidade").value, 10) || 1;
        adicionarAoCarrinho(produto, quantidade);
        alert("Produto adicionado ao carrinho!");
      });
    }
  } catch (erro) {
    container.innerHTML = `<div class="mensagem erro">Não foi possível carregar o produto: ${erro.message}</div>`;
  }
}

async function carregarAvaliacoes() {
  const container = document.getElementById("lista-avaliacoes");
  try {
    const avaliacoes = await apiListarAvaliacoes(produtoId);
    if (avaliacoes.length === 0) {
      container.innerHTML = "<p>Ainda não há avaliações para este produto. Seja o primeiro!</p>";
      return;
    }
    container.innerHTML = avaliacoes.map((avaliacao) => `
      <div class="avaliacao-item">
        <strong>${avaliacao.cliente_nome}</strong> —
        <span class="estrelas">${"★".repeat(avaliacao.nota)}${"☆".repeat(5 - avaliacao.nota)}</span>
        <p>${avaliacao.comentario || ""}</p>
        <small>${avaliacao.criado_em}</small>
      </div>
    `).join("");
  } catch (erro) {
    container.innerHTML = `<div class="mensagem erro">${erro.message}</div>`;
  }
}

async function enviarAvaliacao(evento) {
  evento.preventDefault();
  const mensagens = document.getElementById("mensagens-avaliacao");
  const cliente = obterClienteLogado();
  if (!cliente) {
    mostrarMensagem(mensagens, 'Você precisa <a href="login.html">entrar</a> para avaliar um produto.', "info");
    return;
  }
  const nota = parseInt(document.getElementById("avaliacao-nota").value, 10);
  const comentario = document.getElementById("avaliacao-comentario").value;
  try {
    await apiCriarAvaliacao(produtoId, { cliente_id: cliente.id, nota, comentario });
    mostrarMensagem(mensagens, "Avaliação enviada, obrigado!", "sucesso");
    document.getElementById("form-avaliacao").reset();
    carregarAvaliacoes();
    carregarProduto();
  } catch (erro) {
    mostrarMensagem(mensagens, erro.message, "erro");
  }
}
