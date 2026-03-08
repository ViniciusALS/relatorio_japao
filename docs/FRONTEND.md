# Frontend - React SPA

> Referencia profunda para trabalho no frontend. Para visao geral, ver [../CLAUDE.md](../CLAUDE.md).

## Stack

| Pacote | Versao | Uso |
|--------|--------|-----|
| react | ^18.3.0 | UI library |
| react-dom | ^18.3.0 | DOM rendering |
| react-router-dom | ^6.11.1 | Roteamento SPA |
| axios | ^1.6.0 | HTTP client |
| @tanstack/react-query | ^5.28.0 | Data fetching e caching |
| @tanstack/react-query-devtools | ^5.28.0 | Devtools React Query |
| tailwindcss | ^3.4.13 | Utility-first CSS framework |
| autoprefixer | ^10.4.20 | PostCSS vendor prefixes |
| postcss | ^8.4.47 | CSS transformations |
| @radix-ui/react-dialog | ^1.1.2 | Primitivo acessivel de dialog |
| @radix-ui/react-dropdown-menu | ^2.1.2 | Primitivo acessivel de menu |
| @radix-ui/react-label | ^2.1.0 | Primitivo acessivel de label |
| @radix-ui/react-select | ^2.1.2 | Primitivo acessivel de select |
| @radix-ui/react-slot | ^1.1.0 | Composicao de slots |
| @radix-ui/react-toast | ^1.2.2 | Notificacoes toast |
| class-variance-authority | ^0.7.0 | Variantes de classe Tailwind |
| clsx | ^2.1.1 | Utilitario de className condicional |
| tailwind-merge | ^2.5.3 | Merge seguro de classes Tailwind |
| lucide-react | ^0.441.0 | Icones SVG |
| react-scripts | 5.0.1 | Build tooling (CRA) |

## Estrutura de src/

```
src/
├── index.js              (entry point, BrowserRouter)
├── App.js                (layout principal, rotas)
├── api/
│   └── client.js         (Axios instance + interceptors JWT)
├── auth/
│   ├── AuthContext.js     (context provider, login/logout)
│   └── ProtectedRoute.js (wrapper para rotas autenticadas)
├── components/
│   ├── Navbar.js          (navegacao com logo JRC, links, logout)
│   ├── Card.js            (card de relatorio)
│   ├── SearchBar.js       (campo de busca com filtros)
│   ├── DataTable.js       (tabela generica com paginacao)
│   ├── FormField.js       (campo de formulario reutilizavel)
│   ├── Alert.js           (mensagens sucesso/erro)
│   ├── Loading.js         (spinner)
│   └── PDFButton.js       (botao download PDF)
├── pages/
│   ├── Login.js           (formulario login)
│   ├── Home.js            (dashboard com cards)
│   ├── Cadastro.js        (formularios Collaborator/Machine/Software)
│   ├── Relatorios.js      (lista dos 19 relatorios)
│   ├── ReportView.js      (visualizacao de relatorio individual)
│   └── Editar.js          (formulario de edicao)
└── routes/
    └── Routes.js          (definicao de rotas)
```

## Rotas

| Rota | Componente | Auth | Descricao |
|------|-----------|------|-----------|
| `/login` | Login | Nao | Formulario de login |
| `/` | Home | Sim | Dashboard com cards de relatorios |
| `/cadastro` | Cadastro | Sim | Formularios de cadastro |
| `/relatorios` | Relatorios | Sim | Lista dos 19 relatorios |
| `/relatorios/:id` | ReportView | Sim | Visualizacao de relatorio |
| `/editar/:tipo/:id` | Editar | Sim | Edicao de registros |

### Definicao de rotas

```jsx
// routes/Routes.js
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../auth/ProtectedRoute';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/cadastro" element={<ProtectedRoute><Cadastro /></ProtectedRoute>} />
      <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
      <Route path="/relatorios/:id" element={<ProtectedRoute><ReportView /></ProtectedRoute>} />
      <Route path="/editar/:tipo/:id" element={<ProtectedRoute><Editar /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
```

## AuthContext

```jsx
// auth/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      api.get('/auth/me/')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login/', { username, password });
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    const userRes = await api.get('/auth/me/');
    setUser(userRes.data);
  };

  const logout = () => {
    const refresh = localStorage.getItem('refresh_token');
    api.post('/auth/logout/', { refresh }).catch(() => {});
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

## Axios Client (com interceptors JWT)

```javascript
// api/client.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
});

// Adicionar token em todas as requisicoes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh automatico quando access token expira
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem('refresh_token');
        const res = await axios.post(
          `${api.defaults.baseURL}/auth/refresh/`,
          { refresh }
        );
        localStorage.setItem('access_token', res.data.access);
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

## shadcn/ui

shadcn/ui fornece componentes acessiveis construidos sobre Radix UI e estilizados com Tailwind CSS. Os componentes sao copiados para `src/components/ui/` e customizados localmente — nao sao importados de um pacote externo.

### Configuracao inicial

```bash
npx shadcn@latest init
```

Escolhas recomendadas durante o `init`:

- **Style:** Default
- **Base color:** Slate
- **CSS variables:** Yes

Isso gera `src/components/ui/`, atualiza `tailwind.config.js` com as variaveis CSS de tema e cria `src/lib/utils.ts` com o helper `cn()`.

### Helper `cn()`

```javascript
// src/lib/utils.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina classes CSS condicionalmente, resolvendo conflitos Tailwind.
 *
 * @param {...(string|undefined|null|false)} inputs - Classes CSS ou expressoes condicionais.
 * @returns {string} String de classes CSS mesclada e sem conflitos.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

### Adicionar componentes

```bash
# Exemplos de componentes usados no projeto
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add toast
npx shadcn@latest add label
npx shadcn@latest add input
```

### Uso com Tailwind

```jsx
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Botao de acao primaria com variante destrutiva opcional.
 *
 * @param {Object} props
 * @param {boolean} [props.destructive=false] - Aplica estilo destrutivo ao botao.
 * @param {Function} props.onClick - Callback de clique.
 * @param {React.ReactNode} props.children - Conteudo do botao.
 * @returns {JSX.Element} Botao renderizado.
 */
function ActionButton({ destructive = false, onClick, children }) {
  return (
    <Button
      variant={destructive ? 'destructive' : 'default'}
      className={cn('w-full sm:w-auto', destructive && 'mt-2')}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
```

### Regras de uso

- **Nunca** sobrescrever estilos shadcn/ui com CSS modulo — usar apenas classes Tailwind.
- **Nao** reimplementar comportamentos ARIA que Radix UI ja fornece (focus trap, `aria-expanded`, etc.).
- Customizacoes de tema vao em `src/index.css` via variaveis CSS (`--primary`, `--background`, etc.).

## React Query

### Configuracao global (`src/index.js`)

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './auth/AuthContext';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 minutos — dados considerados frescos
      gcTime:    1000 * 60 * 10,  // 10 minutos — cache mantido apos desmount
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
```

### Leitura de dados — `useQuery`

Usar sempre `useQuery` para GET; nunca buscar dados em `useEffect` nu.

```jsx
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

/**
 * Hook para listar colaboradores paginados.
 *
 * @param {number} page - Numero da pagina solicitada.
 * @returns {{ data, isLoading, isError, error }} Resultado da query.
 */
export function useCollaborators(page = 1) {
  return useQuery({
    queryKey: ['collaborators', page],
    queryFn: () => api.get(`/collaborators/?page=${page}`).then(r => r.data),
  });
}

// Uso no componente
function CollaboratorList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useCollaborators(page);

  if (isLoading) return <Loading />;
  if (isError)   return <Alert variant="destructive">Erro ao carregar dados.</Alert>;

  return (
    <DataTable
      columns={columns}
      data={data.results}
      page={page}
      totalPages={Math.ceil(data.count / 20)}
      onPageChange={setPage}
    />
  );
}
```

### Escrita de dados — `useMutation`

```jsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';

/**
 * Hook para criar um colaborador e invalidar o cache de listagem.
 *
 * @returns {import('@tanstack/react-query').UseMutationResult} Resultado da mutation.
 */
export function useCreateCollaborator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/collaborators/', data).then(r => r.data),
    onSuccess: () => {
      // Invalida todas as paginas da listagem apos criacao bem-sucedida
      queryClient.invalidateQueries({ queryKey: ['collaborators'] });
    },
  });
}

// Uso no formulario
function CadastroForm() {
  const { mutate, isPending, isError } = useCreateCollaborator();

  const handleSubmit = (formData) => mutate(formData);

  return (
    <form onSubmit={e => { e.preventDefault(); handleSubmit(/*...*/) }}>
      {/* campos */}
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Salvar'}
      </Button>
      {isError && <Alert variant="destructive">Erro ao salvar.</Alert>}
    </form>
  );
}
```

### staleTime por dominio

Dominios com dados que mudam raramente podem ter `staleTime` maior definido diretamente na query:

```jsx
useQuery({
  queryKey: ['reports'],
  queryFn: () => api.get('/reports/').then(r => r.data),
  staleTime: 1000 * 60 * 15, // 15 minutos para lista de relatorios
});
```

## ProtectedRoute

```jsx
// auth/ProtectedRoute.js
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div role="status" aria-live="polite" className="text-center mt-20"><div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" /><span className="sr-only">Carregando…</span></div>;
  if (!user) return <Navigate to="/login" />;

  return children;
}
```

## Componentes

### DataTable (tabela generica com paginacao)

```jsx
function DataTable({ columns, data, page, totalPages, onPageChange }) {
  return (
    <>
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr>{columns.map(col => <th key={col.key} className="border-b p-2 text-left">{col.label}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i} className="even:bg-gray-50 hover:bg-gray-100">
              {columns.map(col => <td key={col.key} className="border-b p-2">{col.render ? col.render(row) : row[col.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <nav aria-label="Paginação">
          <ul role="list" className="flex justify-center gap-1 mt-4">
            {[...Array(totalPages)].map((_, i) => (
              <li key={i}>
                <button
                  className={`px-3 py-1 border rounded hover:bg-gray-100 ${page === i + 1 ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' : ''}`}
                  onClick={() => onPageChange(i + 1)}
                  aria-label={`Ir para página ${i + 1}`}
                  aria-current={page === i + 1 ? 'page' : undefined}
                >{i + 1}</button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
```

### Card de relatorio

```jsx
function ReportCard({ number, title, description, onView, onDownload }) {
  return (
    <div className="border rounded-lg shadow-sm h-full flex flex-col">
      <div className="p-4 flex-1">
        <h5 className="text-lg font-semibold">Relatorio {number}</h5>
        <p className="text-gray-600">{description}</p>
      </div>
      <div className="p-4 border-t flex gap-2">
        <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700" onClick={onView} aria-label={`Visualizar relatório ${title}`}>Visualizar</button>
        <button className="px-3 py-1 text-sm border border-gray-400 rounded hover:bg-gray-100" onClick={() => onDownload('pdf')} aria-label={`Baixar ${title} como PDF`}>PDF</button>
        <button className="px-3 py-1 text-sm border border-gray-400 rounded hover:bg-gray-100" onClick={() => onDownload('xlsx')} aria-label={`Baixar ${title} como Excel`}>Excel</button>
      </div>
    </div>
  );
}
```

## Padroes de Integracao com API

### Listar com paginacao

```jsx
const [data, setData] = useState([]);
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

useEffect(() => {
  api.get(`/collaborators/?page=${page}`)
    .then(res => {
      setData(res.data.results);
      setTotalPages(Math.ceil(res.data.count / 20));
    })
    .catch(err => console.error(err));
}, [page]);
```

### Criar registro

```jsx
const handleSubmit = async (formData) => {
  try {
    await api.post('/collaborators/', formData);
    alert('Cadastro realizado com sucesso!');
    navigate('/');
  } catch (err) {
    if (err.response?.status === 400) {
      setErrors(err.response.data);
    }
  }
};
```

### Download de relatorio

```jsx
const handleDownload = async (reportNumber, format) => {
  try {
    const res = await api.get(`/reports/${reportNumber}/?format=${format}`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_${reportNumber}.${format}`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Erro ao baixar relatorio:', err);
  }
};
```

## Variaveis de Ambiente

Arquivo `.env` na raiz do frontend (ou variaveis no Docker):

```env
REACT_APP_API_URL=http://localhost:8000/api
```

> Em producao com nginx, a URL da API e relativa (`/api`) pois nginx faz proxy reverso.

## Testes Frontend

```bash
cd frontend && npm test
```

### Padrao de teste (Jest + React Testing Library)

```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import Login from '../pages/Login';

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

test('renders login form', () => {
  renderWithProviders(<Login />);
  expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
});

test('shows error on invalid login', async () => {
  renderWithProviders(<Login />);
  fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
  await waitFor(() => {
    expect(screen.getByText(/credenciais invalidas/i)).toBeInTheDocument();
  });
});
```
