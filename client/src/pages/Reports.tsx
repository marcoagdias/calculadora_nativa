import React, { useState } from 'react';
import { getSalesReport, getProductsReport } from '../services/api';
import { FileText, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState<'sales' | 'products'>('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [salesData, setSalesData] = useState<any>(null);
  const [productsData, setProductsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerateSalesReport = async () => {
    if (!startDate || !endDate) {
      alert('Selecione as datas de início e fim');
      return;
    }

    setLoading(true);
    try {
      const response = await getSalesReport(startDate, endDate);
      setSalesData(response.data);
    } catch (error) {
      alert('Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateProductsReport = async () => {
    setLoading(true);
    try {
      const response = await getProductsReport();
      setProductsData(response.data);
    } catch (error) {
      alert('Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Relatórios</h1>

      {/* Seletor de Tipo de Relatório */}
      <div className="card mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setReportType('sales')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              reportType === 'sales'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Relatório de Vendas
          </button>
          <button
            onClick={() => setReportType('products')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              reportType === 'products'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Relatório de Produtos
          </button>
        </div>
      </div>

      {/* Relatório de Vendas */}
      {reportType === 'sales' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Filtros</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Início
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Fim
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleGenerateSalesReport}
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  {loading ? 'Gerando...' : 'Gerar Relatório'}
                </button>
              </div>
            </div>
          </div>

          {salesData && (
            <>
              {/* Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <p className="text-blue-100 text-sm">Total de Vendas</p>
                  <p className="text-3xl font-bold mt-1">{salesData.summary.total_sales}</p>
                </div>
                <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <p className="text-green-100 text-sm">Receita Total</p>
                  <p className="text-3xl font-bold mt-1">
                    R$ {salesData.summary.total_revenue?.toFixed(2)}
                  </p>
                </div>
                <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <p className="text-purple-100 text-sm">Ticket Médio</p>
                  <p className="text-3xl font-bold mt-1">
                    R$ {salesData.summary.avg_sale?.toFixed(2)}
                  </p>
                </div>
                <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <p className="text-orange-100 text-sm">Descontos</p>
                  <p className="text-3xl font-bold mt-1">
                    R$ {salesData.summary.total_discount?.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Gráfico */}
              <div className="card">
                <h2 className="text-xl font-bold mb-4">Vendas por Dia</h2>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={salesData.sales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Receita (R$)" />
                    <Bar dataKey="total_sales" fill="#10b981" name="Quantidade" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Tabela Detalhada */}
              <div className="card">
                <h2 className="text-xl font-bold mb-4">Detalhamento</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Data</th>
                        <th className="text-right py-3 px-4">Vendas</th>
                        <th className="text-right py-3 px-4">Receita</th>
                        <th className="text-right py-3 px-4">Ticket Médio</th>
                        <th className="text-right py-3 px-4">Descontos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.sales.map((sale: any, index: number) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{sale.date}</td>
                          <td className="py-3 px-4 text-right">{sale.total_sales}</td>
                          <td className="py-3 px-4 text-right">R$ {sale.revenue?.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right">R$ {sale.avg_sale?.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right">R$ {sale.total_discount?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Relatório de Produtos */}
      {reportType === 'products' && (
        <div className="space-y-6">
          <div className="card">
            <button
              onClick={handleGenerateProductsReport}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              {loading ? 'Gerando...' : 'Gerar Relatório'}
            </button>
          </div>

          {productsData.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Produtos e Desempenho</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Produto</th>
                      <th className="text-left py-3 px-4">Categoria</th>
                      <th className="text-right py-3 px-4">Estoque</th>
                      <th className="text-right py-3 px-4">Preço</th>
                      <th className="text-right py-3 px-4">Vendidos</th>
                      <th className="text-right py-3 px-4">Receita</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsData.map((product: any) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{product.name}</td>
                        <td className="py-3 px-4">{product.category_name || '-'}</td>
                        <td className="py-3 px-4 text-right">{product.stock}</td>
                        <td className="py-3 px-4 text-right">R$ {product.sale_price?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right">{product.total_sold}</td>
                        <td className="py-3 px-4 text-right">R$ {product.total_revenue?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
