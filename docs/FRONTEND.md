# Frontend - React SPA

> Referencia profunda para trabalho no frontend. Para visao geral, ver [../CLAUDE.md](../CLAUDE.md).

## Stack

| Pacote | Versao | Uso |
|--------|--------|-----|
| react | ^18.2.0 | UI library |
| react-dom | ^18.2.0 | DOM rendering |
| react-router-dom | ^6.11.1 | Roteamento SPA |
| axios | ^1.6.0 | HTTP client |
| react-bootstrap | ^2.7.4 | Componentes UI |
| bootstrap | ^5.2.3 | CSS framework |
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

## ProtectedRoute

```jsx
// auth/ProtectedRoute.js
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" /></div>;
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
      <table className="table table-striped table-hover">
        <thead>
          <tr>{columns.map(col => <th key={col.key}>{col.label}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i}>
              {columns.map(col => <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <nav>
          <ul className="pagination justify-content-center">
            {[...Array(totalPages)].map((_, i) => (
              <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => onPageChange(i + 1)}>{i + 1}</button>
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
    <div className="card h-100">
      <div className="card-body">
        <h5 className="card-title">Relatorio {number}</h5>
        <p className="card-text">{description}</p>
      </div>
      <div className="card-footer d-flex gap-2">
        <button className="btn btn-primary btn-sm" onClick={onView}>Visualizar</button>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => onDownload('pdf')}>PDF</button>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => onDownload('xlsx')}>Excel</button>
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
