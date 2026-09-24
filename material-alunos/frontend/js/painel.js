// Lógica do "Painel da Loja" (painel.html) — já pronta.
// É o dashboard gerencial: tudo aqui vem de consultas agregadas do backend.

document.addEventListener("DOMContentLoaded", () => {
  carregarResumo();
  carregarMaisVendidos();
  carregarFaturamentoPorCategoria();
});

async function carregarResumo() {
  const container = document.getElementById("painel-cards");
  try {
    const resumo = await apiRelatorioResumo();
    container.innerHTML = `
      <div class="painel-card">
        <div class="rotulo">Faturamento total</div>
        <div class="valor">${formatarMoeda(resumo.faturamento_total)}</div>
      </div>
      <div class="painel-card">
        <div class="rotulo">Pedidos</div>
        <div class="valor">${resumo.total_pedidos}</div>
      </div>
      <div class="painel-card">
        <div class="rotulo">Ticket médio</div>
        <div class="valor">${formatarMoeda(resumo.ticket_medio)}</div>
      </div>
      <div class="painel-card">
        <div class="rotulo">Clientes</div>
        <div class="valor">${resumo.total_clientes}</div>
      </div>
    `;
  } catch (erro) {
    container.innerHTML = `<div class="mensagem erro">${erro.message}</div>`;
  }
}

async function carregarMaisVendidos() {
  const container = document.getElementById("mais-vendidos");
  try {
    const produtos = await apiRelatorioMaisVendidos(5);
    if (produtos.length === 0) {
      container.innerHTML = "<p>Sem vendas registradas ainda.</p>";
      return;
    }
    const maiorQuantidade = Math.max(...produtos.map((p) => p.quantidade_vendida));
    container.innerHTML = produtos.map((produto) => `
      <div style="margin-bottom:12px">
        <div class="resumo-total">
          <span>${produto.produto_nome}</span>
          <span>${produto.quantidade_vendida} un · ${formatarMoeda(produto.faturamento)}</span>
        </div>
        <div class="barra-fundo">
          <div class="barra-preenchida" style="width:${(produto.quantidade_vendida / maiorQuantidade) * 100}%"></div>
        </div>
      </div>
    `).join("");
  } catch (erro) {
    container.innerHTML = `<div class="mensagem erro">${erro.message}</div>`;
  }
}

async function carregarFaturamentoPorCategoria() {
  const container = document.getElementById("faturamento-categoria");
  try {
    const categorias = await apiRelatorioFaturamentoPorCategoria();
    const maiorFaturamento = Math.max(...categorias.map((c) => c.faturamento), 1);
    container.innerHTML = categorias.map((categoria) => `
      <div style="margin-bottom:12px">
        <div class="resumo-total">
          <span>${categoria.categoria_nome}</span>
          <span>${formatarMoeda(categoria.faturamento)} · ${categoria.quantidade_pedidos} pedido(s)</span>
        </div>
        <div class="barra-fundo">
          <div class="barra-preenchida" style="width:${(categoria.faturamento / maiorFaturamento) * 100}%"></div>
        </div>
      </div>
    `).join("");
  } catch (erro) {
    container.innerHTML = `<div class="mensagem erro">${erro.message}</div>`;
  }
}
