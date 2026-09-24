# Trabalho de Banco de Dados: Loja Virtual

Projeto individual ou em dupla. Você monta o banco, completa a API e liga
o frontend em cima de uma loja virtual com o tema que quiser (games, pet
shop, papelaria, streetwear, o que preferir). A estrutura de tabelas e de
rotas é a mesma pra todo mundo, o que muda é o conteúdo.

## Comece por aqui

1. Leia `roteiro-dia1.pdf`. Ele cobre desde o fork no GitHub até deixar as
   15 rotas da API funcionando.
2. Leia `roteiro-dia2.pdf` no dia seguinte. Ele cobre ligar o site na API.

Os PDFs têm o passo a passo completo, incluindo os comandos de git e os
pontos de commit. Este README é só o mapa da pasta.

## Estrutura

```
docs/
  especificacao-banco.md   contrato de tabelas e colunas
  especificacao-api.md     contrato das rotas da API
material-alunos/
  database/   voce cria schema.sql e seed.sql aqui (ver LEIA-ME.md)
  backend/    app.py com as rotas prontas, faltam as queries SQL (# TODO)
  frontend/   site pronto, falta implementar js/api.js
roteiro-dia1.pdf
roteiro-dia2.pdf
```

## Antes de começar

Você já resolveu as queries SQL desse projeto no bdcp2 (tarefas `ecom01` a
`ecom19`). O roteiro mostra exatamente qual exercício do bdcp2 corresponde
a qual rota da API e a qual função do frontend, então mantenha o acesso ao
bdcp2 aberto durante os dois dias.

## Requisitos

- Python 3.10+
- `sqlite3` (já vem instalado no Mac e na maioria das distros Linux; no
  Windows, se não tiver, vem junto com a instalação do Python)
