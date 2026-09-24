"""Cria (ou recria) o banco loja.db a partir de schema.sql + seed.sql.

Uso:
    python3 init_db.py

Este script é utilitário/boilerplate — não contém a lógica de banco de
dados que é o objetivo pedagógico do trabalho (isso está em schema.sql e
seed.sql), por isso é entregue pronto tanto no gabarito quanto para os
alunos.
"""

import sqlite3
from pathlib import Path

PASTA = Path(__file__).parent
CAMINHO_DB = PASTA / "loja.db"
CAMINHO_SCHEMA = PASTA / "schema.sql"
CAMINHO_SEED = PASTA / "seed.sql"


def main():
    if not CAMINHO_SCHEMA.exists():
        print(
            f"Não encontrei '{CAMINHO_SCHEMA.name}' nesta pasta.\n"
            "Crie primeiro o schema.sql (ver LEIA-ME.md e "
            "docs/especificacao-banco.md) e rode este script de novo."
        )
        return

    if CAMINHO_DB.exists():
        resposta = input(f"'{CAMINHO_DB.name}' já existe. Apagar e recriar? [s/N] ")
        if resposta.strip().lower() != "s":
            print("Operação cancelada.")
            return
        CAMINHO_DB.unlink()

    conn = sqlite3.connect(CAMINHO_DB)
    conn.execute("PRAGMA foreign_keys = ON")

    schema_sql = CAMINHO_SCHEMA.read_text(encoding="utf-8")
    conn.executescript(schema_sql)
    print(f"Schema aplicado a partir de {CAMINHO_SCHEMA.name}")

    if CAMINHO_SEED.exists():
        seed_sql = CAMINHO_SEED.read_text(encoding="utf-8")
        conn.executescript(seed_sql)
        print(f"Dados inseridos a partir de {CAMINHO_SEED.name}")
    else:
        print(f"Aviso: {CAMINHO_SEED.name} não encontrado — banco criado sem dados.")

    conn.commit()
    conn.close()
    print(f"Banco criado com sucesso em {CAMINHO_DB}")


if __name__ == "__main__":
    main()
