/**
 * Barra lateral de navegação da aplicação.
 *
 * Exibe logo JRC, links de navegação com indicador de rota ativa,
 * nome do usuário logado e botão de logout via AuthContext.
 */
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Monitor, Package, FileText, LogOut, Shield
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/collaborators", label: "Colaboradores", icon: Users },
  { path: "/machines", label: "Máquinas", icon: Monitor },
  { path: "/software", label: "Software", icon: Package },
  { path: "/reports", label: "Relatórios", icon: FileText },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  /** Encerra sessão e redireciona para login. */
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar flex flex-col">
      <div className="px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sidebar-accent flex items-center justify-center">
            <Shield className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-sidebar-foreground tracking-wide">JRC BRASIL</h1>
            <p className="text-[10px] text-sidebar-foreground/50 tracking-widest uppercase">Compliance TI</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-active text-sidebar-foreground"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-hover hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="px-3 py-2 text-xs text-sidebar-foreground/40">
          <p>Logado como <span className="text-sidebar-foreground/70">{user?.username ?? "..."}</span></p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-sidebar-foreground/60 hover:bg-sidebar-hover hover:text-sidebar-foreground transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
