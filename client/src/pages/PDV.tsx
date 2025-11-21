import React, { useState, useRef, useEffect } from 'react';
import { getProductByBarcode, createSale } from '../services/api';
import { ShoppingCart, Trash2, DollarSign, CreditCard, Smartphone } from 'lucide-react';

interface CartItem {
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

const PDV: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcode, setBarcode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('dinheiro');
  const [paymentReceived, setPaymentReceived] = useState('');
  const [discount, setDiscount] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  const handleBarcodeSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!barcode.trim()) return;

    try {
      const response = await getProductByBarcode(barcode);
      const product = response.data;

      addToCart({
        product_id: product.id,
        product_name: product.name,
        unit_price: product.sale_price,
        quantity: 1,
        subtotal: product.sale_price,
      });

      setBarcode('');
      barcodeInputRef.current?.focus();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Produto não encontrado');
      setBarcode('');
    }
  };

  const addToCart = (item: CartItem) => {
    const existingIndex = cart.findIndex((i) => i.product_id === item.product_id);

    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      newCart[existingIndex].subtotal = newCart[existingIndex].quantity * newCart[existingIndex].unit_price;
      setCart(newCart);
    } else {
      setCart([...cart, item]);
    }
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) return;

    const newCart = [...cart];
    newCart[index].quantity = quantity;
    newCart[index].subtotal = quantity * newCart[index].unit_price;
    setCart(newCart);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const calculateFinalTotal = () => {
    const total = calculateTotal();
    const discountAmount = parseFloat(discount) || 0;
    return total - discountAmount;
  };

  const calculateChange = () => {
    if (paymentMethod !== 'dinheiro') return 0;
    const received = parseFloat(paymentReceived) || 0;
    const finalTotal = calculateFinalTotal();
    return Math.max(0, received - finalTotal);
  };

  const handleFinalizeSale = async () => {
    if (cart.length === 0) {
      alert('Adicione produtos ao carrinho');
      return;
    }

    if (paymentMethod === 'dinheiro') {
      const received = parseFloat(paymentReceived) || 0;
      if (received < calculateFinalTotal()) {
        alert('Valor recebido insuficiente');
        return;
      }
    }

    try {
      const saleData = {
        items: cart,
        discount: parseFloat(discount) || 0,
        payment_method: paymentMethod,
        payment_received: paymentMethod === 'dinheiro' ? parseFloat(paymentReceived) : null,
      };

      await createSale(saleData);
      
      alert('Venda realizada com sucesso!');
      
      // Limpar carrinho
      setCart([]);
      setDiscount('');
      setPaymentReceived('');
      setShowPayment(false);
      barcodeInputRef.current?.focus();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao finalizar venda');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">PDV - Ponto de Venda</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Área de Produtos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Busca por Código de Barras */}
          <div className="card">
            <form onSubmit={handleBarcodeSearch} className="flex gap-4">
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Digite ou escaneie o código de barras..."
                className="input-field flex-1 text-lg"
                autoFocus
              />
              <button type="submit" className="btn-primary px-8">
                Adicionar
              </button>
            </form>
          </div>

          {/* Carrinho */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              Carrinho ({cart.length} {cart.length === 1 ? 'item' : 'itens'})
            </h2>

            {cart.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Carrinho vazio. Adicione produtos para iniciar a venda.
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-gray-600">R$ {item.unit_price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                        className="w-16 text-center border border-gray-300 rounded"
                        min="1"
                      />
                      <button
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right min-w-[100px]">
                      <p className="font-bold">R$ {item.subtotal.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Resumo e Pagamento */}
        <div className="space-y-6">
          {/* Resumo */}
          <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <h2 className="text-xl font-bold mb-4">Resumo</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-lg">
                <span>Subtotal:</span>
                <span>R$ {calculateTotal().toFixed(2)}</span>
              </div>

              <div>
                <label className="block text-sm mb-1">Desconto (R$):</label>
                <input
                  type="number"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="input-field text-gray-800"
                  placeholder="0.00"
                />
              </div>

              <div className="border-t border-primary-400 pt-3">
                <div className="flex justify-between text-2xl font-bold">
                  <span>Total:</span>
                  <span>R$ {calculateFinalTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pagamento */}
          {cart.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Pagamento</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Forma de Pagamento
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setPaymentMethod('dinheiro')}
                      className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 ${
                        paymentMethod === 'dinheiro'
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <DollarSign className="w-6 h-6" />
                      <span className="text-xs">Dinheiro</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('cartao')}
                      className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 ${
                        paymentMethod === 'cartao'
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <CreditCard className="w-6 h-6" />
                      <span className="text-xs">Cartão</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('pix')}
                      className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 ${
                        paymentMethod === 'pix'
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <Smartphone className="w-6 h-6" />
                      <span className="text-xs">PIX</span>
                    </button>
                  </div>
                </div>

                {paymentMethod === 'dinheiro' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor Recebido
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={paymentReceived}
                      onChange={(e) => setPaymentReceived(e.target.value)}
                      className="input-field"
                      placeholder="0.00"
                    />
                    {paymentReceived && (
                      <div className="mt-2 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Troco:</p>
                        <p className="text-xl font-bold text-green-600">
                          R$ {calculateChange().toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleFinalizeSale}
                  className="w-full btn-primary py-4 text-lg"
                >
                  Finalizar Venda
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDV;
