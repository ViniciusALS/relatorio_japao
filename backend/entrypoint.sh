#!/bin/bash
# Entrypoint do container backend.
# Aguarda o PostgreSQL estar pronto, aplica migracoes e inicia o servidor.

set -e

echo "Aguardando PostgreSQL..."
until pg_isready -h "${DB_HOST:-db}" -p "${DB_PORT:-5432}" -U "${DB_USER:-admin}" > /dev/null 2>&1; do
  sleep 1
done
echo "PostgreSQL disponivel."

echo "Aplicando migracoes..."
python manage.py migrate --noinput

echo "Carregando dados iniciais (se tabelas estiverem vazias)..."
python manage.py loaddata fixtures/sample_data.json --ignorenonexistent 2>/dev/null || echo "Fixtures ja carregadas ou nao encontradas."

echo "Iniciando servidor..."
exec python manage.py runserver 0.0.0.0:8000
