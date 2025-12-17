import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { QuarterlyPeriod, getCurrentPeriod, closePeriod } from '@/lib/api';
import { toast } from 'sonner';

interface AdminPeriodControlProps {
  adminId: number;
  onPeriodClosed?: () => void;
}

export default function AdminPeriodControl({ adminId, onPeriodClosed }: AdminPeriodControlProps) {
  const [currentPeriod, setCurrentPeriod] = useState<QuarterlyPeriod | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  const loadPeriod = async () => {
    try {
      setIsLoading(true);
      const period = await getCurrentPeriod();
      setCurrentPeriod(period);
    } catch (error: any) {
      toast.error('Ошибка загрузки периода: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPeriod();
  }, []);

  const handleClosePeriod = async () => {
    if (!currentPeriod) return;
    
    const confirmed = window.confirm(
      `Вы уверены, что хотите закрыть сбор заявок за Q${currentPeriod.quarter} ${currentPeriod.year}?\n\n` +
      'Все заявки будут заблокированы и изменение станет невозможным.'
    );

    if (!confirmed) return;

    try {
      setIsClosing(true);
      const result = await closePeriod(adminId);
      toast.success(result.message);
      await loadPeriod();
      onPeriodClosed?.();
    } catch (error: any) {
      toast.error('Ошибка закрытия периода: ' + error.message);
    } finally {
      setIsClosing(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (!currentPeriod) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Calendar" size={24} />
            Квартальный период
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Icon name="CalendarOff" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Нет активного периода сбора заявок</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = () => {
    const statusConfig = {
      open: { label: 'Приём открыт', variant: 'default' as const, icon: 'CheckCircle' },
      closed: { label: 'Приём закрыт', variant: 'secondary' as const, icon: 'Lock' },
      upcoming: { label: 'Предстоящий', variant: 'outline' as const, icon: 'Clock' }
    };

    const config = statusConfig[currentPeriod.status];
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon name={config.icon} size={14} />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Calendar" size={24} />
              Квартальный период
            </CardTitle>
            <CardDescription>
              Управление сбором заявок на квартал
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Период</p>
            <p className="text-xl font-semibold">
              Q{currentPeriod.quarter} {currentPeriod.year}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Квартал начинается</p>
            <p className="font-medium">{formatDate(currentPeriod.quarter_start_date)}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Приём заявок открыт с:</span>
              <span className="font-medium">{formatDate(currentPeriod.collection_start_date)}</span>
            </div>
            {currentPeriod.collection_end_date && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Приём заявок закрыт:</span>
                <span className="font-medium">{formatDate(currentPeriod.collection_end_date)}</span>
              </div>
            )}
          </div>
        </div>

        {currentPeriod.status === 'open' && (
          <div className="pt-4 border-t">
            <Button
              onClick={handleClosePeriod}
              disabled={isClosing}
              variant="destructive"
              className="w-full gap-2"
            >
              {isClosing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Закрытие...
                </>
              ) : (
                <>
                  <Icon name="Lock" size={18} />
                  Закрыть сбор заявок
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              После закрытия все заявки будут заблокированы
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
