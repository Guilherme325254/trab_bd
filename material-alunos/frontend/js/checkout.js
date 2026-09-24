// Lógica da página de checkout (checkout.html) — já pronta.
//
// Não exige login prévio: se ninguém estiver logado, mostra um cadastro
// rápido (nome/e-mail/senha/endereço) embutido na própria página —
// "checkout como convidado" que já cria a conta na hora da compra.

let cupomAplicado = null;
let clienteAtual = null;

document.addEventListener("DOMContentLoaded", () => {
  if (obterCarrinho().length === 0) {
    window.location.href = "carrinho.html";
    return;
  }

  clienteAtual = obterClienteLogado();
  renderizarIdentificacao();
  renderizarResumo();

  document.getElementById("botao-aplicar-cupom").addEventListener("click", aplicarCupom);
  document.getElementById("form-checkout").addEventListener("submit", finalizarPedido);
});

function renderizarIdentificacao() {
  const container = document.getElementById("identificacao-container");
  const formPedido = document.getElementById("form-checkout");

  if (clienteAtual) {
    container.innerHTML = `
      <div class="mensagem info">
        Comprando como <strong>${clienteAtual.nome}</strong> (${clienteAtual.email}).
        <a href="#" id="trocar-conta">Não é você?</a>
      </div>
    `;
    document.getElementById("trocar-conta").addEventListener("click", (evento) => {
      evento.preventDefault();
      limparClienteLogado();
      clienteAtual = null;
      inicializarLayout();
      renderizarIdentificacao();
    });

    const enderecoInput = document.getElementById("endereco");
    if (enderecoInput && clienteAtual.endereco) enderecoInput.value = clienteAtual.endereco;
    formPedido.style.display = "block";
    return;
  }

  formPedido.style.display = "none";
  container.innerHTML = `
    <h3>Identifique-se para continuar</h3>
    <p class="subtitulo" style="margin-top:-8px">
      Crie sua conta agora — não precisa cadastrar antes de comprar.
    </p>
    <div id="mensagens-cadastro-rapido"></div>
    <form id="form-cadastro-rapido">
      <div class="campo">
        <label for="cr-nome">Nome completo</label>
        <input type="text" id="cr-nome" required>
      </div>
      <div class="campo">
        <label for="cr-email">E-mail</label>
        <input type="email" id="cr-email" required>
      </div>
      <div class="campo">
        <label for="cr-senha">Senha</label>
        <input type="password" id="cr-senha" required minlength="4">
      </div>
      <div class="campo">
        <label for="cr-endereco">Endereço de entrega</label>
        <input type="text" id="cr-endereco" required>
      </div>
      <button type="submit" class="botao" style="width:100%">Criar conta e continuar</button>
    </form>
    <p style="margin-top:14px">Já tem conta? <a href="login.html?redirect=checkout.html">Entrar</a></p>
  `;
  document.getElementById("form-cadastro-rapido").addEventListener("submit", cadastrarRapido);
}

async function cadastrarRapido(evento) {
  evento.preventDefault();
  const mensagens = document.getElementById("mensagens-cadastro-rapido");
  const dados = {
    nome: document.getElementById("cr-nome").value,
    email: document.getElementById("cr-email").value,
    senha: document.getElementById("cr-senha").value,
    endereco: document.getElementById("cr-endereco").value,
  };

  try {
    const cliente = await apiCriarCliente(dados);
    clienteAtual = { ...cliente, endereco: dados.endereco };
    salvarClienteLogado(clienteAtual);
    inicializarLayout();
    renderizarIdentificacao();
  } catch (erro) {
    mostrarMensagem(mensagens, erro.message, "erro");
  }
}

function renderizarResumo() {
  const itens = obterCarrinho();
  const subtotal = totalCarrinho();
  const desconto = calcularDesconto(subtotal);
  const total = subtotal - desconto;

  document.getElementById("itens-resumo").innerHTML = itens.map((item) => `
    <div class="resumo-total"><span>${item.quantidade}x ${item.nome}</span><span>${formatarMoeda(item.preco * item.quantidade)}</span></div>
  `).join("");

  document.getElementById("totais-resumo").innerHTML = `
    <div class="resumo-total"><span>Subtotal</span><span>${formatarMoeda(subtotal)}</span></div>
    <div class="resumo-total"><span>Desconto</span><span>-${formatarMoeda(desconto)}</span></div>
    <div class="resumo-total total"><span>Total</span><span>${formatarMoeda(total)}</span></div>
  `;
}

function calcularDesconto(subtotal) {
  if (!cupomAplicado) return 0;
  if (cupomAplicado.tipo_desconto === "percentual") {
    return subtotal * (cupomAplicado.valor / 100);
  }
  return Math.min(cupomAplicado.valor, subtotal);
}

async function aplicarCupom() {
  const codigo = document.getElementById("cupom").value.trim();
  const mensagens = document.getElementById("mensagens-cupom");
  if (!codigo) return;
  try {
    const resultado = await apiValidarCupom(codigo);
    if (!resultado.valido) {
      cupomAplicado = null;
      mostrarMensagem(mensagens, resultado.motivo, "erro");
    } else {
      cupomAplicado = resultado;
      mostrarMensagem(mensagens, `Cupom "${resultado.codigo}" aplicado!`, "sucesso");
    }
    renderizarResumo();
  } catch (erro) {
    mostrarMensagem(mensagens, erro.message, "erro");
  }
}

async function finalizarPedido(evento) {
  evento.preventDefault();
  const mensagens = document.getElementById("mensagens-checkout");

  if (!clienteAtual) {
    mostrarMensagem(mensagens, "Crie sua conta acima antes de confirmar o pedido.", "erro");
    return;
  }

  const endereco = document.getElementById("endereco").value;
  const itens = obterCarrinho().map((item) => ({
    produto_id: item.produto_id,
    quantidade: item.quantidade,
  }));

  const botao = document.getElementById("botao-finalizar");
  botao.disabled = true;
  limparMensagem(mensagens);

  try {
    const pedido = await apiCriarPedido({
      cliente_id: clienteAtual.id,
      endereco_entrega: endereco,
      cupom_codigo: cupomAplicado ? cupomAplicado.codigo : undefined,
      itens,
    });

    limparCarrinho();
    document.getElementById("checkout-form-container").innerHTML = `
      <div class="mensagem sucesso">
        Pedido #${pedido.id} confirmado! Total pago: ${formatarMoeda(pedido.total)}.
      </div>
      <a class="botao" href="conta.html">Ver meus pedidos</a>
      <a class="botao secundario" href="index.html" style="margin-left:8px">Continuar comprando</a>
    `;
  } catch (erro) {
    mostrarMensagem(mensagens, erro.message, "erro");
    botao.disabled = false;
  }
}
