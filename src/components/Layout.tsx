import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Users, 
  Calendar,
  Stethoscope,
  TrendingUp,
  Receipt,
  FileBarChart,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Clínicas', url: '/clinicas', icon: Building2, adminOnly: true },
  { title: 'Pacientes', url: '/pacientes', icon: Users },
  { title: 'Consultas', url: '/consultas', icon: Calendar },
  { title: 'Procedimentos', url: '/procedimentos', icon: Stethoscope, adminOnly: true },
  { title: 'Investimentos', url: '/investimentos', icon: TrendingUp },
  { title: 'Despesas', url: '/despesas', icon: Receipt },
  { title: 'Relatórios', url: '/relatorios', icon: FileBarChart },
];

export const Layout = ({ children }: LayoutProps) => {
  const { user, userRole, signOut } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || userRole?.role === 'admin'
  );

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Sidebar */}
      <div className={cn(
        "bg-slate-900 text-white transition-all duration-300 flex flex-col",
        collapsed ? "w-14" : "w-60"
      )}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-sm">M</span>
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-bold text-lg">Medsense</h1>
                <p className="text-xs text-slate-400">Marketing para Clínicas</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <p className="text-xs text-slate-400 uppercase tracking-wider px-2 mb-4">
              {!collapsed ? 'Menu Principal' : ''}
            </p>
            {filteredMenuItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.url}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                  isActive(item.url) 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-slate-800 text-slate-300"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="font-medium">{item.title}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.email}</p>
                <p className="text-xs text-slate-400 capitalize">
                  {userRole?.role?.replace('_', ' ')}
                </p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className={cn(
              "w-full text-slate-300 hover:text-white hover:bg-slate-800",
              collapsed ? "px-2" : "justify-start"
            )}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Sair</span>}
          </Button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors"
        >
          <span className="text-xs">
            {collapsed ? '→' : '←'}
          </span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};