"""API da Loja Virtual — MATERIAL DO ALUNO.

As rotas, o parsing de parâmetros e as respostas JSON já estão prontos.
O que falta em cada rota é a QUERY SQL (marcada com `# TODO`).

Enquanto uma query não for escrita, a rota responde com erro 501 e uma
mensagem dizendo exatamente o que falta — rode o servidor desde já e
vá "acendendo" as rotas uma a uma.

Contrato completo de cada rota em docs/especificacao-api.md.

Rode com:
    pip install -r requirements.txt
    python3 app.py
"""

from datetime import datetime

from flask import Flask, abort, jsonify, request
from werkzeug.exceptions import HTTPException

from db import get_connection

app = Flask(__name__)

COLUNAS_ORDENACAO = {
    "nome": "p.nome",
    "preco": "p.preco",
    "avaliacao": "avaliacao_media",
}


@app.after_request
def adicionar_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@app.errorhandler(HTTPException)
def tratar_erro_http(erro):
    return jsonify({"erro": erro.description}), erro.code


def _query_pendente(nome):
    """Chamada quando uma rota é acessada antes de a query SQL ser escrita."""
    abort(501, description=f"Complete a query SQL de '{nome}' (veja o TODO no código).")


def _validar_cupom(conn, codigo):
    """Retorna {"valido": True, ...dados...} ou {"valido": False, "motivo": ...}.
    Usada tanto por GET /api/cupons/<codigo>/validar quanto por POST /api/pedidos.
    """
    # TODO (Aula 3): SELECT id, codigo, tipo_desconto, valor, validade, ativo
    #                FROM cupons WHERE codigo = ?
    query = None
    if query is None:
        _query_pendente("_validar_cupom")
    cupom = conn.execute(query, (codigo,)).fetchone()

    if cupom is None:
        return {"valido": False, "motivo": "Cupom não encontrado"}
    if not cupom["ativo"]:
        return {"valido": False, "motivo": "Cupom inativo"}
    hoje = datetime.now().strftime("%Y-%m-%d")
    if cupom["validade"] < hoje:
        return {"valido": False, "motivo": "Cupom expirado"}
    return {
        "valido": True,
        "id": cupom["id"],
        "codigo": cupom["codigo"],
        "tipo_desconto": cupom["tipo_desconto"],
        "valor": cupom["valor"],
    }


# ===================== CATÁLOGO (Aula 2) =====================

@app.route("/api/categorias", methods=["GET"])
def listar_categorias():
    conn = get_connection()

    # TODO (Aula 2): SELECT id, nome, descricao FROM categorias, ordenado por nome
    query = None
    if query is None:
        _query_pendente("listar_categorias")

    linhas = conn.execute(query).fetchall()
    conn.close()
    return jsonify([dict(row) for row in linhas])


@app.route("/api/produtos", methods=["GET"])
def listar_produtos():
    categoria_id = request.args.get("categoria_id", type=int)
    busca = request.args.get("busca", type=str)
    ordenar_por = request.args.get("ordenar_por", default="nome")
    direcao = request.args.get("direcao", default="asc")
    pagina = max(request.args.get("pagina", default=1, type=int), 1)
    por_pagina = max(request.args.get("por_pagina", default=12, type=int), 1)

    coluna = COLUNAS_ORDENACAO.get(ordenar_por, "p.nome")
    direcao_sql = "DESC" if direcao == "desc" else "ASC"
    offset = (pagina - 1) * por_pagina

    # Filtros dinâmicos já prontos — sempre use parâmetros (?), nunca
    # concatene o valor do usuário direto na string SQL (SQL Injection!).
    condicoes = []
    parametros = []
    if categoria_id is not None:
        condicoes.append("p.categoria_id = ?")
        parametros.append(categoria_id)
    if busca:
        condicoes.append("(p.nome LIKE ? OR p.descricao LIKE ?)")
        termo = f"%{busca}%"
        parametros.extend([termo, termo])

    where_sql = f"WHERE {' AND '.join(condicoes)}" if condicoes else ""

    conn = get_connection()

    # TODO (Aula 2): SELECT principal. Precisa trazer:
    #   p.id, p.nome, p.preco, p.estoque, p.imagem_url, c.nome AS categoria_nome,
    #   AVG(a.nota) AS avaliacao_media (arredondado), COUNT(a.id) AS total_avaliacoes
    # Junte produtos + categorias (JOIN) + avaliacoes (LEFT JOIN, produto pode não
    # ter avaliação nenhuma). Use as variáveis prontas `{where_sql}`, `{coluna}`,
    # `{direcao_sql}` e pagine com "LIMIT ? OFFSET ?".
    query = None
    if query is None:
        _query_pendente("listar_produtos (SELECT principal)")
    linhas = conn.execute(query, (*parametros, por_pagina, offset)).fetchall()

    # TODO (Aula 2): conte quantos produtos batem com o MESMO filtro
    # (mesmo `where_sql`), sem LIMIT/OFFSET — usado para a paginação no frontend.
    query_total = None
    if query_total is None:
        _query_pendente("listar_produtos (contagem total)")
    total = conn.execute(query_total, parametros).fetchone()["total"]

    conn.close()
    return jsonify({
        "produtos": [dict(row) for row in linhas],
        "pagina": pagina,
        "por_pagina": por_pagina,
        "total": total,
    })


@app.route("/api/produtos/destaques", methods=["GET"])
def listar_destaques():
    limite = request.args.get("limite", default=6, type=int)
    conn = get_connection()

    # TODO (Aula 2): produtos com melhor avaliacao_media (desempate por
    # total_avaliacoes), considerando só produtos com pelo menos 1 avaliação
    # (aqui pode ser JOIN "de verdade", não precisa ser LEFT JOIN).
    query = None
    if query is None:
        _query_pendente("listar_destaques")

    linhas = conn.execute(query, (limite,)).fetchall()
    conn.close()
    return jsonify([dict(row) for row in linhas])


@app.route("/api/produtos/<int:produto_id>", methods=["GET"])
def obter_produto(produto_id):
    conn = get_connection()

    # TODO (Aula 2): mesmo espírito da query de listar_produtos, mas para UM
    # produto só. Inclua também p.descricao e p.categoria_id no resultado.
    query = None
    if query is None:
        _query_pendente("obter_produto")

    linha = conn.execute(query, (produto_id,)).fetchone()
    conn.close()
    if linha is None:
        abort(404, description="Produto não encontrado")
    return jsonify(dict(linha))


@app.route("/api/produtos/<int:produto_id>/avaliacoes", methods=["GET"])
def listar_avaliacoes(produto_id):
    conn = get_connection()

    # TODO (Aula 2): avaliações do produto com o nome de quem avaliou
    # (JOIN com clientes), mais recentes primeiro.
    query = None
    if query is None:
        _query_pendente("listar_avaliacoes")

    linhas = conn.execute(query, (produto_id,)).fetchall()
    conn.close()
    return jsonify([dict(row) for row in linhas])


# ===================== ESCRITA: AVALIAÇÕES, CLIENTES (Aula 3) =====================

@app.route("/api/produtos/<int:produto_id>/avaliacoes", methods=["POST"])
def criar_avaliacao(produto_id):
    dados = request.get_json(force=True, silent=True) or {}
    cliente_id = dados.get("cliente_id")
    nota = dados.get("nota")
    comentario = dados.get("comentario")

    if not cliente_id or not isinstance(nota, int) or not (1 <= nota <= 5):
        abort(400, description="cliente_id e nota (inteiro de 1 a 5) são obrigatórios")

    conn = get_connection()
    produto = conn.execute("SELECT id FROM produtos WHERE id = ?", (produto_id,)).fetchone()
    if produto is None:
        conn.close()
        abort(404, description="Produto não encontrado")

    # TODO (Aula 3): INSERT INTO avaliacoes (produto_id, cliente_id, nota, comentario)
    query_insert = None
    if query_insert is None:
        _query_pendente("criar_avaliacao (INSERT)")
    cursor = conn.execute(query_insert, (produto_id, cliente_id, nota, comentario))
    conn.commit()

    # TODO (Aula 3): SELECT da avaliação recém-criada (use cursor.lastrowid)
    query_select = None
    if query_select is None:
        _query_pendente("criar_avaliacao (SELECT da avaliação criada)")
    nova = conn.execute(query_select, (cursor.lastrowid,)).fetchone()
    conn.close()
    return jsonify(dict(nova)), 201


@app.route("/api/clientes", methods=["POST"])
def criar_cliente():
    dados = request.get_json(force=True, silent=True) or {}
    nome = dados.get("nome")
    email = dados.get("email")
    senha = dados.get("senha")
    endereco = dados.get("endereco")

    if not nome or not email or not senha:
        abort(400, description="nome, email e senha são obrigatórios")

    conn = get_connection()

    # TODO (Aula 3): verificar se já existe cliente com esse e-mail
    query_existe = None
    if query_existe is None:
        _query_pendente("criar_cliente (checar e-mail duplicado)")
    existente = conn.execute(query_existe, (email,)).fetchone()
    if existente is not None:
        conn.close()
        abort(409, description="Já existe um cliente com esse e-mail")

    # TODO (Aula 3): INSERT INTO clientes (nome, email, senha, endereco)
    query_insert = None
    if query_insert is None:
        _query_pendente("criar_cliente (INSERT)")
    cursor = conn.execute(query_insert, (nome, email, senha, endereco))
    conn.commit()
    novo_id = cursor.lastrowid
    conn.close()
    return jsonify({"id": novo_id, "nome": nome, "email": email}), 201


@app.route("/api/clientes/login", methods=["POST"])
def login_cliente():
    dados = request.get_json(force=True, silent=True) or {}
    email = dados.get("email")
    senha = dados.get("senha")

    conn = get_connection()

    # TODO (Aula 3): buscar cliente por email E senha (retorne id, nome, email)
    query = None
    if query is None:
        _query_pendente("login_cliente")
    cliente = conn.execute(query, (email, senha)).fetchone()
    conn.close()

    if cliente is None:
        abort(401, description="E-mail ou senha inválidos")
    return jsonify(dict(cliente))


@app.route("/api/clientes/<int:cliente_id>/pedidos", methods=["GET"])
def listar_pedidos_cliente(cliente_id):
    conn = get_connection()

    # TODO (Aula 3): pedidos do cliente (id, status, total, criado_em), mais recentes primeiro
    query = None
    if query is None:
        _query_pendente("listar_pedidos_cliente")

    linhas = conn.execute(query, (cliente_id,)).fetchall()
    conn.close()
    return jsonify([dict(row) for row in linhas])


# ===================== CUPONS E PEDIDOS (Aula 3) =====================

@app.route("/api/cupons/<codigo>/validar", methods=["GET"])
def validar_cupom(codigo):
    conn = get_connection()
    resultado = _validar_cupom(conn, codigo)
    conn.close()
    resultado.pop("id", None)
    return jsonify(resultado)


@app.route("/api/pedidos", methods=["POST"])
def criar_pedido():
    """O desafio principal da Aula 3: uma transação de verdade.

    Se qualquer passo falhar (produto sem estoque, cupom inválido...),
    NADA deve ser gravado no banco — por isso tudo roda dentro de um
    try/except que faz rollback em caso de erro.
    """
    dados = request.get_json(force=True, silent=True) or {}
    cliente_id = dados.get("cliente_id")
    endereco_entrega = dados.get("endereco_entrega")
    cupom_codigo = dados.get("cupom_codigo")
    itens = dados.get("itens") or []

    if not cliente_id or not endereco_entrega or not itens:
        abort(400, description="cliente_id, endereco_entrega e itens são obrigatórios")

    conn = get_connection()
    try:
        cliente = conn.execute("SELECT id FROM clientes WHERE id = ?", (cliente_id,)).fetchone()
        if cliente is None:
            abort(404, description="Cliente não encontrado")

        # ===== PASSO 1: verificar estoque e calcular subtotal =====
        subtotal = 0.0
        itens_resolvidos = []
        for item in itens:
            produto_id = item.get("produto_id")
            quantidade = item.get("quantidade")
            if not produto_id or not quantidade or quantidade <= 0:
                abort(400, description="Cada item precisa de produto_id e quantidade > 0")

            # TODO (Aula 3): SELECT id, preco, estoque FROM produtos WHERE id = ?
            query_produto = None
            if query_produto is None:
                _query_pendente("criar_pedido (busca do produto)")
            produto = conn.execute(query_produto, (produto_id,)).fetchone()

            if produto is None:
                abort(404, description=f"Produto {produto_id} não encontrado")
            if produto["estoque"] < quantidade:
                abort(400, description=f"Estoque insuficiente para o produto {produto_id}")

            preco_unitario = produto["preco"]
            subtotal += preco_unitario * quantidade
            itens_resolvidos.append((produto_id, quantidade, preco_unitario))

        # ===== PASSO 2: validar cupom (se houver) e calcular desconto =====
        # (a query fica em _validar_cupom, lá em cima — comece por ela)
        cupom_id = None
        desconto = 0.0
        if cupom_codigo:
            resultado_cupom = _validar_cupom(conn, cupom_codigo)
            if not resultado_cupom["valido"]:
                abort(400, description=resultado_cupom["motivo"])
            cupom_id = resultado_cupom["id"]
            if resultado_cupom["tipo_desconto"] == "percentual":
                desconto = subtotal * (resultado_cupom["valor"] / 100)
            else:
                desconto = resultado_cupom["valor"]
            desconto = min(desconto, subtotal)

        total = subtotal - desconto

        # ===== PASSO 3: inserir o pedido =====
        # TODO: INSERT INTO pedidos (cliente_id, cupom_id, endereco_entrega,
        #                            subtotal, desconto, total) VALUES (?,?,?,?,?,?)
        # (status usa o DEFAULT 'pendente' da tabela, não precisa informar)
        query_pedido = None
        if query_pedido is None:
            _query_pendente("criar_pedido (INSERT em pedidos)")
        cursor = conn.execute(
            query_pedido,
            (cliente_id, cupom_id, endereco_entrega, subtotal, desconto, total),
        )
        pedido_id = cursor.lastrowid

        # ===== PASSO 4: inserir os itens e dar baixa no estoque =====
        # TODO: INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
        query_item = None
        # TODO: UPDATE produtos SET estoque = estoque - ? WHERE id = ?
        query_baixa_estoque = None
        if query_item is None or query_baixa_estoque is None:
            _query_pendente("criar_pedido (INSERT em itens_pedido / UPDATE de estoque)")

        for produto_id, quantidade, preco_unitario in itens_resolvidos:
            conn.execute(query_item, (pedido_id, produto_id, quantidade, preco_unitario))
            conn.execute(query_baixa_estoque, (quantidade, produto_id))

        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

    return jsonify({
        "id": pedido_id,
        "subtotal": round(subtotal, 2),
        "desconto": round(desconto, 2),
        "total": round(total, 2),
        "status": "pendente",
    }), 201


@app.route("/api/pedidos/<int:pedido_id>", methods=["GET"])
def obter_pedido(pedido_id):
    conn = get_connection()

    # TODO (Aula 3): SELECT do pedido pelo id (id, cliente_id, status,
    # endereco_entrega, subtotal, desconto, total, criado_em)
    query_pedido = None
    if query_pedido is None:
        _query_pendente("obter_pedido (SELECT do pedido)")
    pedido = conn.execute(query_pedido, (pedido_id,)).fetchone()
    if pedido is None:
        conn.close()
        abort(404, description="Pedido não encontrado")

    # TODO (Aula 3): SELECT dos itens do pedido, com o nome do produto (JOIN)
    query_itens = None
    if query_itens is None:
        _query_pendente("obter_pedido (SELECT dos itens)")
    itens = conn.execute(query_itens, (pedido_id,)).fetchall()
    conn.close()

    resultado = dict(pedido)
    resultado["itens"] = [dict(row) for row in itens]
    return jsonify(resultado)


# ===================== RELATÓRIOS / PAINEL DA LOJA (Aula 3) =====================

@app.route("/api/relatorios/resumo", methods=["GET"])
def relatorio_resumo():
    conn = get_connection()

    # TODO (Aula 3): de `pedidos` (ignorando status = 'cancelado'), calcule
    # faturamento_total (SUM de total), total_pedidos (COUNT) e ticket_medio (AVG de total)
    query = None
    if query is None:
        _query_pendente("relatorio_resumo")
    linha = conn.execute(query).fetchone()

    # TODO (Aula 3): COUNT total de clientes cadastrados
    query_clientes = None
    if query_clientes is None:
        _query_pendente("relatorio_resumo (total de clientes)")
    total_clientes = conn.execute(query_clientes).fetchone()["total"]

    conn.close()
    return jsonify({
        "faturamento_total": round(linha["faturamento_total"], 2),
        "total_pedidos": linha["total_pedidos"],
        "ticket_medio": round(linha["ticket_medio"], 2),
        "total_clientes": total_clientes,
    })


@app.route("/api/relatorios/mais-vendidos", methods=["GET"])
def relatorio_mais_vendidos():
    limite = request.args.get("limite", default=5, type=int)
    conn = get_connection()

    # TODO (Aula 3): junte itens_pedido + produtos + pedidos (ignorando
    # cancelados) e traga produto_id, produto_nome, quantidade_vendida (SUM)
    # e faturamento (SUM de quantidade*preco_unitario), do mais vendido pro
    # menos vendido, limitado por `limite`.
    query = None
    if query is None:
        _query_pendente("relatorio_mais_vendidos")

    linhas = conn.execute(query, (limite,)).fetchall()
    conn.close()
    return jsonify([dict(row) for row in linhas])


@app.route("/api/relatorios/faturamento-por-categoria", methods=["GET"])
def relatorio_faturamento_categoria():
    conn = get_connection()

    # TODO (Aula 3): faturamento e quantidade de pedidos distintos por
    # categoria. Use LEFT JOIN a partir de `categorias` para que categorias
    # sem nenhuma venda ainda apareçam com faturamento 0.
    query = None
    if query is None:
        _query_pendente("relatorio_faturamento_categoria")

    linhas = conn.execute(query).fetchall()
    conn.close()
    return jsonify([dict(row) for row in linhas])


if __name__ == "__main__":
    app.run(debug=True, port=5000)
