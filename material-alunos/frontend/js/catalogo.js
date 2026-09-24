// Lógica da página de catálogo (index.html) — já pronta.
// Toda a comunicação com o backend passa pelas funções apiXxx de js/api.js.

let filtrosAtuais = { ordenar_por: "nome", direcao: "asc", pagina: 1, por_pagina: 12 };

document.addEventListener("DOMContentLoaded", () => {
  const slogan = document.getElementById("loja-slogan");
  if (slogan) slogan.textContent = LOJA_SLOGAN;

  carregarCategorias();
  carregarProdutos();

  document.getElementById("form-filtros").addEventListener("submit", (evento) => {
    evento.preventDefault();
    filtrosAtuais.categoria_id = document.getElementById("filtro-categoria").value || undefined;
    filtrosAtuais.busca = document.getElementById("filtro-busca").value || undefined;
    const [ordenarPor, direcao] = document.getElementById("filtro-ordenar").value.split("-");
    filtrosAtuais.ordenar_por = ordenarPor;
    filtrosAtuais.direcao = direcao;
    filtrosAtuais.pagina = 1;
    carregarProdutos();
  });
});

async function carregarCategorias() {
  const select = document.getElementById("filtro-categoria");
  try {
    const categorias = await apiListarCategorias();
    categorias.forEach((categoria) => {
      const opcao = document.createElement("option");
      opcao.value = categoria.id;
      opcao.textContent = categoria.nome;
      select.appendChild(opcao);
    });
  } catch (erro) {
    console.error("Falha ao carregar categorias:", erro);
  }
}

async function carregarProdutos() {
  const grid = document.getElementById("grid-produtos");
  const mensagens = document.getElementById("mensagens");
  limparMensagem(mensagens);
  grid.innerHTML = "<p>Carregando produtos...</p>";
  try {
    const resultado = await apiListarProdutos(filtrosAtuais);
    renderizarProdutos(resultado.produtos);
    renderizarPaginacao(resultado);
  } catch (erro) {
    grid.innerHTML = "";
    mostrarMensagem(mensagens, `Não foi possível carregar os produtos: ${erro.message}`, "erro");
  }
}

function renderizarProdutos(produtos) {
  const grid = document.getElementById("grid-produtos");
  if (produtos.length === 0) {
    grid.innerHTML = "<p>Nenhum produto encontrado.</p>";
    return;
  }
  grid.innerHTML = produtos.map((produto) => `
    <div class="produto-card">
      <a href="produto.html?id=${produto.id}">
        <img src="${produto.imagem_url || "https://via.placeholder.com/300"}" alt="${produto.nome}">
      </a>
      <div class="info">
        <span class="categoria">${produto.categoria_nome}</span>
        <a href="produto.html?id=${produto.id}" class="nome">${produto.nome}</a>
        <span class="avaliacao">${criarEstrelas(produto.avaliacao_media)}</span>
        <span class="preco">${formatarMoeda(produto.preco)}</span>
        <div class="acoes">
          <button class="botao" onclick='adicionarRapido(${JSON.stringify(produto)})'>Adicionar</button>
          <a class="botao secundario" href="produto.html?id=${produto.id}">Ver</a>
        </div>
      </div>
    </div>
  `).join("");
}

function adicionarRapido(produto) {
  adicionarAoCarrinho(produto, 1);
  alert(`"${produto.nome}" adicionado ao carrinho!`);
}

function renderizarPaginacao(resultado) {
  const container = document.getElementById("paginacao");
  const totalPaginas = Math.max(Math.ceil(resultado.total / resultado.por_pagina), 1);
  let html = "";
  for (let pagina = 1; pagina <= totalPaginas; pagina++) {
    html += `<button class="${pagina === resultado.pagina ? "ativo" : ""}" onclick="irParaPagina(${pagina})">${pagina}</button>`;
  }
  container.innerHTML = html;
}

function irParaPagina(pagina) {
  filtrosAtuais.pagina = pagina;
  carregarProdutos();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
