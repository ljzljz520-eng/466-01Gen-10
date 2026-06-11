import { useState } from 'react';
import {
  Thermometer,
  AlertTriangle,
  FileText,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Calendar,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useColdStore } from '@/store/useColdStore';
import { Modal } from '@/components/Modal';
import { StatusBadge } from '@/components/StatusBadge';
import { TemperatureChart } from '@/components/TemperatureChart';
import type { TemperatureZone, Reservation, TemperatureAlert } from '@/types';
import { cn } from '@/lib/utils';

type TabType = 'temperature' | 'alerts' | 'outbound';

export default function Monitor() {
  const [activeTab, setActiveTab] = useState<TabType>('temperature');
  const [selectedZone, setSelectedZone] = useState<TemperatureZone | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  const {
    zones,
    alerts,
    reservations,
    outboundNotes,
    temperatureRecords,
    getZoneAlerts,
    getReservationAlerts,
    addOutboundNote,
  } = useColdStore();

  const activeZone = selectedZone || zones[0];
  const activeZoneRecords = activeZone ? temperatureRecords[activeZone.id] || [] : [];
  const activeZoneAlerts = activeZone ? getZoneAlerts(activeZone.id) : [];

  const inStockReservations = reservations.filter((r) => r.status === 'in-stock');
  const outboundReservations = reservations.filter((r) => r.status === 'outbound');

  const handleGenerateNote = (reservation: Reservation) => {
    const resAlerts = getReservationAlerts(reservation.id);
    if (resAlerts.length > 0) {
      const alertSummary = resAlerts
        .map(
          (a) =>
            `${a.type === 'high' ? '高温' : '低温'}越界 ${a.temperature}°C（阈值 ${a.threshold}°C），持续 ${a.duration} 分钟`
        )
        .join('；');
      setNoteContent(
        `该批次货物储存期间发生 ${resAlerts.length} 次温度越界事件：${alertSummary}。建议出库时重点检查货物品质，必要时进行质量检测。`
      );
    } else {
      setNoteContent(
        '该批次货物储存期间温度正常，无异常记录。货物出库时外观完好，包装完整，符合出库标准。'
      );
    }
    setSelectedReservation(reservation);
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = () => {
    if (!selectedReservation) return;
    const resAlerts = getReservationAlerts(selectedReservation.id);
    addOutboundNote({
      reservationId: selectedReservation.id,
      content: noteContent,
      alertIds: resAlerts.map((a) => a.id),
      createdDate: new Date().toISOString().split('T')[0],
      severity:
        resAlerts.length === 0
          ? 'normal'
          : resAlerts.length >= 2
          ? 'severe'
          : 'warning',
    });
    setIsNoteModalOpen(false);
    setNoteContent('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">温度监控</h2>
          <p className="text-slate-500 mt-1">
            实时温度监测、越界告警记录与出库备注管理
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {[
          { key: 'temperature', label: '温度曲线', icon: Thermometer },
          { key: 'alerts', label: '越界告警', icon: AlertTriangle },
          { key: 'outbound', label: '出库备注', icon: FileText },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabType)}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all',
              activeTab === tab.key
                ? 'bg-slate-800 text-white shadow-lg shadow-slate-800/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'temperature' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-500">选择温区</h4>
            <div className="space-y-2">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  onClick={() => setSelectedZone(zone)}
                  className={cn(
                    'p-4 rounded-xl border-2 cursor-pointer transition-all',
                    activeZone?.id === zone.id
                      ? 'border-cyan-400 bg-cyan-50/50 shadow-md shadow-cyan-100'
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-800 text-sm">
                      {zone.name}
                    </span>
                    <StatusBadge status={zone.status} />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <Thermometer
                      className={cn(
                        'w-4 h-4',
                        zone.status === 'alert'
                          ? 'text-red-500'
                          : zone.status === 'warning'
                          ? 'text-amber-500'
                          : 'text-cyan-500'
                      )}
                    />
                    <span
                      className={cn(
                        'text-lg font-bold',
                        zone.status === 'alert'
                          ? 'text-red-500'
                          : zone.status === 'warning'
                          ? 'text-amber-500'
                          : 'text-cyan-600'
                      )}
                    >
                      {zone.currentTemp.toFixed(1)}°C
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {zone.minTemp}°C ~ {zone.maxTemp}°C
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {activeZone?.name} - 24小时温度曲线
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    实时温度监测数据
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">告警次数</p>
                    <p className="text-lg font-bold text-red-500">
                      {activeZoneAlerts.length}
                    </p>
                  </div>
                </div>
              </div>

              {activeZone && activeZoneRecords.length > 0 && (
                <TemperatureChart
                  records={activeZoneRecords}
                  minTemp={activeZone.minTemp}
                  maxTemp={activeZone.maxTemp}
                  height={320}
                />
              )}

              <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
                <div className="text-center">
                  <p className="text-xs text-slate-400 mb-1">当前温度</p>
                  <p
                    className={cn(
                      'text-2xl font-bold',
                      activeZone?.status === 'alert'
                        ? 'text-red-500'
                        : activeZone?.status === 'warning'
                        ? 'text-amber-500'
                        : 'text-cyan-600'
                    )}
                  >
                    {activeZone?.currentTemp.toFixed(1)}°C
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 mb-1">最低温度</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {activeZoneRecords.length > 0
                      ? Math.min(...activeZoneRecords.map((r) => r.temperature)).toFixed(1)
                      : '-'}
                    °C
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 mb-1">最高温度</p>
                  <p className="text-2xl font-bold text-red-500">
                    {activeZoneRecords.length > 0
                      ? Math.max(...activeZoneRecords.map((r) => r.temperature)).toFixed(1)
                      : '-'}
                    °C
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 mb-1">平均温度</p>
                  <p className="text-2xl font-bold text-slate-700">
                    {activeZoneRecords.length > 0
                      ? (
                          activeZoneRecords.reduce((sum, r) => sum + r.temperature, 0) /
                          activeZoneRecords.length
                        ).toFixed(1)
                      : '-'}
                    °C
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                该温区在库货物
              </h3>
              <div className="space-y-3">
                {inStockReservations
                  .filter((r) => r.zoneId === activeZone?.id)
                  .map((res) => {
                    const resAlerts = getReservationAlerts(res.id);
                    return (
                      <div
                        key={res.id}
                        className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between hover:bg-slate-100/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedReservation(res)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                            <Package className="w-5 h-5 text-cyan-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {res.cargoName}
                            </p>
                            <p className="text-xs text-slate-500">
                              批次号: {res.batchNo}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-xs text-slate-400">入库日期</p>
                            <p className="text-sm font-medium text-slate-700">
                              {res.inboundDate}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-400">托盘数</p>
                            <p className="text-sm font-medium text-slate-700">
                              {res.palletCount} 托
                            </p>
                          </div>
                          {resAlerts.length > 0 && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-red-50 rounded-full">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                              <span className="text-xs font-medium text-red-600">
                                {resAlerts.length}次告警
                              </span>
                            </div>
                          )}
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </div>
                      </div>
                    );
                  })}
                {inStockReservations.filter((r) => r.zoneId === activeZone?.id)
                  .length === 0 && (
                  <p className="text-center text-sm text-slate-400 py-8">
                    该温区暂无在库货物
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">越界告警记录</h3>
            <p className="text-sm text-slate-500 mt-1">
              所有温区的温度越界告警详情
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {alerts.map((alert) => {
              const zone = zones.find((z) => z.id === alert.zoneId);
              return (
                <div
                  key={alert.id}
                  className="p-5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center',
                          alert.type === 'high'
                            ? 'bg-red-100'
                            : 'bg-blue-100'
                        )}
                      >
                        {alert.type === 'high' ? (
                          <ArrowUpRight className="w-6 h-6 text-red-500" />
                        ) : (
                          <ArrowDownRight className="w-6 h-6 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-slate-800">
                            {zone?.name}
                          </h4>
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full text-xs font-medium',
                              alert.type === 'high'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                            )}
                          >
                            {alert.type === 'high' ? '高温越界' : '低温越界'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mb-2">
                          温度 {alert.temperature}°C / 阈值 {alert.threshold}°C
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            持续 {alert.duration} 分钟
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(alert.startTime).toLocaleString('zh-CN')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {alert.affectedBatchNos &&
                      alert.affectedBatchNos.length > 0 ? (
                        <div>
                          <p className="text-xs text-slate-400 mb-1">
                            影响批次
                          </p>
                          {alert.affectedBatchNos.map((batch) => (
                            <p
                              key={batch}
                              className="text-sm font-medium text-slate-700"
                            >
                              {batch}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">暂无影响批次</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {alerts.length === 0 && (
              <div className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-slate-500">暂无温度越界告警</p>
                <p className="text-sm text-slate-400 mt-1">
                  所有温区温度均在正常范围内
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'outbound' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">待出库货物</h3>
              <p className="text-sm text-slate-500 mt-1">
                在库货物列表，可生成出库备注
              </p>
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {inStockReservations.map((res) => {
                const zone = zones.find((z) => z.id === res.zoneId);
                const resAlerts = getReservationAlerts(res.id);
                const hasNote = outboundNotes.some(
                  (n) => n.reservationId === res.id
                );
                return (
                  <div
                    key={res.id}
                    className="p-5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-slate-800">
                          {res.cargoName}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          批次号: {res.batchNo}
                        </p>
                      </div>
                      <StatusBadge status={res.status} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                      <div>
                        <p className="text-slate-400">所属温区</p>
                        <p className="text-slate-600 font-medium">{zone?.name}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">托盘数</p>
                        <p className="text-slate-600 font-medium">
                          {res.palletCount} 托
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">入库日期</p>
                        <p className="text-slate-600 font-medium">
                          {res.inboundDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      {resAlerts.length > 0 ? (
                        <div className="flex items-center gap-1.5 text-amber-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {resAlerts.length} 次温度告警
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">温度正常</span>
                        </div>
                      )}
                      <button
                        onClick={() => handleGenerateNote(res)}
                        className="px-3 py-1.5 bg-cyan-50 text-cyan-600 rounded-lg text-xs font-medium hover:bg-cyan-100 transition-colors"
                      >
                        {hasNote ? '查看备注' : '生成出库备注'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">出库备注记录</h3>
              <p className="text-sm text-slate-500 mt-1">
                已生成的出库备注历史
              </p>
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {outboundNotes.map((note) => {
                const reservation = reservations.find(
                  (r) => r.id === note.reservationId
                );
                const zone = zones.find((z) => z.id === reservation?.zoneId);
                return (
                  <div key={note.id} className="p-5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-slate-800">
                          {reservation?.cargoName}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {reservation?.batchNo}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-full text-xs font-medium',
                          note.severity === 'normal'
                            ? 'bg-emerald-100 text-emerald-700'
                            : note.severity === 'warning'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        )}
                      >
                        {note.severity === 'normal'
                          ? '正常'
                          : note.severity === 'warning'
                          ? '注意'
                          : '严重'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mb-3">
                      {note.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{zone?.name}</span>
                      <span>生成于 {note.createdDate}</span>
                    </div>
                  </div>
                );
              })}
              {outboundNotes.length === 0 && (
                <div className="p-12 text-center">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">暂无出库备注</p>
                  <p className="text-sm text-slate-400 mt-1">
                    从左侧选择货物生成出库备注
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title="出库备注"
        subtitle={selectedReservation?.batchNo || ''}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsNoteModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSaveNote}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
            >
              保存备注
            </button>
          </div>
        }
      >
        {selectedReservation && (
          <div className="space-y-5">
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">货物名称</p>
                  <p className="font-medium text-slate-700">
                    {selectedReservation.cargoName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">批次号</p>
                  <p className="font-medium text-slate-700">
                    {selectedReservation.batchNo}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">托盘数</p>
                  <p className="font-medium text-slate-700">
                    {selectedReservation.palletCount} 托
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">
                  关联温度告警
                </label>
                <span
                  className={cn(
                    'text-sm font-medium',
                    getReservationAlerts(selectedReservation.id).length > 0
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  )}
                >
                  {getReservationAlerts(selectedReservation.id).length} 条
                </span>
              </div>
              <div className="space-y-2">
                {getReservationAlerts(selectedReservation.id).length > 0 ? (
                  getReservationAlerts(selectedReservation.id).map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 bg-red-50 rounded-lg border border-red-100"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium text-red-700">
                          {alert.type === 'high' ? '高温' : '低温'}越界
                        </span>
                      </div>
                      <p className="text-xs text-red-600">
                        {alert.temperature}°C / 阈值 {alert.threshold}°C，持续{' '}
                        {alert.duration} 分钟
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-700">
                        无温度告警记录
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                出库备注内容
              </label>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all resize-none"
                placeholder="请输入出库备注内容..."
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                出库备注将作为该批次货物的品质证明文件之一，请认真填写。
                系统已根据温度告警记录自动生成备注内容，您可以根据实际情况进行修改。
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
