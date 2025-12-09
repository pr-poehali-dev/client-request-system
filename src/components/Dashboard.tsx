import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface DashboardProps {
  userRole: 'client' | 'admin';
}

export default function Dashboard({ userRole }: DashboardProps) {
  const clientStats = [
    { label: 'Доступный бюджет', value: '₽ 150 000', icon: 'Wallet', color: 'text-green-600' },
    { label: 'Активные заявки', value: '3', icon: 'FileText', color: 'text-blue-600' },
    { label: 'На рассмотрении', value: '2', icon: 'Clock', color: 'text-yellow-600' },
    { label: 'Выполнено в этом месяце', value: '8', icon: 'CheckCircle', color: 'text-purple-600' },
  ];

  const adminStats = [
    { label: 'Всего заявок', value: '47', icon: 'FileText', color: 'text-blue-600' },
    { label: 'Ожидают одобрения', value: '12', icon: 'AlertCircle', color: 'text-yellow-600' },
    { label: 'Активных клиентов', value: '24', icon: 'Users', color: 'text-green-600' },
    { label: 'Одобрено сегодня', value: '8', icon: 'CheckCircle', color: 'text-purple-600' },
  ];

  const stats = userRole === 'admin' ? adminStats : clientStats;

  const recentOrders = [
    { id: 1, client: 'ООО "Альфа"', items: 5, total: 45000, status: 'pending', date: '2025-12-09' },
    { id: 2, client: 'ИП Петров', items: 3, total: 28000, status: 'approved', date: '2025-12-08' },
    { id: 3, client: 'ООО "Бета"', items: 8, total: 67000, status: 'approved', date: '2025-12-08' },
    { id: 4, client: 'ООО "Гамма"', items: 2, total: 15000, status: 'pending', date: '2025-12-07' },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { label: 'На рассмотрении', className: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Одобрено', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Отклонено', className: 'bg-red-100 text-red-800' },
    };
    const variant = variants[status as keyof typeof variants] || variants.pending;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          {userRole === 'admin' ? 'Панель управления' : 'Личный кабинет'}
        </h1>
        <p className="text-muted-foreground">
          {userRole === 'admin' 
            ? 'Обзор всех заявок и управление системой' 
            : 'Управляйте своими заявками и следите за бюджетом'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                  <Icon name={stat.icon as any} size={24} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="TrendingUp" size={20} />
            Последние заявки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon name="ShoppingCart" size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{order.client}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.items} товаров · {order.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-semibold">₽ {order.total.toLocaleString()}</p>
                  {getStatusBadge(order.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
