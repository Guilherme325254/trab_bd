// Lógica da página de cadastro (cadastro.html) — já pronta.

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("form-cadastro").addEventListener("submit", cadastrar);
});

async function cadastrar(evento) {
  evento.preventDefault();
  const mensagens = document.getElementById("mensagens");
  const dados = {
    nome: document.getElementById("nome").value,
    email: document.getElementById("email").value,
    senha: document.getElementById("senha").value,
    endereco: document.getElementById("endereco").value,
  };

  try {
    const cliente = await apiCriarCliente(dados);
    salvarClienteLogado({ ...cliente, endereco: dados.endereco });
    mostrarMensagem(mensagens, "Cadastro realizado! Redirecionando...", "sucesso");
    setTimeout(() => { window.location.href = "conta.html"; }, 900);
  } catch (erro) {
    mostrarMensagem(mensagens, erro.message, "erro");
  }
}
