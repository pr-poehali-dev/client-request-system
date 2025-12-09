import { useState } from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import Catalog from '@/components/Catalog';
import Orders from '@/components/Orders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

type UserRole = 'client' | 'admin' | null;

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  unit: string;
}

export default function Index() {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard userRole={userRole!} />;
      case 'catalog':
        return <Catalog userRole={userRole!} onAddToCart={(product: Product, quantity: number) => {
          console.log('Added to cart:', product, quantity);
        }} />;
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

  if (!userRole) {
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
              onClick={() => setUserRole('client')}
              className="w-full h-14 text-lg gap-3"
            >
              <Icon name="User" size={24} />
              Войти как клиент
            </Button>
            <Button
              onClick={() => setUserRole('admin')}
              variant="outline"
              className="w-full h-14 text-lg gap-3"
            >
              <Icon name="Shield" size={24} />
              Войти как администратор
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Layout
      userRole={userRole}
      onNavigate={setCurrentPage}
      currentPage={currentPage}
    >
      {renderPage()}
    </Layout>
  );
}
