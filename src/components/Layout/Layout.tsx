import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: '温区总览', subtitle: '实时监控冷库各温区运行状态' },
  '/management': { title: '温区管理', subtitle: '维护温区配置、租户信息与合同管理' },
  '/reservation': { title: '预约入库', subtitle: '查看可用托盘位并提交入库预约' },
  '/monitor': { title: '温度监控', subtitle: '温度曲线、越界告警与出库备注' },
};

export function Layout() {
  const location = useLocation();
  const pageInfo = pageTitles[location.pathname] || {
    title: '冷库管理系统',
    subtitle: '',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-slate-100">
      <Sidebar />
      <div className="ml-64">
        <Header title={pageInfo.title} subtitle={pageInfo.subtitle} />
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
