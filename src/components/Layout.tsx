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
        "bg-slate-900 text-white transition-all duration-300 flex flex-col fixed lg:relative h-full z-40",
        collapsed ? "w-14" : "w-60",
        "lg:translate-x-0", // Always visible on desktop
        collapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0" // Hidden on mobile when collapsed
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
          className={cn(
            "absolute -right-3 top-20 w-6 h-6 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors z-50",
            "lg:block", // Always visible on desktop
            collapsed ? "hidden lg:block" : "block" // Hidden on mobile when sidebar is open
          )}
        >
          <span className="text-xs">
            {collapsed ? '→' : '←'}
          </span>
        </button>
      </div>

      {/* Mobile Overlay */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        "lg:ml-0", // No margin on desktop (sidebar is relative)
        collapsed ? "ml-0" : "ml-0 lg:ml-0" // No margin needed (sidebar is fixed on mobile)
      )}>
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <button
            onClick={() => setCollapsed(false)}
            className="p-2 rounded-lg hover:bg-slate-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">M</span>
            </div>
            <h1 className="font-bold text-lg">Medsense</h1>
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};