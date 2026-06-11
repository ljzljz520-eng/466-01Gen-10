import { useNavigate } from 'react-router-dom';
import {
  Snowflake,
  Package,
  Users,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useColdStore } from '@/store/useColdStore';
import { StatsCard } from '@/components/StatsCard';
import { ZoneCard } from '@/components/ZoneCard';
import { TemperatureChart } from '@/components/TemperatureChart';
import { StatusBadge } from '@/components/StatusBadge';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    zones,
    contracts,
    alerts,
    temperatureRecords,
    getZoneContracts,
  } = useColdStore();

  const totalPallets = zones.reduce((sum, z) => sum + z.totalPallets, 0);
  const usedPallets = zones.reduce((sum, z) => sum + z.usedPallets, 0);
  const activeContracts = contracts.filter((c) => c.status === 'active').length;
  const alertZones = zones.filter((z) => z.status === 'alert').length;
  const warningZones = zones.filter((z) => z.status === 'warning').length;

  const mainZone = zones[0];
  const mainZoneRecords = temperatureRecords[mainZone?.id] || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">温区总览</h2>
          <p className="text-slate-500 mt-1">
            实时监控所有温区运行状态与容量使用情况
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          <RefreshCw className="w-4 h-4" />
          刷新数据
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="温区总数"
          value={zones.length}
          unit="个"
          icon={<Snowflake className="w-6 h-6" />}
          color="cyan"
          trendLabel="覆盖冷藏、冷冻、超低温多种温区"
        />
        <StatsCard
          title="总托盘位"
          value={totalPallets.toLocaleString()}
          unit="托"
          icon={<Package className="w-6 h-6" />}
          color="violet"
          trend={12}
          trendLabel={`已使用 ${usedPallets.toLocaleString()} 托，使用率 ${Math.round(
            (usedPallets / totalPallets) * 100
          )}%`}
        />
        <StatsCard
          title="在租客户"
          value={activeContracts}
          unit="家"
          icon={<Users className="w-6 h-6" />}
          color="emerald"
          trend={3}
          trendLabel="本月新增 3 家合作客户"
        />
        <StatsCard
          title="告警温区"
          value={alertZones + warningZones}
          unit="个"
          icon={<AlertTriangle className="w-6 h-6" />}
          color="amber"
          trendLabel={`${alertZones} 个越界告警，${warningZones} 个预警`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {mainZone?.name} - 24小时温度曲线
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                温度范围: {mainZone?.minTemp}°C ~ {mainZone?.maxTemp}°C
              </p>
            </div>
            <StatusBadge status={mainZone?.status || 'normal'} />
          </div>
          {mainZone && mainZoneRecords.length > 0 && (
            <TemperatureChart
              records={mainZoneRecords}
              minTemp={mainZone.minTemp}
              maxTemp={mainZone.maxTemp}
              height={280}
            />
          )}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-slate-400 mb-1">最低温度</p>
                <p className="text-lg font-bold text-blue-500">
                  {Math.min(...mainZoneRecords.map((r) => r.temperature)).toFixed(1)}°C
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">最高温度</p>
                <p className="text-lg font-bold text-red-500">
                  {Math.max(...mainZoneRecords.map((r) => r.temperature)).toFixed(1)}°C
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">平均温度</p>
                <p className="text-lg font-bold text-cyan-500">
                  {(
                    mainZoneRecords.reduce((sum, r) => sum + r.temperature, 0) /
                    mainZoneRecords.length
                  ).toFixed(1)}
                  °C
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/monitor')}
              className="text-sm font-medium text-cyan-600 hover:text-cyan-700"
            >
              查看详情 →
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">最近告警</h3>
          <div className="space-y-3 max-h-[360px] overflow-y-auto">
            {alerts.slice(0, 6).map((alert) => {
              const zone = zones.find((z) => z.id === alert.zoneId);
              return (
                <div
                  key={alert.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-red-200 hover:bg-red-50/30 transition-colors cursor-pointer"
                  onClick={() => navigate('/monitor')}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          alert.type === 'high' ? 'bg-red-500' : 'bg-blue-500'
                        } animate-pulse`}
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {zone?.name}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        alert.type === 'high' ? 'text-red-500' : 'text-blue-500'
                      }`}
                    >
                      {alert.type === 'high' ? '高温' : '低温'}越界
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {alert.temperature}°C / 阈值 {alert.threshold}°C
                    </span>
                    <span>持续 {alert.duration} 分钟</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">所有温区</h3>
          <div className="flex items-center gap-2">
            {['全部', '正常', '预警', '告警'].map((filter) => (
              <button
                key={filter}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === '全部'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {zones.map((zone) => (
            <ZoneCard
              key={zone.id}
              zone={zone}
              contracts={getZoneContracts(zone.id)}
              onClick={() => navigate('/management')}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
