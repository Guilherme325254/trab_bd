# Aula 1 — Construindo o banco do zero

Diferente do backend e do frontend, esta pasta **não vem com nada
pronto de propósito**: modelar e escrever o SQL do banco é o objetivo
principal da Aula 1.

## O que fazer

1. Leia com atenção `docs/especificacao-banco.md` (na raiz do projeto)
   — é o contrato de tabelas/colunas que o backend pronto espera.
2. Desenhe o DER da loja do seu grupo (ver roteiro da Aula 1).
3. Crie o arquivo **`schema.sql`** nesta pasta com todos os
   `CREATE TABLE` (siga exatamente os nomes de tabela/coluna do
   contrato; vocês podem acrescentar colunas extras opcionais).
4. Crie o arquivo **`seed.sql`** nesta pasta com os `INSERT` populando
   o banco com o tema do seu grupo (volume mínimo também está descrito
   na especificação).
5. Rode:

```bash
python3 init_db.py
```

Isso vai ler `schema.sql` e `seed.sql` desta mesma pasta e gerar o
arquivo `loja.db`, que é o banco que o backend (pasta `../backend`) vai
usar.

Recomendado: escreva e teste esse SQL primeiro no **DBeaver** (conectando
numa base SQLite apontando pra este mesmo arquivo `loja.db`), onde você vê
as tabelas e os dados numa tela em vez de só no terminal, e só depois
copie o SQL testado pros arquivos `schema.sql`/`seed.sql`. O passo a passo
completo do DBeaver está no `roteiro-dia1.pdf`, na raiz do projeto.

## Dica de validação rápida

Depois de gerar o banco, confira no terminal:

```bash
sqlite3 loja.db
sqlite> SELECT * FROM categorias;
sqlite> SELECT nome, preco, estoque FROM produtos LIMIT 5;
sqlite> .schema produtos
sqlite> .quit
```

Se algum `INSERT` falhar por violar uma FK ou um `CHECK`, é sinal de
que algo no `schema.sql` ou nos dados do `seed.sql` precisa de ajuste
— é exatamente esse tipo de erro que a Aula 1 quer treinar vocês a
identificar e corrigir.

## Não esqueçam

- `PRAGMA foreign_keys = ON;` no topo do `schema.sql` (o SQLite não
  ativa isso sozinho).
- Pelo menos um cupom vencido/inativo no `seed.sql`, para dar para
  testar a validação de cupom na Aula 3.
- Pedidos "históricos" (com itens) no `seed.sql`, para os relatórios da
  Aula 3 não ficarem vazios.
