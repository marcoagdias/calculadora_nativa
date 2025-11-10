import React, { useEffect, useState } from 'react';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from '../services/api';
import { Plus, Edit, Trash2, Search, AlertTriangle } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  barcode: string;
  category_id: number;
  category_name: string;
  cost_price: number;
  sale_price: number;
  stock: number;
  min_stock: number;
  description: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    category_id: '',
    cost_price: '',
    sale_price: '',
    stock: '',
    min_stock: '5',
    description: '',
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await getProducts({ search });
      setProducts(response.data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const handleSearch = () => {
    loadProducts();
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        barcode: product.barcode || '',
        category_id: product.category_id?.toString() || '',
        cost_price: product.cost_price.toString(),
        sale_price: product.sale_price.toString(),
        stock: product.stock.toString(),
        min_stock: product.min_stock.toString(),
        description: product.description || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        barcode: '',
        category_id: '',
        cost_price: '',
        sale_price: '',
        stock: '0',
        min_stock: '5',
        description: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        cost_price: parseFloat(formData.cost_price),
        sale_price: parseFloat(formData.sale_price),
        stock: parseInt(formData.stock),
        min_stock: parseInt(formData.min_stock),
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
      } else {
        await createProduct(data);
      }

      handleCloseModal();
      loadProducts();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao salvar produto');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await deleteProduct(id);
        loadProducts();
      } catch (error) {
        alert('Erro ao excluir produto');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Produtos</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </div>

      {/* Busca */}
      <div className="card mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Buscar por nome ou código de barras..."
            className="input-field flex-1"
          />
          <button onClick={handleSearch} className="btn-primary flex items-center gap-2">
            <Search className="w-5 h-5" />
            Buscar
          </button>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Código</th>
              <th className="text-left py-3 px-4">Nome</th>
              <th className="text-left py-3 px-4">Categoria</th>
              <th className="text-right py-3 px-4">Preço Custo</th>
              <th className="text-right py-3 px-4">Preço Venda</th>
              <th className="text-center py-3 px-4">Estoque</th>
              <th className="text-center py-3 px-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{product.barcode || '-'}</td>
                <td className="py-3 px-4 font-medium">{product.name}</td>
                <td className="py-3 px-4">{product.category_name || '-'}</td>
                <td className="py-3 px-4 text-right">R$ {product.cost_price.toFixed(2)}</td>
                <td className="py-3 px-4 text-right">R$ {product.sale_price.toFixed(2)}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-flex items-center gap-1 ${product.stock <= product.min_stock ? 'text-red-600' : ''}`}>
                    {product.stock <= product.min_stock && <AlertTriangle className="w-4 h-4" />}
                    {product.stock}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleOpenModal(product)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum produto encontrado
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código de Barras
                    </label>
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoria
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Selecione...</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preço de Custo *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cost_price}
                      onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preço de Venda *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sale_price}
                      onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estoque *
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estoque Mínimo *
                    </label>
                    <input
                      type="number"
                      value={formData.min_stock}
                      onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input-field"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
