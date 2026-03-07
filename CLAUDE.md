# Relatorio JRC Brasil

Sistema de compliance de TI para a JRC Brasil - gera e gerencia 19 relatorios de auditoria de seguranca da informacao exigidos pela matriz japonesa. Trabalho universitario (Lab. Desenvolvimento de Software).

## Documentacao de Referencia

- [ANALISE.md](ANALISE.md) - Analise das 2 versoes originais (Node.js + Django), modelos, relatorios
- [PLANO_IMPLEMENTACAO.md](PLANO_IMPLEMENTACAO.md) - 7 fases de implementacao, endpoints, checklists
- [docs/BACKEND.md](docs/BACKEND.md) - Referencia profunda Django/DRF
- [docs/FRONTEND.md](docs/FRONTEND.md) - Referencia profunda React SPA
- [docs/INFRA.md](docs/INFRA.md) - Docker, deploy, troubleshooting

## Arquitetura

```
React SPA (:3000)  <-->  Django REST API (:8000)  <-->  PostgreSQL (:5432)
```

**Backend em camadas:**

```
Request → urls.py (Route) → Controller → Service → Repository → Model/DB
                                |
                           Serializer (validacao/formatacao)
```

| Camada | Arquivo | Responsabilidade |
|--------|---------|-----------------|
| Route | `urls.py` | Mapeamento URL → Controller |
| Controller | `controllers.py` | HTTP request/response, permissoes, chama service |
| Service | `services.py` | Logica de negocio, orquestracao entre repositories |
| Repository | `repositories.py` | Acesso a dados (ORM), soft delete, queries |
| Entity/Model | `models.py` | Definicao de campos, BaseModel |
| Serializer | `serializers.py` | Validacao de input, formatacao de output |

- **Backend:** Django 4.2 + DRF + PostgreSQL
- **Frontend:** React 18 + React Router + Axios + Bootstrap 5
- **Auth:** JWT via djangorestframework-simplejwt
- **Deploy:** Docker Compose (3 containers: db, backend, frontend)

## Estrutura do Monorepo

```
relatorio_japao/
├── CLAUDE.md
├── ANALISE.md
├── PLANO_IMPLEMENTACAO.md
├── README.md
├── docker-compose.yml
├── .env
├── docs/
│   ├── BACKEND.md
│   ├── FRONTEND.md
│   └── INFRA.md
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── manage.py
│   ├── config/          (settings, urls, wsgi, asgi)
│   ├── accounts/        (auth JWT: controllers, services)
│   ├── core/            (14 modelos + controllers/services/repositories)
│   └── reports/         (19 relatorios: controllers/services/repositories/exporters)
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── nginx.conf
    ├── public/
    └── src/
        ├── api/         (Axios client)
        ├── auth/        (AuthContext, ProtectedRoute)
        ├── components/  (Navbar, Card, DataTable, etc.)
        ├── pages/       (Login, Home, Cadastro, Relatorios, etc.)
        └── routes/
```

## Comandos Rapidos

```bash
# Docker - subir tudo
docker-compose up --build

# Backend (sem Docker)
cd backend
python -m venv venv && source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Frontend (sem Docker)
cd frontend
npm install
npm start

# Testes
cd backend && pytest
cd frontend && npm test

# Banco
python manage.py makemigrations
python manage.py migrate
python manage.py loaddata fixtures/sample_data.json
python manage.py shell
```

## Convencoes

| Aspecto | Convencao |
|---------|-----------|
| Codigo (variaveis, classes, funcoes) | Ingles (EN) |
| Interface do usuario (labels, mensagens) | Portugues (PT-BR) |
| Documentacao | Portugues (PT-BR) |
| Commits | Ingles (EN) |
| Nomes de modelos Django | PascalCase, singular, ingles |
| Nomes de campos | snake_case, ingles |
| URLs da API | kebab-case, plural, ingles |
| Componentes React | PascalCase |
| Controllers | `XxxController` (PascalCase), arquivo `controllers.py` |
| Services | `XxxService` (PascalCase), arquivo `services.py` |
| Repositories | `XxxRepository` (PascalCase), arquivo `repositories.py` |

## Padrao Critico: Soft Delete

Todos os modelos herdam de `BaseModel` que implementa soft delete:

```python
class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = SoftDeleteManager()  # Filtra deleted_at=None por padrao
    all_objects = models.Manager()  # Inclui deletados

    class Meta:
        abstract = True

    def soft_delete(self):
        self.deleted_at = timezone.now()
        self.save(update_fields=['deleted_at'])
```

**NUNCA use `.delete()` fisico. Sempre use `.soft_delete()`.**

Soft delete deve ser feito via repository:

```python
class BaseRepository:
    def soft_delete(self, instance):
        instance.soft_delete()
```

## Autenticacao JWT

| Endpoint | Metodo | Descricao |
|----------|--------|-----------|
| `/api/auth/login/` | POST | Gera access + refresh token |
| `/api/auth/refresh/` | POST | Renova access token |
| `/api/auth/register/` | POST | Cria novo usuario |
| `/api/auth/me/` | GET | Dados do usuario logado |
| `/api/auth/logout/` | POST | Invalida refresh token |

- Access token: 30 min / Refresh token: 1 dia
- Frontend armazena tokens em localStorage
- Axios interceptor adiciona `Bearer <token>` automaticamente

## API REST

- **Base URL:** `/api/`
- **CRUD endpoints:** `/api/collaborators/`, `/api/machines/`, `/api/software/`, `/api/emails/`, `/api/cellphones/`, `/api/wifi/`, `/api/antivirus/`, `/api/servers/`, `/api/server-access/`, `/api/erp-access/`, `/api/data-destroyed/`, `/api/pen-drives/`
- **Relatorios:** `/api/reports/{numero}/` (08, 09, 13, 15, 17, 19-26, 28, 29, 31, 33-35, 37)
- **Paginacao:** PageNumberPagination, 20 itens/pagina
- **Filtros:** django-filter por campos, SearchFilter, OrderingFilter
- **Exportacao:** `?format=pdf` ou `?format=xlsx`

## Anti-patterns (NAO FACA)

- **Raw SQL** - Use Django ORM (QuerySets). Nunca `cursor.execute()`.
- **Delete fisico** - Use `soft_delete()`. Nunca `Model.objects.delete()`.
- **URLs hardcoded no frontend** - Use variavel de ambiente `REACT_APP_API_URL`.
- **Sem CORS** - Sempre configure `django-cors-headers`.
- **Token em cookie** - Use localStorage + Axios interceptor.
- **Controllers sem autenticacao** - Todos os controllers precisam de `IsAuthenticated` (exceto login/register).
- **Queries N+1** - Use `select_related()` e `prefetch_related()`.
- **Logica de negocio em controllers ou repositories** - Mantenha controllers finos, logica nos services.
- **Controllers chamando ORM diretamente** - Use repositories para todo acesso a dados.
- **Services retornando Response** - Services retornam dados puros (QuerySets, dicts), nunca objetos HTTP.
- **Imports relativos entre apps** - Cada app Django importa apenas do proprio app ou de `core`.
- **Migracoes manuais** - Sempre use `makemigrations`, nunca edite migracoes manualmente.
- **SECRET_KEY exposta** - Use `python-decouple` para ler do `.env`.
- **DEBUG=True em producao** - Sempre `False` em prod.

## Dominio de Negocio (Resumo)

**3 Entidades Principais:**
- **Collaborator** - Funcionario da JRC (nome, dominio, status, permissoes)
- **Machine** - Computador/notebook (model, service_tag, IP, MAC, criptografia)
- **Software** - Licenca de software (nome, chave, tipo licenca, uso)

**11 Entidades Dependentes:**
- Email, Cellphone, Wifi, AntiVirus, Server, ServerAccess, ServerErpAccess, DataDestroyed, PenDrive, CollaboratorSoftware (N:N), CollaboratorMachine (N:N)

**19 Relatorios de Auditoria:**
Cobrem: contatos internos, computadores, usuarios de dominio, acesso a servidor/internet/ERP, licencas de software, criptografia de notebooks, celulares corporativos, destruicao de dados, emails, pendrives, antivirus, atualizacoes de seguranca, WiFi, backup de servidores.

> Ver tabela completa em [ANALISE.md](ANALISE.md#19-relatorios-implementados) e [docs/BACKEND.md](docs/BACKEND.md).
