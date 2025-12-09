import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Order {
  id: number;
  client: string;
  clientId: number;
  legalEntity: string;
  address: string;
  items: { name: string; quantity: number; price: number; unit: string }[];
  total: number;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

interface OrdersProps {
  userRole: 'client' | 'admin';
}

export default function Orders({ userRole }: OrdersProps) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const orders: Order[] = [
    {
      id: 1,
      client: 'ООО "Альфа"',
      clientId: 101,
      legalEntity: 'ООО "Альфа Групп"',
      address: 'г. Москва, ул. Ленина, д. 10',
      items: [
        { name: 'Офисная бумага A4', quantity: 50, price: 350, unit: 'уп' },
        { name: 'Ручка шариковая', quantity: 100, price: 15, unit: 'шт' },
      ],
      total: 19000,
      status: 'pending',
      date: '2025-12-09',
    },
    {
      id: 2,
      client: 'ИП Петров',
      clientId: 102,
      legalEntity: 'ИП Петров Иван Сергеевич',
      address: 'г. Санкт-Петербург, Невский пр., д. 25',
      items: [
        { name: 'Степлер металлический', quantity: 10, price: 450, unit: 'шт' },
        { name: 'Папка-регистратор', quantity: 50, price: 180, unit: 'шт' },
      ],
      total: 13500,
      status: 'approved',
      date: '2025-12-08',
    },
    {
      id: 3,
      client: 'ООО "Бета"',
      clientId: 103,
      legalEntity: 'ООО "Бета Технолоджи"',
      address: 'г. Москва, ул. Тверская, д. 5',
      items: [
        { name: 'Маркер перманентный', quantity: 30, price: 85, unit: 'шт' },
        { name: 'Блокнот А5', quantity: 40, price: 120, unit: 'шт' },
      ],
      total: 7350,
      status: 'rejected',
      date: '2025-12-07',
    },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = order.client.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { label: 'На рассмотрении', className: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Одобрено', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Отклонено', className: 'bg-red-100 text-red-800' },
    };
    const variant = variants[status as keyof typeof variants];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const handleApprove = (orderId: number) => {
    toast.success('Заявка одобрена', {
      description: `Заявка #${orderId} успешно одобрена`,
    });
  };

  const handleReject = (orderId: number) => {
    toast.error('Заявка отклонена', {
      description: `Заявка #${orderId} отклонена`,
    });
  };

  const exportToExcel = () => {
    toast.success('Экспорт в Excel', {
      description: 'Таблица заявок выгружается...',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {userRole === 'admin' ? 'Управление заявками' : 'Мои заявки'}
          </h1>
          <p className="text-muted-foreground">
            {userRole === 'admin' 
              ? 'Просмотр и одобрение заявок от клиентов' 
              : 'История ваших заявок и их статусы'
            }
          </p>
        </div>
        {userRole === 'admin' && (
          <Button onClick={exportToExcel} className="gap-2">
            <Icon name="Download" size={20} />
            Экспорт в Excel
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по клиенту..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="pending">На рассмотрении</SelectItem>
            <SelectItem value="approved">Одобрено</SelectItem>
            <SelectItem value="rejected">Отклонено</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Заявка #{order.id}
                    {getStatusBadge(order.status)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {order.client} · {order.date}
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Icon name="Eye" size={16} />
                      Подробнее
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Детали заявки #{order.id}</DialogTitle>
                      <DialogDescription>
                        Информация о клиенте и составе заявки
                      </DialogDescription>
                    </DialogHeader>
                    {selectedOrder && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Клиент</p>
                            <p className="font-medium">{selectedOrder.client}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Юридическое лицо</p>
                            <p className="font-medium">{selectedOrder.legalEntity}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm font-medium text-muted-foreground">Адрес доставки</p>
                            <p className="font-medium">{selectedOrder.address}</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Состав заявки</p>
                          <div className="border rounded-lg overflow-hidden">
                            <table className="w-full">
                              <thead className="bg-muted">
                                <tr>
                                  <th className="text-left p-3">Товар</th>
                                  <th className="text-right p-3">Количество</th>
                                  <th className="text-right p-3">Цена</th>
                                  <th className="text-right p-3">Сумма</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedOrder.items.map((item, index) => (
                                  <tr key={index} className="border-t">
                                    <td className="p-3">{item.name}</td>
                                    <td className="text-right p-3">{item.quantity} {item.unit}</td>
                                    <td className="text-right p-3">₽ {item.price.toLocaleString()}</td>
                                    <td className="text-right p-3 font-medium">
                                      ₽ {(item.quantity * item.price).toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                                <tr className="border-t bg-muted/50">
                                  <td colSpan={3} className="p-3 font-semibold">Итого</td>
                                  <td className="text-right p-3 font-bold">
                                    ₽ {selectedOrder.total.toLocaleString()}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="MapPin" size={16} />
                    <span>{order.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="Package" size={16} />
                    <span>{order.items.length} товаров</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">₽ {order.total.toLocaleString()}</p>
                  {userRole === 'admin' && order.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleReject(order.id)}
                        className="gap-1"
                      >
                        <Icon name="X" size={16} />
                        Отклонить
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleApprove(order.id)}
                        className="gap-1"
                      >
                        <Icon name="Check" size={16} />
                        Одобрить
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card className="p-12 text-center">
          <Icon name="FileText" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">Заявки не найдены</p>
          <p className="text-muted-foreground">Попробуйте изменить фильтры поиска</p>
        </Card>
      )}
    </div>
  );
}
