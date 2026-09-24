# Especificação do Banco de Dados — Contrato Técnico

Este é o **contrato** que toda loja deve seguir, independente do tema
escolhido pelo grupo. O backend pronto (que vocês vão completar com SQL)
espera exatamente estes nomes de tabela e de coluna — por isso eles não
podem ser traduzidos/renomeados. O que muda de grupo para grupo é o
**conteúdo** (nomes de produtos, categorias, descrições, imagens).

Vocês têm liberdade para:
- Acrescentar colunas extras próprias do tema, desde que aceitem `NULL`
  ou tenham um valor `DEFAULT` (assim não quebram os `INSERT`s do
  backend pronto).
- Acrescentar tabelas extras, se quiserem ir além (ex.: `favoritos`),
  mas isso não é obrigatório nem será testado pela API pronta.

Não podem: remover colunas obrigatórias, mudar seus tipos de forma
incompatível, ou remover uma FK obrigatória.

## Diagrama (visão geral dos relacionamentos)

```
categorias 1───N produtos 1───N itens_pedido N───1 pedidos N───1 clientes
                    │                                          │
                    └──────────────N avaliacoes N───────────────┘
                                       │
                                    clientes

cupons 1───N pedidos (opcional: um pedido pode não ter cupom)
```

## Tabelas obrigatórias

### `categorias`
| Coluna | Tipo | Regras |
|---|---|---|
| id | INTEGER | PK, autoincremento |
| nome | TEXT | `NOT NULL`, `UNIQUE` |
| descricao | TEXT | opcional |

### `produtos`
| Coluna | Tipo | Regras |
|---|---|---|
| id | INTEGER | PK, autoincremento |
| nome | TEXT | `NOT NULL` |
| descricao | TEXT | opcional |
| preco | REAL | `NOT NULL`, `CHECK (preco >= 0)` |
| estoque | INTEGER | `NOT NULL`, `DEFAULT 0`, `CHECK (estoque >= 0)` |
| imagem_url | TEXT | opcional (pode ser um link de imagem qualquer) |
| categoria_id | INTEGER | `NOT NULL`, FK → `categorias(id)` |
| criado_em | TEXT | `NOT NULL`, `DEFAULT (datetime('now'))` |

### `clientes`
| Coluna | Tipo | Regras |
|---|---|---|
| id | INTEGER | PK, autoincremento |
| nome | TEXT | `NOT NULL` |
| email | TEXT | `NOT NULL`, `UNIQUE` |
| senha | TEXT | `NOT NULL` (texto puro está OK para este trabalho didático — **não** é como se faz em produção; comente isso em aula) |
| endereco | TEXT | opcional |
| criado_em | TEXT | `NOT NULL`, `DEFAULT (datetime('now'))` |

### `cupons`
| Coluna | Tipo | Regras |
|---|---|---|
| id | INTEGER | PK, autoincremento |
| codigo | TEXT | `NOT NULL`, `UNIQUE` |
| tipo_desconto | TEXT | `NOT NULL`, `CHECK (tipo_desconto IN ('percentual','fixo'))` |
| valor | REAL | `NOT NULL`, `CHECK (valor > 0)` |
| validade | TEXT | `NOT NULL` (data no formato `YYYY-MM-DD`) |
| ativo | INTEGER | `NOT NULL`, `DEFAULT 1`, `CHECK (ativo IN (0,1))` |

> Dica da Aula 1: cadastrem pelo menos um cupom com `validade` no
> passado e/ou `ativo = 0`, para poder testar a validação na Aula 3.

### `pedidos`
| Coluna | Tipo | Regras |
|---|---|---|
| id | INTEGER | PK, autoincremento |
| cliente_id | INTEGER | `NOT NULL`, FK → `clientes(id)` |
| cupom_id | INTEGER | opcional, FK → `cupons(id)` |
| status | TEXT | `NOT NULL`, `DEFAULT 'pendente'`, `CHECK (status IN ('pendente','pago','enviado','entregue','cancelado'))` |
| endereco_entrega | TEXT | `NOT NULL` |
| subtotal | REAL | `NOT NULL` |
| desconto | REAL | `NOT NULL`, `DEFAULT 0` |
| total | REAL | `NOT NULL` |
| criado_em | TEXT | `NOT NULL`, `DEFAULT (datetime('now'))` |

### `itens_pedido`
| Coluna | Tipo | Regras |
|---|---|---|
| id | INTEGER | PK, autoincremento |
| pedido_id | INTEGER | `NOT NULL`, FK → `pedidos(id)` |
| produto_id | INTEGER | `NOT NULL`, FK → `produtos(id)` |
| quantidade | INTEGER | `NOT NULL`, `CHECK (quantidade > 0)` |
| preco_unitario | REAL | `NOT NULL` (preço do produto **no momento da compra** — não usar o preço atual do produto ao exibir pedidos antigos!) |

### `avaliacoes`
| Coluna | Tipo | Regras |
|---|---|---|
| id | INTEGER | PK, autoincremento |
| produto_id | INTEGER | `NOT NULL`, FK → `produtos(id)` |
| cliente_id | INTEGER | `NOT NULL`, FK → `clientes(id)` |
| nota | INTEGER | `NOT NULL`, `CHECK (nota BETWEEN 1 AND 5)` |
| comentario | TEXT | opcional |
| criado_em | TEXT | `NOT NULL`, `DEFAULT (datetime('now'))` |

## Índices recomendados (não obrigatórios, mas boa prática)

```sql
CREATE INDEX idx_produtos_categoria ON produtos(categoria_id);
CREATE INDEX idx_itens_pedido_pedido ON itens_pedido(pedido_id);
CREATE INDEX idx_itens_pedido_produto ON itens_pedido(produto_id);
CREATE INDEX idx_avaliacoes_produto ON avaliacoes(produto_id);
```

## Volume mínimo de dados para o `seed.sql` (Aula 1)

Para que as consultas de agregação da Aula 3 (mais vendidos,
faturamento por categoria) façam sentido, o `seed.sql` do grupo precisa
ter, no mínimo:

- 5 categorias
- 20 produtos (distribuídos entre as categorias, com preços e estoques variados)
- 5 clientes
- 3 cupons (pelo menos 1 inválido — vencido ou inativo)
- 5 pedidos "históricos" já com itens em `itens_pedido` (para simular
  vendas passadas — sem isso, o Painel da Loja da Aula 3 ficará vazio)
- 10 avaliações espalhadas entre os produtos

Não esqueçam de rodar `PRAGMA foreign_keys = ON;` (ou garantir que o
script de inicialização já faz isso) para que os erros de integridade
referencial apareçam **agora**, na Aula 1, e não como um bug estranho
depois.
