const API_URL = 'https://functions.poehali.dev/72cdd938-a4f5-4a5c-b3a5-8fc8d184b5db';

export interface Client {
  id: number;
  name: string;
  email: string;
  legal_entity: string;
  address: string;
  budget_limit: number;
  budget_used: number;
  role: 'client' | 'admin';
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category_id: number;
  category_name: string;
  stock: number;
  unit: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  unit: string;
  created_at: string;
}

export interface Order {
  id: number;
  client_id: number;
  client_name: string;
  legal_entity: string;
  address: string;
  total: number;
  status: 'pending' | 'approved' | 'rejected';
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

async function apiCall(action: string, method: string = 'GET', body?: any) {
  const url = `${API_URL}?action=${action}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getClients(): Promise<Client[]> {
  return apiCall('clients');
}

export async function getProducts(): Promise<Product[]> {
  return apiCall('products');
}

export async function getCategories(): Promise<Category[]> {
  return apiCall('categories');
}

export async function getOrders(clientId?: number): Promise<Order[]> {
  const action = clientId ? `orders&client_id=${clientId}` : 'orders';
  return apiCall(action);
}

export async function createOrder(clientId: number, items: { product_id: number; quantity: number; price: number }[]): Promise<{ order_id: number; status: string }> {
  return apiCall('create_order', 'POST', { client_id: clientId, items });
}

export async function updateOrderStatus(orderId: number, status: 'pending' | 'approved' | 'rejected'): Promise<{ status: string }> {
  return apiCall(`update_order&order_id=${orderId}`, 'PUT', { status });
}
