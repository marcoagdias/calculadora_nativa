import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  LogOut,
  Store
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/produtos', icon: Package, label: 'Produtos' },
    { path: '/pdv', icon: ShoppingCart, label: 'PDV (Vendas)' },
    { path: '/relatorios', icon: BarChart3, label: 'Relatórios' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-primary-800 text-white shadow-lg">
        <div className="p-6 border-b border-primary-700">
          <div className="flex items-center gap-3">
            <Store className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">Mix Papelaria</h1>
              <p className="text-xs text-primary-200">e Presentes</p>
            </div>
          </div>
        </div>

        <nav className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  isActive
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-100 hover:bg-primary-700/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-700">
          <div className="mb-3 px-4">
            <p className="text-sm text-primary-200">Usuário</p>
            <p className="font-medium">{user?.name}</p>
            <p className="text-xs text-primary-300 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-primary-100 hover:bg-primary-700/50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
