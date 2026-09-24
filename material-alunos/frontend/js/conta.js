// Lógica da página "Minha Conta" (conta.html) — já pronta.

document.addEventListener("DOMContentLoaded", () => {
  const cliente = exigirLogin();
  if (!cliente) return;

  document.getElementById("saudacao").textContent = `Olá, ${cliente.nome}!`;
  document.getElementById("botao-sair").addEventListener("click", logout);
  carregarPedidos(cliente.id);
});

async function carregarPedidos(clienteId) {
  const container = document.getElementById("lista-pedidos");
  try {
    const pedidos = await apiListarPedidosCliente(clienteId);
    if (pedidos.length === 0) {
      container.innerHTML = "<p>Você ainda não fez nenhum pedido. <a href='index.html'>Ver catálogo</a></p>";
      return;
    }
    container.innerHTML = `
      <table class="tabela">
        <thead><tr><th>Pedido</th><th>Status</th><th>Total</th><th>Data</th></tr></thead>
        <tbody>
          ${pedidos.map((pedido) => `
            <tr>
              <td>#${pedido.id}</td>
              <td>${pedido.status}</td>
              <td>${formatarMoeda(pedido.total)}</td>
              <td>${pedido.criado_em}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } catch (erro) {
    container.innerHTML = `<div class="mensagem erro">${erro.message}</div>`;
  }
}
