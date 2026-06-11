import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  CalendarPlus,
  Thermometer,
  Snowflake,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: '温区总览', icon: LayoutDashboard },
  { to: '/management', label: '温区管理', icon: Settings },
  { to: '/reservation', label: '预约入库', icon: CalendarPlus },
  { to: '/monitor', label: '温度监控', icon: Thermometer },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col z-50">
      <div className="h-16 flex items-center px-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <Snowflake className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">冷链云仓</h1>
            <p className="text-xs text-slate-400">Cold Chain Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3">
        <div className="mb-2 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
          功能菜单
        </div>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700/50">
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-sm font-bold">
              运
            </div>
            <div>
              <p className="text-sm font-medium">运营管理员</p>
              <p className="text-xs text-slate-400">admin@coldchain.com</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            系统运行正常
          </div>
        </div>
      </div>
    </aside>
  );
}
