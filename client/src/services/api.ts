import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const login = (username: string, password: string) =>
  api.post('/auth/login', { username, password });

// Products
export const getProducts = (params?: any) =>
  api.get('/products', { params });

export const getProduct = (id: number) =>
  api.get(`/products/${id}`);

export const getProductByBarcode = (barcode: string) =>
  api.get(`/products/barcode/${barcode}`);

export const createProduct = (data: any) =>
  api.post('/products', data);

export const updateProduct = (id: number, data: any) =>
  api.put(`/products/${id}`, data);

export const deleteProduct = (id: number) =>
  api.delete(`/products/${id}`);

// Categories
export const getCategories = () =>
  api.get('/categories');

export const createCategory = (data: any) =>
  api.post('/categories', data);

// Sales
export const getSales = (params?: any) =>
  api.get('/sales', { params });

export const getSale = (id: number) =>
  api.get(`/sales/${id}`);

export const createSale = (data: any) =>
  api.post('/sales', data);

// Reports
export const getDashboard = () =>
  api.get('/reports/dashboard');

export const getSalesReport = (startDate: string, endDate: string) =>
  api.get('/reports/sales', { params: { startDate, endDate } });

export const getProductsReport = () =>
  api.get('/reports/products');
