import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import Catalog from '@/components/Catalog';
import Orders from '@/components/Orders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import Cart from '@/components/Cart';
import { Client, Product as APIProduct } from '@/lib/api';
import { toast } from 'sonner';

type UserRole = 'client' | 'admin' | null;

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  unit: string;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

export default function Index() {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAddToCart = (product: Product, quantity: number) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCartItems([...cartItems, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        unit: product.unit
      }]);
    }
  };

  const handleUpdateCartQuantity = (id: number, quantity: number) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const handleRemoveFromCart = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const handleSubmitOrder = () => {
    setCartItems([]);
  };

  const handleSelectClient = (client: Client) => {
    setCurrentClient(client);
    setUserRole(client.role);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard userRole={userRole!} clientId={currentClient?.id} />;
      case 'catalog':
        return <Catalog userRole={userRole!} onAddToCart={handleAddToCart} />;
      case 'orders':
        return <Orders userRole={userRole!} />;
      case 'clients':
        return (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold">Управление клиентами</h1>
            <Card>
              <CardContent className="p-12 text-center">
                <Icon name="Users" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">Раздел в разработке</p>
              </CardContent>
            </Card>
          </div>
        );
      case 'management':
        return (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold">Управление системой</h1>
            <Card>
              <CardContent className="p-12 text-center">
                <Icon name="Settings" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">Раздел в разработке</p>
              </CardContent>
            </Card>
          </div>
        );
      case 'history':
        return (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold">История операций</h1>
            <Card>
              <CardContent className="p-12 text-center">
                <Icon name="Clock" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">Раздел в разработке</p>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return <Dashboard userRole={userRole!} />;
    }
  };

  if (!userRole || !currentClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-scale-in">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Icon name="Briefcase" size={32} className="text-primary" />
            </div>
            <CardTitle className="text-2xl">RequestHub</CardTitle>
            <CardDescription>
              Система управления заявками и бюджетами
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => handleSelectClient({
                id: 1,
                name: 'Администратор',
                email: 'admin@example.com',
                legal_entity: 'RequestHub',
                address: 'г. Москва, ул. Главная, д. 1',
                budget_limit: 0,
                budget_used: 0,
                role: 'admin',
                created_at: new Date().toISOString()
              })}
              variant="outline"
              className="w-full h-14 text-lg gap-3"
            >
              <Icon name="Shield" size={24} />
              Войти как администратор
            </Button>
            <Button
              onClick={() => handleSelectClient({
                id: 2,
                name: 'ООО "Альфа"',
                email: 'alpha@example.com',
                legal_entity: 'ООО "Альфа Групп"',
                address: 'г. Москва, ул. Ленина, д. 10',
                budget_limit: 200000,
                budget_used: 50000,
                role: 'client',
                created_at: new Date().toISOString()
              })}
              className="w-full h-14 text-lg gap-3"
            >
              <Icon name="User" size={24} />
              Войти как клиент
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Layout
        userRole={userRole}
        onNavigate={setCurrentPage}
        currentPage={currentPage}
      >
        <div className="relative">
          {renderPage()}
          {userRole === 'client' && cartItems.length > 0 && (
            <Button
              onClick={() => setIsCartOpen(true)}
              className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg gap-2"
              size="icon"
            >
              <Icon name="ShoppingCart" size={24} />
              <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {cartItems.length}
              </span>
            </Button>
          )}
        </div>
      </Layout>
      
      {currentClient && (
        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveFromCart}
          onSubmitOrder={handleSubmitOrder}
          budgetLimit={currentClient.budget_limit}
          budgetUsed={currentClient.budget_used}
        />
      )}
    </>
  );
}