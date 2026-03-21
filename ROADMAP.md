# Roadmap — Relatório JRC Brasil

Estado atual do projeto, fases de implementação e instruções de uso.

## Estado Atual

O **frontend React** está totalmente implementado e funcional usando **MSW (Mock Service Worker)** para simular a API Django. Todas as páginas, formulários e fluxos de navegação estão operacionais com dados mockados.

O **backend Django** ainda **não foi iniciado** — não há modelos, migrations, controllers, services ou repositories implementados.

**Resumo:** é possível navegar por toda a aplicação, criar/editar/excluir registros e gerar relatórios, mas tudo opera sobre dados simulados em memória (MSW). Nenhum dado persiste entre recarregamentos da página.

## Como Usar o que Temos

### Rodar o frontend

```bash
cd packages/frontend
npm install
npm run dev
```

Acesse: `http://localhost:8080`

### Credenciais mock

| Campo | Valor |
|-------|-------|
| Usuário | `admin` |
| Senha | `admin123` |

### Páginas disponíveis

| Página | Rota | O que faz |
|--------|------|-----------|
| Login | `/login` | Autenticação simulada via MSW; redireciona ao Dashboard |
| Dashboard | `/` | Exibe cards com totais (colaboradores, máquinas, software, relatórios) |
| Colaboradores | `/collaborators` | CRUD completo com listagem, criação, edição e exclusão |
| Máquinas | `/machines` | CRUD completo com listagem, criação, edição e exclusão |
| Software | `/software` | CRUD completo com listagem, criação, edição e exclusão |
| Relatórios | `/reports` | Lista os 19 relatórios com status e ações de visualização/exportação |

## Fases do Projeto

| # | Fase | Status | Observações |
|---|------|--------|-------------|
| 1 | Setup do Projeto | Parcial | Frontend configurado (Vite + React + Tailwind + shadcn/ui). Backend não iniciado (sem Django project/apps). |
| 2 | Modelos Django | Não iniciada | 14 modelos + BaseModel com soft delete ainda não implementados. |
| 3 | Autenticação JWT | Parcial | Frontend implementado (AuthContext, ProtectedRoute, interceptors Axios). Backend não iniciado (sem simplejwt). |
| 4 | CRUD API REST | Parcial | Frontend implementado (páginas + hooks React Query + MSW handlers). Backend não iniciado (sem controllers/services/repositories). |
| 5 | 19 Relatórios | Parcial | Frontend implementado (página de listagem + visualização). Backend não iniciado (sem exporters PDF/XLSX). |
| 6 | Integração Frontend | ~90% concluída | Todas as páginas implementadas com MSW. Falta conectar à API real quando o backend existir. |
| 7 | Finalização | Não iniciada | Docker Compose, testes E2E, deploy, documentação final. |

## Próximos Passos

1. **Criar o projeto Django** (Fase 1 backend) — `django-admin startproject config`, criar apps `accounts`, `core`, `reports`
2. **Implementar modelos** (Fase 2) — `BaseModel` com soft delete, 14 modelos do domínio, migrations
3. **Implementar autenticação JWT** (Fase 3) — `djangorestframework-simplejwt`, endpoints de login/register/refresh/logout
4. **Implementar CRUD REST** (Fase 4) — Controllers, Services, Repositories para as 14 entidades
5. **Implementar relatórios** (Fase 5) — Services de agregação, exportação PDF/XLSX
6. **Conectar frontend à API real** (Fase 6) — Remover MSW, apontar Axios para `localhost:8000`
7. **Finalizar** (Fase 7) — Docker Compose, testes, deploy
