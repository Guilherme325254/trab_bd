"""Conexão com o banco SQLite da loja.

Este arquivo é boilerplate de conexão — não é o foco pedagógico do
trabalho, por isso já vem pronto tanto no gabarito quanto no material
dos alunos.
"""

import sqlite3
from pathlib import Path

CAMINHO_DB = Path(__file__).parent.parent / "database" / "loja.db"


def get_connection():
    """Abre uma conexão nova com o banco, com FKs ativas e linhas
    acessíveis por nome de coluna (conn.execute(...).fetchall() retorna
    objetos sqlite3.Row, que podem ser convertidos com dict(row))."""
    conn = sqlite3.connect(CAMINHO_DB)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn
