import { useState } from 'react';
import {
  Package,
  CalendarDays,
  Clock,
  Thermometer,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Info,
  Plus,
  Minus,
} from 'lucide-react';
import { useColdStore } from '@/store/useColdStore';
import { Modal } from '@/components/Modal';
import { StatusBadge } from '@/components/StatusBadge';
import { TemperatureChart } from '@/components/TemperatureChart';
import type { TemperatureZone, TenantContract } from '@/types';

export default function Reservation() {
  const {
    zones,
    contracts,
    reservations,
    temperatureRecords,
    getAvailablePallets,
    getZoneContracts,
    addReservation,
  } = useColdStore();

  const [selectedZone, setSelectedZone] = useState<TemperatureZone | null>(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [palletCount, setPalletCount] = useState(1);
  const [cargoName, setCargoName] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [inboundDate, setInboundDate] = useState('');
  const [leaseDays, setLeaseDays] = useState(7);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSelectZone = (zone: TemperatureZone) => {
    setSelectedZone(zone);
    const zoneContracts = getZoneContracts(zone.id);
    if (zoneContracts.length > 0) {
      setSelectedContractId(zoneContracts[0].id);
    }
    setPalletCount(1);
    setLeaseDays(zone.minLeaseDays);
  };

  const handleSubmitReservation = () => {
    if (!selectedZone || !selectedContractId || !cargoName || !batchNo || !inboundDate) {
      alert('请填写完整的预约信息');
      return;
    }

    const available = getAvailablePallets(selectedZone.id);
    if (palletCount > available) {
      alert(`可用托盘位不足，当前可用 ${available} 托`);
      return;
    }

    if (leaseDays < selectedZone.minLeaseDays) {
      alert(`最低租期为 ${selectedZone.minLeaseDays} 天`);
      return;
    }

    const expectedOutbound = new Date(inboundDate);
    expectedOutbound.setDate(expectedOutbound.getDate() + leaseDays);

    addReservation({
      zoneId: selectedZone.id,
      contractId: selectedContractId,
      cargoName,
      batchNo,
      palletCount,
      inboundDate,
      expectedOutboundDate: expectedOutbound.toISOString().split('T')[0],
    });

    setIsReservationModalOpen(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    setCargoName('');
    setBatchNo('');
    setInboundDate('');
  };

  const selectedContract = contracts.find((c) => c.id === selectedContractId);
  const totalCost = selectedZone ? palletCount * selectedZone.dailyRate * leaseDays : 0;
  const availablePallets = selectedZone ? getAvailablePallets(selectedZone.id) : 0;
  const zoneReservations = selectedZone
    ? reservations.filter((r) => r.zoneId === selectedZone.id)
    : [];

  return (
    <div className="space-y-6">
      {showSuccess && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right">
          <CheckCircle2 className="w-6 h-6" />
          <div>
            <p className="font-bold">预约成功</p>
            <p className="text-sm text-emerald-100">已为您锁定托盘位</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">预约入库</h2>
          <p className="text-slate-500 mt-1">
            选择温区，查看可用托盘位与最低租期，提交入库预约
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-800">选择温区</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {zones.map((zone) => {
              const available = getAvailablePallets(zone.id);
              const isSelected = selectedZone?.id === zone.id;
              const isFull = available === 0;

              return (
                <div
                  key={zone.id}
                  onClick={() => !isFull && handleSelectZone(zone)}
                  className={`relative p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                    isFull
                      ? 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed'
                      : isSelected
                      ? 'bg-cyan-50/50 border-cyan-400 shadow-lg shadow-cyan-100'
                      : 'bg-white border-slate-100 hover:border-cyan-200 hover:shadow-md'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-slate-800">{zone.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {zone.minTemp}°C ~ {zone.maxTemp}°C
                      </p>
                    </div>
                    <StatusBadge status={zone.status} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 flex items-center gap-1.5">
                        <Package className="w-4 h-4" />
                        可用托盘
                      </span>
                      <span
                        className={`text-lg font-bold ${
                          available === 0
                            ? 'text-red-500'
                            : available < 20
                            ? 'text-amber-500'
                            : 'text-emerald-500'
                        }`}
                      >
                        {available} 托
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          (zone.usedPallets / zone.totalPallets) >= 0.9
                            ? 'bg-red-400'
                            : (zone.usedPallets / zone.totalPallets) >= 0.7
                            ? 'bg-amber-400'
                            : 'bg-gradient-to-r from-cyan-400 to-blue-500'
                        }`}
                        style={{
                          width: `${(zone.usedPallets / zone.totalPallets) * 100}%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        最低租期
                      </span>
                      <span className="text-sm font-medium text-slate-700">
                        {zone.minLeaseDays} 天
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 flex items-center gap-1.5">
                        <Thermometer className="w-4 h-4" />
                        当前温度
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          zone.status === 'alert'
                            ? 'text-red-500'
                            : zone.status === 'warning'
                            ? 'text-amber-500'
                            : 'text-cyan-600'
                        }`}
                      >
                        {zone.currentTemp.toFixed(1)}°C
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">日租金</span>
                    <span className="text-lg font-bold text-slate-800">
                      ¥{zone.dailyRate}
                      <span className="text-xs font-normal text-slate-400">/托</span>
                    </span>
                  </div>

                  {isFull && (
                    <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
                      <span className="px-3 py-1.5 bg-slate-200 text-slate-600 rounded-full text-xs font-medium">
                        暂无空位
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800">预约详情</h3>

          {selectedZone ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-slate-100">
                <h4 className="font-bold text-slate-800">{selectedZone.name}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedZone.description}
                </p>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">可用托盘</p>
                    <p className="text-xl font-bold text-emerald-600">
                      {availablePallets}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">最低租期</p>
                    <p className="text-xl font-bold text-violet-600">
                      {selectedZone.minLeaseDays}天
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    选择合同
                  </label>
                  <select
                    value={selectedContractId}
                    onChange={(e) => setSelectedContractId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all bg-white"
                  >
                    <option value="">请选择合同</option>
                    {getZoneContracts(selectedZone.id).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.tenantName} - {c.leasedPallets}托
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    货物名称
                  </label>
                  <input
                    type="text"
                    value={cargoName}
                    onChange={(e) => setCargoName(e.target.value)}
                    placeholder="请输入货物名称"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    批次号
                  </label>
                  <input
                    type="text"
                    value={batchNo}
                    onChange={(e) => setBatchNo(e.target.value)}
                    placeholder="请输入批次号"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <CalendarDays className="w-4 h-4 inline mr-1" />
                    入库日期
                  </label>
                  <input
                    type="date"
                    value={inboundDate}
                    onChange={(e) => setInboundDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">
                      租赁天数
                    </label>
                    <span className="text-xs text-slate-400">
                      最低 {selectedZone.minLeaseDays} 天
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        setLeaseDays(Math.max(selectedZone.minLeaseDays, leaseDays - 1))
                      }
                      className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={leaseDays}
                      onChange={(e) =>
                        setLeaseDays(
                          Math.max(
                            selectedZone.minLeaseDays,
                            Number(e.target.value)
                          )
                        )
                      }
                      className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-center text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                    />
                    <button
                      onClick={() => setLeaseDays(leaseDays + 1)}
                      className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">
                      托盘数量
                    </label>
                    <span className="text-xs text-slate-400">
                      可用 {availablePallets} 托
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPalletCount(Math.max(1, palletCount - 1))}
                      className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={palletCount}
                      onChange={(e) =>
                        setPalletCount(
                          Math.min(availablePallets, Math.max(1, Number(e.target.value)))
                        )
                      }
                      className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-center text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                    />
                    <button
                      onClick={() =>
                        setPalletCount(Math.min(availablePallets, palletCount + 1))
                      }
                      className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-slate-50 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-500">预估费用</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-cyan-600">
                      ¥{totalCost.toLocaleString()}
                    </span>
                    <p className="text-xs text-slate-400">
                      {palletCount}托 × ¥{selectedZone.dailyRate} × {leaseDays}天
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsReservationModalOpen(true)}
                  disabled={!selectedContractId || !cargoName || !batchNo || !inboundDate}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
                >
                  提交预约
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Info className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500">请从左侧选择一个温区</p>
              <p className="text-sm text-slate-400 mt-1">
                查看可用托盘位并提交入库预约
              </p>
            </div>
          )}

          {selectedZone && temperatureRecords[selectedZone.id] && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h4 className="font-bold text-slate-800 mb-3">温度趋势</h4>
              <TemperatureChart
                records={temperatureRecords[selectedZone.id]}
                minTemp={selectedZone.minTemp}
                maxTemp={selectedZone.maxTemp}
                height={120}
                showThreshold={false}
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">我的预约记录</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider rounded-l-lg">
                  批次号
                </th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  货物名称
                </th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  所属温区
                </th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  托盘数
                </th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  入库日期
                </th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  预计出库
                </th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider rounded-r-lg">
                  状态
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reservations
                .filter((r) => r.status === 'pending' || r.status === 'in-stock')
                .map((res) => {
                  const zone = zones.find((z) => z.id === res.zoneId);
                  return (
                    <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-slate-700">
                        {res.batchNo}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {res.cargoName}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {zone?.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {res.palletCount} 托
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {res.inboundDate}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {res.expectedOutboundDate}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={res.status} />
                      </td>
                    </tr>
                  );
                })}
              {reservations.filter((r) => r.status === 'pending' || r.status === 'in-stock')
                .length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-slate-400"
                  >
                    暂无预约记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        title="确认预约"
        subtitle="请确认以下预约信息"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsReservationModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmitReservation}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
            >
              确认预约
            </button>
          </div>
        }
      >
        {selectedZone && (
          <div className="space-y-4">
            <div className="p-4 bg-cyan-50 rounded-xl">
              <p className="text-sm font-medium text-cyan-800">
                {selectedZone.name}
              </p>
              <p className="text-xs text-cyan-600 mt-1">
                {selectedZone.minTemp}°C ~ {selectedZone.maxTemp}°C
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">货物名称</p>
                <p className="text-sm font-medium text-slate-700">{cargoName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">批次号</p>
                <p className="text-sm font-medium text-slate-700">{batchNo}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">入库日期</p>
                <p className="text-sm font-medium text-slate-700">{inboundDate}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">租赁天数</p>
                <p className="text-sm font-medium text-slate-700">{leaseDays} 天</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">托盘数量</p>
                <p className="text-sm font-medium text-slate-700">{palletCount} 托</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">关联合同</p>
                <p className="text-sm font-medium text-slate-700">
                  {selectedContract?.tenantName}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
              <span className="text-sm text-slate-600">预估总费用</span>
              <span className="text-2xl font-bold text-cyan-600">
                ¥{totalCost.toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                提交预约后系统将自动锁定对应托盘位，请确保信息准确。如需取消请提前24小时联系客服。
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
