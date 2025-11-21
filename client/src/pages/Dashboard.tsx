import React, { useEffect, useState } from 'react';
import { getDashboard } from '../services/api';
import { TrendingUp, Package, AlertTriangle, DollarSign } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await getDashboard();
      setData(response.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Vendas Hoje</p>
              <p className="text-3xl font-bold mt-1">{data?.today?.sales || 0}</p>
              <p className="text-blue-100 text-sm mt-2">
                R$ {(data?.today?.revenue || 0).toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Vendas do Mês</p>
              <p className="text-3xl font-bold mt-1">{data?.month?.sales || 0}</p>
              <p className="text-green-100 text-sm mt-2">
                R$ {(data?.month?.revenue || 0).toFixed(2)}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total de Produtos</p>
              <p className="text-3xl font-bold mt-1">{data?.products?.total || 0}</p>
              <p className="text-purple-100 text-sm mt-2">Ativos</p>
            </div>
            <Package className="w-12 h-12 text-purple-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Estoque Baixo</p>
              <p className="text-3xl font-bold mt-1">{data?.products?.lowStock || 0}</p>
              <p className="text-orange-100 text-sm mt-2">Produtos</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Vendas por Dia */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Vendas dos Últimos 7 Dias</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.salesByDay || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Valor (R$)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Vendas por Método de Pagamento */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Métodos de Pagamento (30 dias)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data?.salesByPayment || []}
                dataKey="total"
                nameKey="payment_method"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {(data?.salesByPayment || []).map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Produtos Mais Vendidos */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Top 5 Produtos Mais Vendidos (30 dias)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data?.topProducts || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="product_name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Legend />
            <Bar dataKey="total_quantity" fill="#3b82f6" name="Quantidade Vendida" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
