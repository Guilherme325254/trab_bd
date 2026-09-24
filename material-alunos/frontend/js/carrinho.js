// Lógica da página de carrinho (carrinho.html) — já pronta.
// O carrinho vive só no navegador (localStorage); ele só "conversa" com
// o backend no momento do checkout, quando o pedido é criado de verdade.

document.addEventListener("DOMContentLoaded", renderizarCarrinho);

function renderizarCarrinho() {
  const itens = obterCarrinho();
  const container = document.getElementById("carrinho-conteudo");
  const resumo = document.getElementById("resumo-carrinho");

  if (itens.length === 0) {
    container.innerHTML = "<p>Seu carrinho está vazio. <a href='index.html'>Voltar ao catálogo</a></p>";
    resumo.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <table class="tabela">
      <thead>
        <tr><th>Produto</th><th>Preço</th><th>Quantidade</th><th>Subtotal</th><th></th></tr>
      </thead>
      <tbody>
        ${itens.map((item) => `
          <tr>
            <td>${item.nome}</td>
            <td>${formatarMoeda(item.preco)}</td>
            <td><input type="number" min="1" value="${item.quantidade}" style="width:60px"
                  onchange="alterarQuantidade(${item.produto_id}, this.value)"></td>
            <td>${formatarMoeda(item.preco * item.quantidade)}</td>
            <td><button class="botao perigo" onclick="removerItem(${item.produto_id})">Remover</button></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  const subtotal = totalCarrinho();
  resumo.innerHTML = `
    <div class="resumo-total total"><span>Total</span><span>${formatarMoeda(subtotal)}</span></div>
    <a href="checkout.html" class="botao" style="width:100%;text-align:center;margin-top:12px;display:block">Finalizar compra</a>
  `;
}

function alterarQuantidade(produtoId, valor) {
  definirQuantidadeCarrinho(produtoId, parseInt(valor, 10) || 0);
  renderizarCarrinho();
}

function removerItem(produtoId) {
  removerDoCarrinho(produtoId);
  renderizarCarrinho();
}
