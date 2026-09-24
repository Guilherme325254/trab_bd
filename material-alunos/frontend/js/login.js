// Lógica da página de login (login.html) — já pronta.

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("form-login").addEventListener("submit", fazerLogin);
});

async function fazerLogin(evento) {
  evento.preventDefault();
  const mensagens = document.getElementById("mensagens");
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    const cliente = await apiLogin({ email, senha });
    salvarClienteLogado(cliente);
    const redirecionar = obterParametroURL("redirect") || "conta.html";
    window.location.href = redirecionar;
  } catch (erro) {
    mostrarMensagem(mensagens, erro.message, "erro");
  }
}
