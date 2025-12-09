import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  userRole: 'client' | 'admin';
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Layout({ children, userRole, onNavigate, currentPage }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const clientMenuItems = [
    { id: 'dashboard', label: 'Главная', icon: 'LayoutDashboard' },
    { id: 'catalog', label: 'Каталог', icon: 'ShoppingBag' },
    { id: 'orders', label: 'Мои заявки', icon: 'FileText' },
    { id: 'history', label: 'История', icon: 'Clock' },
  ];

  const adminMenuItems = [
    { id: 'dashboard', label: 'Главная', icon: 'LayoutDashboard' },
    { id: 'catalog', label: 'Каталог', icon: 'ShoppingBag' },
    { id: 'orders', label: 'Заявки', icon: 'FileText' },
    { id: 'clients', label: 'Клиенты', icon: 'Users' },
    { id: 'management', label: 'Управление', icon: 'Settings' },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : clientMenuItems;

  return (
    <div className="min-h-screen bg-background flex">
      <aside
        className={cn(
          'bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col',
          isSidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        <div className="p-6 flex items-center justify-between border-b border-sidebar-border">
          {isSidebarOpen && (
            <h1 className="text-xl font-semibold">RequestHub</h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Icon name={isSidebarOpen ? 'PanelLeftClose' : 'PanelLeftOpen'} size={20} />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                currentPage === item.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              <Icon name={item.icon as any} size={20} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className={cn('flex items-center gap-3', !isSidebarOpen && 'justify-center')}>
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
              <Icon name="User" size={20} />
            </div>
            {isSidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {userRole === 'admin' ? 'Администратор' : 'Клиент'}
                </p>
                <p className="text-xs text-sidebar-foreground/60">user@example.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
