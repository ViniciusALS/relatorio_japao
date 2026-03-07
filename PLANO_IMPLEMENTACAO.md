# Plano de Implementacao - Relatorio JRC Brasil

## Arquitetura Proposta

**Monorepo: Django REST Framework + React SPA**

```
Cliente (React SPA)  <-->  API REST (Django + DRF)  <-->  PostgreSQL
     :3000                      :8000                       :5432
```

- **Backend:** Django 4.2 + Django REST Framework + PostgreSQL
- **Frontend:** React 18 + React Router + Axios + Bootstrap 5
- **Auth:** JWT via djangorestframework-simplejwt
- **Deploy:** Docker Compose (3 containers)

---

## Estrutura de Diretorios do Produto Final

```
relatorio_japao/
├── docs/                           (documentacao do projeto)
│   ├── ANALISE.md
│   └── PLANO_IMPLEMENTACAO.md
├── docker-compose.yml              (orquestracao dos 3 servicos)
├── .env                            (variaveis de ambiente)
├── .gitignore
├── README.md
│
├── backend/                        (Django REST API)
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── manage.py
│   ├── config/                     (projeto Django - settings, urls, wsgi)
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── accounts/                   (app: autenticacao JWT)
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── controllers.py         (HTTP layer)
│   │   ├── services.py            (logica de auth)
│   │   ├── urls.py
│   │   └── tests.py
│   ├── core/                       (app: modelos de negocio + CRUDs)
│   │   ├── models.py              (14 modelos + BaseModel)
│   │   ├── serializers.py
│   │   ├── controllers.py         (HTTP layer - substitui views.py)
│   │   ├── services.py            (logica de negocio)
│   │   ├── repositories.py        (acesso a dados ORM)
│   │   ├── urls.py
│   │   ├── admin.py
│   │   ├── filters.py
│   │   └── tests/
│   │       ├── test_controllers.py
│   │       ├── test_services.py
│   │       └── test_repositories.py
│   ├── reports/                    (app: 19 relatorios de compliance)
│   │   ├── serializers.py
│   │   ├── controllers.py         (HTTP layer + format negotiation)
│   │   ├── services.py            (gera dados, delega export)
│   │   ├── repositories.py        (queries especificas por relatorio)
│   │   ├── urls.py
│   │   ├── exporters.py           (geracao PDF/Excel)
│   │   └── tests/
│   └── fixtures/                   (dados de teste)
│       └── sample_data.json
│
├── frontend/                       (React SPA)
│   ├── Dockerfile
│   ├── package.json
│   ├── public/
│   ├── src/
│   │   ├── index.js
│   │   ├── App.js
│   │   ├── api/                   (configuracao Axios)
│   │   │   └── client.js
│   │   ├── auth/                  (contexto de autenticacao)
│   │   │   ├── AuthContext.js
│   │   │   └── ProtectedRoute.js
│   │   ├── components/            (componentes reutilizaveis)
│   │   │   ├── Navbar.js
│   │   │   ├── Card.js
│   │   │   ├── SearchBar.js
│   │   │   └── DataTable.js
│   │   ├── pages/                 (paginas da aplicacao)
│   │   │   ├── Login.js
│   │   │   ├── Home.js
│   │   │   ├── Cadastro.js
│   │   │   ├── Relatorios.js
│   │   │   └── ReportView.js
│   │   └── routes/
│   │       └── Routes.js
│   └── nginx.conf                 (servir build em producao)
│
└── avaliacaoA2/                    (codigo original - referencia)
└── relatorio-jrc-main/             (codigo original - referencia)
```

---

## Fases de Implementacao

### Fase 1: Setup do Projeto e Dependencias

**Objetivo:** Criar a estrutura base do monorepo com Django e React configurados.

**Backend - Dependencias (requirements.txt):**
```
Django==4.2.7
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.0
django-cors-headers==4.3.1
django-filter==23.3
psycopg2-binary==2.9.9
python-decouple==3.8
gunicorn==21.2.0
reportlab==4.0.8
openpyxl==3.1.2
```

**Frontend - Dependencias (package.json):**
```
react: ^18.2.0
react-dom: ^18.2.0
react-router-dom: ^6.11.1
axios: ^1.6.0
react-bootstrap: ^2.7.4
bootstrap: ^5.2.3
```

**Docker Compose:**
```yaml
services:
  db:
    image: postgres:13.5
    environment:
      POSTGRES_DB: relatoriojapao
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    command: python manage.py runserver 0.0.0.0:8000
    ports:
      - "8000:8000"
    depends_on:
      - db
    env_file:
      - .env

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

**Tarefas:**
- [ ] Criar estrutura de pastas conforme diagrama acima
- [ ] Inicializar projeto Django (`django-admin startproject config .`)
- [ ] Criar apps: `accounts`, `core`, `reports`
- [ ] Inicializar React app (`npx create-react-app frontend`)
- [ ] Configurar `settings.py` (database PostgreSQL, CORS, REST Framework)
- [ ] Configurar Docker Compose
- [ ] Testar `docker-compose up` (todos os servicos sobem)

**Entregavel:** Projeto base rodando com pagina inicial "Hello World" em ambos frontend e backend.

---

### Fase 2: Modelos Django (14 Modelos)

**Objetivo:** Converter todos os 14 modelos do Prisma para Django ORM.

**Tabela completa de modelos a implementar:**

| # | Modelo | Campos | Tipo | FK/Relacao |
|---|--------|--------|------|------------|
| 1 | **Collaborator** | full_name (CharField unique), domain_user (CharField unique), status (Bool), perm_acess_internet (Bool), date_hired (DateTimeField), fired (Bool), date_fired (DateTimeField null), acess_wifi (Bool), admin_privilege (Bool), office (CharField) | Principal | - |
| 2 | **Machine** | model (CharField), type (CharField), service_tag (CharField unique), operacional_system (CharField), ram_memory (CharField), disk_memory (CharField), ip (CharField unique), mac_address (CharField unique), administrator (CharField), cod_jdb (CharField), date_purchase (DateTimeField), quantity (IntField), crypto_disk (Bool), crypto_usb (Bool), crypto_memory_card (Bool), sold_out (Bool), date_sold_out (DateTimeField null) | Principal | - |
| 3 | **Software** | software_name (CharField null), key (CharField), quantity (IntField), type_licence (CharField), quantity_purchase (IntField), last_purchase_date (DateTimeField), on_use (IntField), departament (CharField), observation (TextField) | Principal | - |
| 4 | **Email** | email (CharField), remark (CharField), email_creation (DateTimeField), until (DateTimeField null) | Dependente | FK -> Collaborator |
| 5 | **Cellphone** | model (CharField), operacional_system (CharField), phone_number (CharField), status (Bool), approved (Bool), have_password (Bool), first_sinc (CharField), device_id (CharField) | Dependente | FK -> Collaborator |
| 6 | **Wifi** | wifi_name (CharField), protection (CharField), january..december (BoolField x12), year (IntField) | Dependente | FK -> Collaborator |
| 7 | **AntiVirus** | january_updated..december_updated (Bool x12), january_check..december_check (Bool x12), year (IntField) | Dependente | FK -> Machine |
| 8 | **Server** | have_backup (Bool), backup_date (DateTimeField null) | Dependente | FK -> Machine |
| 9 | **ServerAccess** | level01..level06 (Bool x6) | Dependente | FK -> Collaborator |
| 10 | **ServerErpAccess** | purchase (Bool), sale (Bool), production_control (Bool), service (Bool) | Dependente | FK -> Collaborator |
| 11 | **DataDestroyed** | when_data_is_destroyed (DateTimeField), i_can_destroy_data (Bool) | Dependente | FK -> Machine |
| 12 | **PenDrive** | checked_date (DateTimeField), have_virus (Bool) | Dependente | FK -> Collaborator |
| 13 | **CollaboratorSoftware** | - | Juncao N:N | FK -> Collaborator, FK -> Software |
| 14 | **CollaboratorMachine** | - | Juncao N:N | FK -> Collaborator, FK -> Machine |

> **Modelo base (abstrato):** Todos os modelos herdam campos `created_at`, `updated_at`, `deleted_at` (soft delete).

**Tarefas:**
- [ ] Criar classe abstrata `BaseModel` com campos de auditoria
- [ ] Criar `BaseRepository` com metodos get_all, get_by_id, create, update, soft_delete
- [ ] Implementar os 3 modelos principais (Collaborator, Machine, Software)
- [ ] Implementar os 9 modelos dependentes (Email, Cellphone, Wifi, etc.)
- [ ] Implementar as 2 tabelas de juncao (CollaboratorSoftware, CollaboratorMachine)
- [ ] Criar e aplicar migracoes (`makemigrations` + `migrate`)
- [ ] Registrar todos os modelos no Django Admin
- [ ] Criar fixtures com dados de teste (pelo menos 5 registros por modelo)
- [ ] Validar relacionamentos no shell do Django

**Entregavel:** Banco de dados populado, Admin Panel funcional com CRUD de todos os modelos.

---

### Fase 3: Autenticacao JWT

**Objetivo:** Implementar autenticacao baseada em token JWT para a SPA React.

**Endpoints:**

| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | `/api/auth/login/` | Gera access + refresh token |
| POST | `/api/auth/refresh/` | Renova access token |
| POST | `/api/auth/register/` | Cria novo usuario |
| GET | `/api/auth/me/` | Retorna dados do usuario logado |
| POST | `/api/auth/logout/` | Invalida refresh token |

**Configuracao DRF (settings.py):**
```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
}
```

**Frontend - AuthContext:**
- Armazenar tokens no localStorage
- Interceptor Axios para incluir token em todas as requisicoes
- Redirect automatico para login quando token expira
- Componente `ProtectedRoute` para rotas autenticadas

**Tarefas:**
- [ ] Instalar e configurar `djangorestframework-simplejwt`
- [ ] Criar controllers e services de auth no app `accounts`
- [ ] Criar serializer de registro de usuario
- [ ] Implementar `AuthContext` no React
- [ ] Implementar interceptor Axios (adicionar Bearer token)
- [ ] Criar pagina de Login no React
- [ ] Criar componente `ProtectedRoute`
- [ ] Testar fluxo completo: registro -> login -> acesso -> refresh -> logout

**Entregavel:** Usuario pode registrar, logar, e acessar rotas protegidas.

---

### Fase 4: API REST (Endpoints CRUD)

**Objetivo:** Criar endpoints CRUD completos para todos os modelos usando arquitetura em camadas (Controller → Service → Repository).

**Endpoints por recurso:**

| Recurso | List | Create | Retrieve | Update | Delete |
|---------|------|--------|----------|--------|--------|
| `/api/collaborators/` | GET | POST | GET /:id | PUT /:id | DELETE /:id |
| `/api/machines/` | GET | POST | GET /:id | PUT /:id | DELETE /:id |
| `/api/software/` | GET | POST | GET /:id | PUT /:id | DELETE /:id |
| `/api/emails/` | GET | POST | GET /:id | PUT /:id | DELETE /:id |
| `/api/cellphones/` | GET | POST | GET /:id | PUT /:id | DELETE /:id |
| `/api/wifi/` | GET | POST | GET /:id | PUT /:id | DELETE /:id |
| `/api/antivirus/` | GET | POST | GET /:id | PUT /:id | DELETE /:id |
| `/api/servers/` | GET | POST | GET /:id | PUT /:id | DELETE /:id |
| `/api/server-access/` | GET | POST | GET /:id | PUT /:id | DELETE /:id |
| `/api/erp-access/` | GET | POST | GET /:id | PUT /:id | DELETE /:id |
| `/api/data-destroyed/` | GET | POST | GET /:id | PUT /:id | DELETE /:id |
| `/api/pen-drives/` | GET | POST | GET /:id | PUT /:id | DELETE /:id |

**Funcionalidades da API:**
- Paginacao (PageNumberPagination, 20 itens por pagina)
- Filtros (django-filter para busca por campos)
- Ordenacao (OrderingFilter)
- Busca textual (SearchFilter)
- Soft delete (marcar `deleted_at` ao inves de remover)
- Nested serializers (Collaborator retorna emails, cellphones, etc.)

**Tarefas:**
- [ ] Criar serializers para todos os 14 modelos
- [ ] Criar Repositories para cada modelo (herdando de `BaseRepository`)
- [ ] Criar Services para cada modelo (herdando de `BaseService`)
- [ ] Criar Controllers com `ModelViewSet` (herdando de `BaseController`)
- [ ] Configurar Router para gerar URLs automaticamente
- [ ] Implementar filtros e busca por modelo
- [ ] Implementar soft delete no `BaseRepository`
- [ ] Implementar nested creation no `CollaboratorService` (Collaborator + Email + Cellphone em 1 request)
- [ ] Testar todos os endpoints via DRF Browsable API
- [ ] Documentar API (django-rest-framework gera docs automaticamente)

**Entregavel:** API completa com CRUD de todos os modelos, testavel via browser.

---

### Fase 5: 19 Relatorios de Compliance

**Objetivo:** Implementar os 19 relatorios como endpoints REST que retornam dados formatados.

**Endpoints:**

| Rota | Relatorio | Query Principal |
|------|-----------|----------------|
| `GET /api/reports/08/` | Lista de Contatos | Collaborator + Email + Cellphone |
| `GET /api/reports/09/` | Lista de Computadores | Machine (todos os campos) |
| `GET /api/reports/13/` | Usuarios de Dominio | Collaborator.domain_user + status |
| `GET /api/reports/15/` | Acesso Servidor Arquivos | ServerAccess + Collaborator |
| `GET /api/reports/17/` | Permissao Internet | Collaborator.perm_acess_internet |
| `GET /api/reports/19/` | Licencas Software | Software (licenca, quantidade, uso) |
| `GET /api/reports/20/` | Notebooks Criptografia | Machine (crypto_disk/usb/memory_card) + notebooks |
| `GET /api/reports/21/` | Celulares Ativados | Cellphone + Collaborator (status=True) |
| `GET /api/reports/22/` | Destruicao de Dados | DataDestroyed + Machine |
| `GET /api/reports/23/` | Acesso ERP | ServerErpAccess + Collaborator |
| `GET /api/reports/24/` | Lista de E-mails | Email + Collaborator |
| `GET /api/reports/25/` | Virus em Pendrives | PenDrive + Collaborator |
| `GET /api/reports/26/` | Padrao Antivirus | AntiVirus (updated mensais) + Machine |
| `GET /api/reports/28/` | Uso de Software | CollaboratorSoftware + Collaborator + Software |
| `GET /api/reports/29/` | Atualizacoes Seguranca | AntiVirus (check mensais) + Machine |
| `GET /api/reports/31/` | Verificacao Antivirus | AntiVirus + Machine (scan mensal) |
| `GET /api/reports/33/` | Acesso WiFi | Wifi + Collaborator |
| `GET /api/reports/34/` | Troca Senha WiFi | Wifi (protection, meses) |
| `GET /api/reports/35/` | Backup Servidores | Server + Machine (backup_date) |
| `GET /api/reports/37/` | Usuarios Dominio | Collaborator.domain_user (detalhado) |

**Funcionalidades:**
- Filtro por ano (`?year=2024`)
- Filtro por mes (`?month=6`)
- Exportacao JSON (padrao)
- Exportacao PDF (via query param `?format=pdf`)
- Exportacao Excel (via query param `?format=xlsx`)

**Tarefas:**
- [ ] Criar app `reports` com controllers, services e repositories para cada relatorio
- [ ] Criar repositories com QuerySets otimizados (select_related, prefetch_related)
- [ ] Criar serializers especificos para cada relatorio
- [ ] Implementar filtros por ano/mes nos repositories
- [ ] Criar `exporters.py` com template base para exportacao PDF (usando ReportLab)
- [ ] Adaptar templates HTML japoneses da pasta `Tabelas/` para PDF
- [ ] Implementar exportacao Excel em `exporters.py` (openpyxl)
- [ ] Testar cada relatorio com dados de teste

**Entregavel:** 19 endpoints de relatorios funcionais com exportacao JSON/PDF/Excel.

---

### Fase 6: Integracao Frontend React

**Objetivo:** Conectar o frontend React a API Django, implementando todas as telas.

**Paginas a implementar:**

| Pagina | Rota React | Funcionalidade |
|--------|-----------|----------------|
| Login | `/login` | Formulario de login -> JWT |
| Home/Dashboard | `/` | Cards com resumo e links para relatorios |
| Cadastro | `/cadastro` | Formularios para Collaborator, Machine, Software |
| Relatorios | `/relatorios` | Lista dos 19 relatorios com busca |
| Visualizar Relatorio | `/relatorios/:id` | Tabela com dados do relatorio selecionado |
| Editar | `/editar/:tipo/:id` | Formulario de edicao de registros |

**Componentes reutilizaveis:**
- `Navbar` - Navegacao com logo JRC, links, logout
- `Card` - Card de relatorio com titulo, descricao, botao de download
- `SearchBar` - Campo de busca com filtros
- `DataTable` - Tabela generica com paginacao e ordenacao
- `FormField` - Campo de formulario reutilizavel
- `Alert` - Mensagens de sucesso/erro
- `Loading` - Spinner de carregamento
- `PDFButton` - Botao para download de PDF

**Integracao API (Axios):**
```javascript
// api/client.js
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Interceptor para JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor para refresh automatico
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 401) {
      // Tentar refresh token
    }
    return Promise.reject(error);
  }
);
```

**Tarefas:**
- [ ] Configurar Axios com interceptors (auth + refresh)
- [ ] Implementar pagina de Login
- [ ] Implementar Dashboard (Home) com cards de relatorios
- [ ] Implementar formulario de Cadastro (Collaborator, Machine, Software)
- [ ] Implementar lista de Relatorios com busca
- [ ] Implementar visualizacao de relatorio individual (tabela)
- [ ] Implementar formulario de Edicao
- [ ] Implementar botao de download PDF/Excel
- [ ] Implementar feedback visual (loading, erros, sucesso)
- [ ] Testar fluxo completo end-to-end

**Entregavel:** SPA React funcional com todas as telas conectadas a API.

---

### Fase 7: Finalizacao (Docker, Testes, PDF, Admin)

**Objetivo:** Preparar o projeto para entrega final com testes, Docker e documentacao.

**7.1 Docker (producao)**
```yaml
# docker-compose.prod.yml
services:
  db:
    image: postgres:13.5
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: gunicorn config.wsgi:application --bind 0.0.0.0:8000
    environment:
      - DEBUG=False

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    # nginx serve o build React e faz proxy para /api
    ports:
      - "80:80"
```

**7.2 Testes**

| Tipo | Ferramenta | Escopo |
|------|-----------|--------|
| Unitarios (backend) | pytest + pytest-django | Repositories, services, controllers |
| Integracao (backend) | DRF APITestCase | Endpoints, auth, permissoes |
| Unitarios (frontend) | Jest + React Testing Library | Componentes, hooks |
| E2E | Cypress ou Playwright | Fluxos completos |

**7.3 Django Admin customizado**
- Registrar todos os 14 modelos com list_display, search_fields, list_filter
- Inline forms (Email, Cellphone dentro de Collaborator)
- Actions em massa (ativar/desativar colaboradores)

**7.4 Geracao de PDF**
- Usar ReportLab para gerar PDFs dos 19 relatorios
- Layout baseado nos templates HTML japoneses existentes (`Tabelas/`)
- Cabecalho com logo JRC Brasil
- Tabelas formatadas com dados do banco
- Rodape com data de geracao e numero de pagina

**Tarefas:**
- [ ] Criar Dockerfile para backend (Python + gunicorn)
- [ ] Criar Dockerfile para frontend (Node build + nginx)
- [ ] Criar docker-compose.prod.yml
- [ ] Escrever testes unitarios por camada (repositories, services)
- [ ] Escrever testes de integracao para controllers
- [ ] Escrever testes para componentes React
- [ ] Customizar Django Admin para todos os modelos
- [ ] Implementar geracao de PDF com ReportLab
- [ ] Criar README.md final com instrucoes de instalacao e uso
- [ ] Testar deploy com `docker-compose up` em maquina limpa

**Entregavel:** Projeto completo, testado, dockerizado e documentado.

---

## Arquivos de Referencia Importantes

### Do projeto Node.js (avaliacaoA2)

| Arquivo | O que contem | Como usar |
|---------|-------------|-----------|
| `Back-end/prisma/schema.prisma` | Definicao dos 14 modelos | Base para criar `core/models.py` |
| `Back-end/src/controller/views/ViewReports.ts` | 19 queries SQL dos relatorios | Base para QuerySets no app `reports` |
| `Back-end/src/controller/inserts/` | Logica de criacao de registros | Referencia para serializers |
| `Back-end/src/routes/` | Estrutura de rotas | Referencia para `urls.py` |
| `Back-end/DevOps/postgres/docker-compose.yml` | Config Docker PostgreSQL | Base para docker-compose final |
| `Front-end/relatoriojapao/src/Components/` | Componentes React | Reaproveitar/adaptar |
| `Front-end/relatoriojapao/src/Pages/` | Paginas React | Reaproveitar/adaptar |
| `Tabelas/*.html` | Templates HTML dos relatorios japoneses | Base para layout PDF |

### Do projeto Django (relatorio-jrc-main)

| Arquivo | O que contem | Como usar |
|---------|-------------|-----------|
| `controle/settings.py` | Configuracao Django | Referencia para `config/settings.py` |
| `accounts/views.py` | Logica de auth | Referencia para auth JWT |
| `accounts/forms.py` | Forms de usuario | Referencia para serializers |
| `reports/models.py` | Modelo Reports | Exemplo de modelo Django |
| `reports/templates/` | Templates HTML | Referencia de UX/layout |

---

## Verificacao e Testes

### Checklist de validacao por fase

**Fase 1 - Setup:**
- [ ] `docker-compose up` inicia os 3 servicos sem erro
- [ ] `http://localhost:8000/admin/` mostra Django Admin
- [ ] `http://localhost:3000` mostra app React

**Fase 2 - Modelos:**
- [ ] `python manage.py migrate` executa sem erro
- [ ] Todos os 14 modelos aparecem no Admin
- [ ] CRUD funciona no Admin para cada modelo
- [ ] Relacionamentos FK funcionam corretamente

**Fase 3 - Auth:**
- [ ] POST `/api/auth/login/` retorna access + refresh token
- [ ] GET `/api/auth/me/` retorna usuario com token valido
- [ ] Rotas protegidas retornam 401 sem token
- [ ] Refresh token renova access token

**Fase 4 - API:**
- [ ] Todos os 12 endpoints CRUD respondem corretamente
- [ ] Paginacao funciona (20 itens por pagina)
- [ ] Filtros e busca funcionam
- [ ] Soft delete marca `deleted_at` sem remover registro

**Fase 5 - Relatorios:**
- [ ] Todos os 19 endpoints de relatorio retornam dados corretos
- [ ] Filtro por ano funciona
- [ ] Download PDF gera arquivo valido
- [ ] Download Excel gera arquivo valido

**Fase 6 - Frontend:**
- [ ] Login funciona e redireciona para Dashboard
- [ ] Cadastro cria registros via API
- [ ] Lista de relatorios mostra todos os 19
- [ ] Visualizacao de relatorio mostra tabela com dados
- [ ] Download de PDF funciona pelo botao

**Fase 7 - Finalizacao:**
- [ ] `docker-compose -f docker-compose.prod.yml up` funciona
- [ ] Testes passam: `pytest` (backend) e `npm test` (frontend)
- [ ] README.md contem instrucoes claras de instalacao

---

## Cronograma Sugerido (por fase)

| Fase | Descricao | Dependencia |
|------|-----------|-------------|
| 1 | Setup do Projeto | - |
| 2 | Modelos Django | Fase 1 |
| 3 | Autenticacao JWT | Fase 1 |
| 4 | API REST CRUD | Fase 2 |
| 5 | 19 Relatorios | Fase 4 |
| 6 | Frontend React | Fase 3 + Fase 4 |
| 7 | Finalizacao | Fase 5 + Fase 6 |

> **Nota:** Fases 2 e 3 podem ser executadas em paralelo. Fase 6 depende de Fases 3 e 4.
