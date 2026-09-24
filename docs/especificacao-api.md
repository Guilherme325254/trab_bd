# Especificação da API — Contrato de Endpoints

Base URL local: `http://localhost:5000/api`

Todas as respostas são JSON. Erros seguem o formato
`{"erro": "mensagem legível"}` com o status HTTP apropriado
(`400`, `401`, `404`, `409`, `501`).

`501 Not Implemented` é o que a rota retorna **antes** de o aluno
completar o TODO — é esperado ver isso até completar cada rota.

---

## Catálogo (Aula 2 — leitura)

### `GET /api/categorias`
Sem parâmetros.
```json
[
  {"id": 1, "nome": "Consoles", "descricao": "Videogames e acessórios"}
]
```

### `GET /api/produtos`
Query params (todos opcionais):
| Param | Tipo | Descrição |
|---|---|---|
| `categoria_id` | int | filtra por categoria |
| `busca` | string | procura no nome (bônus: também na descrição) |
| `ordenar_por` | `nome` \| `preco` \| `avaliacao` | padrão: `nome` |
| `direcao` | `asc` \| `desc` | padrão: `asc` |
| `pagina` | int | padrão: `1` |
| `por_pagina` | int | padrão: `12` |

```json
{
  "produtos": [
    {
      "id": 10, "nome": "Controle sem fio", "preco": 249.9,
      "estoque": 15, "imagem_url": "https://...",
      "categoria_nome": "Consoles",
      "avaliacao_media": 4.5, "total_avaliacoes": 8
    }
  ],
  "pagina": 1, "por_pagina": 12, "total": 37
}
```

### `GET /api/produtos/<id>`
```json
{
  "id": 10, "nome": "Controle sem fio", "descricao": "...",
  "preco": 249.9, "estoque": 15, "imagem_url": "https://...",
  "categoria_id": 3, "categoria_nome": "Consoles",
  "avaliacao_media": 4.5, "total_avaliacoes": 8
}
```
`404` se o produto não existir.

### `GET /api/produtos/<id>/avaliacoes`
```json
[
  {"id": 1, "cliente_nome": "Ana", "nota": 5, "comentario": "Ótimo!", "criado_em": "2026-01-10 12:00:00"}
]
```

### `POST /api/produtos/<id>/avaliacoes`
Body:
```json
{"cliente_id": 3, "nota": 5, "comentario": "Chegou rápido"}
```
Resposta `201`: a avaliação criada. `400` se `nota` fora de 1–5.

### `GET /api/produtos/destaques?limite=6`
Produtos com melhor avaliação média (empates resolvidos por mais
avaliações). Mesmo formato de item de `GET /api/produtos`.

---

## Clientes (Aula 3 — escrita)

### `POST /api/clientes`
Body:
```json
{"nome": "Ana Souza", "email": "ana@email.com", "senha": "123456", "endereco": "Rua X, 100"}
```
`201` com `{id, nome, email}`. `409` se e-mail já existir.

### `POST /api/clientes/login`
Body: `{"email": "...", "senha": "..."}`
`200` com `{id, nome, email}` se corresponder. `401` caso contrário.

### `GET /api/clientes/<id>/pedidos`
Histórico de pedidos do cliente, mais recente primeiro:
```json
[
  {"id": 5, "status": "pago", "total": 499.8, "criado_em": "2026-02-01 10:00:00"}
]
```

---

## Pedidos e cupons (Aula 3 — escrita/transação)

### `GET /api/cupons/<codigo>/validar`
```json
{"valido": true, "codigo": "BEMVINDO10", "tipo_desconto": "percentual", "valor": 10}
```
ou
```json
{"valido": false, "motivo": "Cupom expirado"}
```

### `POST /api/pedidos`
Body:
```json
{
  "cliente_id": 3,
  "endereco_entrega": "Rua X, 100",
  "cupom_codigo": "BEMVINDO10",
  "itens": [
    {"produto_id": 10, "quantidade": 2},
    {"produto_id": 4, "quantidade": 1}
  ]
}
```
`201` com o pedido criado (`id, subtotal, desconto, total, status`).
`400` se algum item não tiver estoque suficiente ou o cupom for
inválido. **Deve ser tudo ou nada**: se falhar em qualquer item, nenhum
dado é gravado (ver seção de transações do roteiro da Aula 3).

### `GET /api/pedidos/<id>`
```json
{
  "id": 5, "cliente_id": 3, "status": "pendente",
  "endereco_entrega": "Rua X, 100",
  "subtotal": 549.8, "desconto": 55.0, "total": 494.8,
  "criado_em": "2026-02-01 10:00:00",
  "itens": [
    {"produto_id": 10, "produto_nome": "Controle sem fio", "quantidade": 2, "preco_unitario": 249.9}
  ]
}
```

---

## Relatórios / Painel da Loja (Aula 3 — agregação)

### `GET /api/relatorios/resumo`
```json
{"faturamento_total": 12500.5, "total_pedidos": 34, "ticket_medio": 367.66, "total_clientes": 18}
```

### `GET /api/relatorios/mais-vendidos?limite=5`
```json
[
  {"produto_id": 10, "produto_nome": "Controle sem fio", "quantidade_vendida": 42, "faturamento": 10495.8}
]
```

### `GET /api/relatorios/faturamento-por-categoria`
```json
[
  {"categoria_id": 3, "categoria_nome": "Consoles", "faturamento": 8900.0, "quantidade_pedidos": 20}
]
```

---

## Resumo — quando cada rota é trabalhada

| Rota | Aula |
|---|---|
| `GET /api/categorias` | 2 |
| `GET /api/produtos` | 2 |
| `GET /api/produtos/<id>` | 2 |
| `GET /api/produtos/<id>/avaliacoes` | 2 |
| `GET /api/produtos/destaques` | 2 |
| `POST /api/produtos/<id>/avaliacoes` | 3 |
| `POST /api/clientes` | 3 |
| `POST /api/clientes/login` | 3 |
| `GET /api/clientes/<id>/pedidos` | 3 |
| `GET /api/cupons/<codigo>/validar` | 3 |
| `POST /api/pedidos` | 3 |
| `GET /api/pedidos/<id>` | 3 |
| `GET /api/relatorios/resumo` | 3 |
| `GET /api/relatorios/mais-vendidos` | 3 |
| `GET /api/relatorios/faturamento-por-categoria` | 3 |

Na Aula 4, nenhuma rota nova é criada — o frontend passa a **consumir**
essas 15 rotas através de `js/api.js`.
