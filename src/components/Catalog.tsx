import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  unit: string;
}

interface CatalogProps {
  userRole: 'client' | 'admin';
  onAddToCart?: (product: Product, quantity: number) => void;
}

export default function Catalog({ userRole, onAddToCart }: CatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const products: Product[] = [
    { id: 1, name: 'Офисная бумага A4', price: 350, category: 'office', stock: 500, unit: 'уп' },
    { id: 2, name: 'Ручка шариковая синяя', price: 15, category: 'office', stock: 1000, unit: 'шт' },
    { id: 3, name: 'Степлер металлический', price: 450, category: 'office', stock: 50, unit: 'шт' },
    { id: 4, name: 'Маркер перманентный', price: 85, category: 'office', stock: 200, unit: 'шт' },
    { id: 5, name: 'Папка-регистратор', price: 180, category: 'office', stock: 150, unit: 'шт' },
    { id: 6, name: 'Блокнот А5', price: 120, category: 'office', stock: 300, unit: 'шт' },
    { id: 7, name: 'Клей-карандаш', price: 45, category: 'office', stock: 400, unit: 'шт' },
    { id: 8, name: 'Корректор ленточный', price: 95, category: 'office', stock: 250, unit: 'шт' },
  ];

  const categories = [
    { id: 'all', label: 'Все товары' },
    { id: 'office', label: 'Офисные товары' },
    { id: 'tech', label: 'Техника' },
    { id: 'furniture', label: 'Мебель' },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: Product) => {
    const quantity = quantities[product.id] || 1;
    if (onAddToCart) {
      onAddToCart(product, quantity);
      toast.success(`${product.name} добавлен в заявку`, {
        description: `Количество: ${quantity} ${product.unit}`,
      });
      setQuantities({ ...quantities, [product.id]: 1 });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Каталог товаров</h1>
        <p className="text-muted-foreground">
          {userRole === 'admin' 
            ? 'Управление ассортиментом и ценами' 
            : 'Выберите товары для заявки'
          }
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск товаров..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {userRole === 'admin' && (
          <Button className="gap-2">
            <Icon name="Plus" size={20} />
            Добавить товар
          </Button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category.id)}
            className="whitespace-nowrap"
          >
            {category.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">₽ {product.price.toLocaleString()}</span>
                <span className="text-muted-foreground">/ {product.unit}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="Package" size={16} />
                <span>В наличии: {product.stock} {product.unit}</span>
              </div>
              {product.stock < 100 && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                  Заканчивается
                </Badge>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              {userRole === 'client' ? (
                <>
                  <Input
                    type="number"
                    min="1"
                    value={quantities[product.id] || 1}
                    onChange={(e) => setQuantities({ ...quantities, [product.id]: parseInt(e.target.value) || 1 })}
                    className="w-20"
                  />
                  <Button 
                    className="flex-1 gap-2" 
                    onClick={() => handleAddToCart(product)}
                  >
                    <Icon name="Plus" size={16} />
                    В заявку
                  </Button>
                </>
              ) : (
                <Button variant="outline" className="w-full gap-2">
                  <Icon name="Edit" size={16} />
                  Редактировать
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
