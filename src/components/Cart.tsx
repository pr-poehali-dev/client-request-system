import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { getCurrentPeriod, QuarterlyPeriod } from '@/lib/api';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
  onSubmitOrder: () => void;
  budgetLimit: number;
  budgetUsed: number;
}

export default function Cart({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onSubmitOrder,
  budgetLimit,
  budgetUsed,
}: CartProps) {
  const [currentPeriod, setCurrentPeriod] = useState<QuarterlyPeriod | null>(null);
  const [isLoadingPeriod, setIsLoadingPeriod] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadPeriod();
    }
  }, [isOpen]);

  const loadPeriod = async () => {
    try {
      setIsLoadingPeriod(true);
      const period = await getCurrentPeriod();
      setCurrentPeriod(period);
    } catch (error: any) {
      console.error('Error loading period:', error);
    } finally {
      setIsLoadingPeriod(false);
    }
  };

  const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const budgetRemaining = budgetLimit - budgetUsed;
  const budgetAfterOrder = budgetRemaining - cartTotal;
  const isOverBudget = budgetAfterOrder < 0;
  const isPeriodClosed = !currentPeriod || currentPeriod.status !== 'open';

  const handleSubmit = () => {
    if (items.length === 0) {
      toast.error('Корзина пуста', {
        description: 'Добавьте товары перед отправкой заявки',
      });
      return;
    }

    if (isOverBudget) {
      toast.error('Превышен бюджет', {
        description: 'Уменьшите количество товаров или удалите некоторые позиции',
      });
      return;
    }

    if (isPeriodClosed) {
      toast.error('Приём заявок закрыт', {
        description: 'Дождитесь начала следующего квартального периода',
      });
      return;
    }

    onSubmitOrder();
    toast.success('Заявка отправлена', {
      description: 'Ожидайте одобрения администратора',
    });
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Icon name="ShoppingCart" size={24} />
            Корзина
          </SheetTitle>
          <SheetDescription>
            Проверьте состав заявки и отправьте на одобрение
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Ваш бюджет</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Доступный бюджет:</span>
                <span className="font-semibold">₽ {budgetRemaining.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Сумма заказа:</span>
                <span className="font-semibold">₽ {cartTotal.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Остаток после заказа:</span>
                <span className={`font-bold text-lg ${isOverBudget ? 'text-destructive' : 'text-green-600'}`}>
                  ₽ {budgetAfterOrder.toLocaleString()}
                </span>
              </div>
              {isOverBudget && (
                <Badge variant="destructive" className="w-full justify-center">
                  <Icon name="AlertCircle" size={16} className="mr-1" />
                  Превышен бюджет на ₽ {Math.abs(budgetAfterOrder).toLocaleString()}
                </Badge>
              )}
            </CardContent>
          </Card>

          {items.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Icon name="ShoppingCart" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Корзина пуста</p>
                <p className="text-muted-foreground">Добавьте товары из каталога</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold">Товары в корзине</h3>
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">{item.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          ₽ {item.price.toLocaleString()} / {item.unit}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          >
                            <Icon name="Minus" size={16} />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-16 h-8 text-center"
                            min="1"
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Icon name="Plus" size={16} />
                          </Button>
                          <span className="text-sm text-muted-foreground ml-2">{item.unit}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg mb-2">
                          ₽ {(item.price * item.quantity).toLocaleString()}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRemoveItem(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card className="bg-muted/50">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Итого к оплате</p>
                  <p className="text-3xl font-bold">₽ {cartTotal.toLocaleString()}</p>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {items.length} {items.length === 1 ? 'товар' : 'товаров'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {isPeriodClosed && (
            <Card className="border-yellow-500 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Icon name="AlertCircle" size={20} />
                  <div>
                    <p className="font-semibold">Приём заявок закрыт</p>
                    <p className="text-sm">Дождитесь начала следующего квартального периода</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            onClick={handleSubmit}
            disabled={items.length === 0 || isOverBudget || isPeriodClosed || isLoadingPeriod}
            className="w-full h-12 text-lg gap-2"
          >
            <Icon name="Send" size={20} />
            {isLoadingPeriod ? 'Проверка...' : 'Отправить заявку'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}