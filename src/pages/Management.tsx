import { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Building2,
  Calendar,
  Package,
  Thermometer,
  Clock,
  User,
  Phone,
  FileText,
} from 'lucide-react';
import { useColdStore } from '@/store/useColdStore';
import { Modal } from '@/components/Modal';
import { StatusBadge } from '@/components/StatusBadge';
import { TemperatureChart } from '@/components/TemperatureChart';
import type { TemperatureZone, TenantContract } from '@/types';

type TabType = 'zones' | 'contracts';

export default function Management() {
  const [activeTab, setActiveTab] = useState<TabType>('zones');
  const [selectedZone, setSelectedZone] = useState<TemperatureZone | null>(null);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<TemperatureZone | null>(null);
  const [editingContract, setEditingContract] = useState<TenantContract | null>(null);
  const [contractZoneId, setContractZoneId] = useState<string>('');

  const {
    zones,
    contracts,
    temperatureRecords,
    addZone,
    updateZone,
    deleteZone,
    addContract,
    updateContract,
    deleteContract,
    getZoneContracts,
    getAvailablePallets,
  } = useColdStore();

  const handleAddZone = () => {
    setEditingZone(null);
    setIsZoneModalOpen(true);
  };

  const handleEditZone = (zone: TemperatureZone) => {
    setEditingZone(zone);
    setIsZoneModalOpen(true);
  };

  const handleDeleteZone = (id: string) => {
    if (confirm('确定要删除该温区吗？相关的合同和预约也会被清除。')) {
      deleteZone(id);
    }
  };

  const handleAddContract = (zoneId?: string) => {
    setEditingContract(null);
    setContractZoneId(zoneId || zones[0]?.id || '');
    setIsContractModalOpen(true);
  };

  const handleEditContract = (contract: TenantContract) => {
    setEditingContract(contract);
    setContractZoneId(contract.zoneId);
    setIsContractModalOpen(true);
  };

  const handleDeleteContract = (id: string) => {
    if (confirm('确定要删除该合同吗？')) {
      deleteContract(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">温区管理</h2>
          <p className="text-slate-500 mt-1">
            维护温区配置、租户信息与合同管理
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 px-6">
          {[
            { key: 'zones', label: '温区配置', icon: Thermometer },
            { key: 'contracts', label: '租户合同', icon: Building2 },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-cyan-500 text-cyan-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'zones' && (
          <div className="p-6">
            <div className="flex justify-end mb-4">
              <button
                onClick={handleAddZone}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                新增温区
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider rounded-l-lg">
                      温区名称
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      温度范围
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      当前温度
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      容量（托盘）
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      最低租期
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      日租金
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider rounded-r-lg">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {zones.map((zone) => (
                    <tr
                      key={zone.id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedZone(zone)}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                            <Thermometer className="w-5 h-5 text-cyan-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {zone.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {zone.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {zone.minTemp}°C ~ {zone.maxTemp}°C
                      </td>
                      <td className="px-4 py-4">
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
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <span className="text-sm font-medium text-slate-700">
                            {zone.usedPallets}/{zone.totalPallets}
                          </span>
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                              style={{
                                width: `${(zone.usedPallets / zone.totalPallets) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {zone.minLeaseDays} 天
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-700">
                        ¥{zone.dailyRate}/托
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={zone.status} />
                      </td>
                      <td className="px-4 py-4">
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleEditZone(zone)}
                            className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteZone(zone.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'contracts' && (
          <div className="p-6">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => handleAddContract()}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                新增合同
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider rounded-l-lg">
                      租户名称
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      所属温区
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      联系人
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      合同期限
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      租赁托盘
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider rounded-r-lg">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contracts.map((contract) => {
                    const zone = zones.find((z) => z.id === contract.zoneId);
                    return (
                      <tr key={contract.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-violet-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">
                                {contract.tenantName}
                              </p>
                              <p className="text-xs text-slate-400">
                                {contract.contactInfo}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {zone?.name || '-'}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {contract.contactPerson}
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm">
                            <p className="text-slate-700">
                              {contract.startDate}
                            </p>
                            <p className="text-slate-400">至 {contract.endDate}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-slate-700">
                          {contract.leasedPallets} 托
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={contract.status} />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditContract(contract)}
                              className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteContract(contract.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <ZoneModal
        isOpen={isZoneModalOpen}
        onClose={() => setIsZoneModalOpen(false)}
        zone={editingZone}
        onSave={(data) => {
          if (editingZone) {
            updateZone(editingZone.id, data);
          } else {
            addZone(data);
          }
          setIsZoneModalOpen(false);
        }}
      />

      <ContractModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        contract={editingContract}
        zones={zones}
        defaultZoneId={contractZoneId}
        onSave={(data) => {
          if (editingContract) {
            updateContract(editingContract.id, data);
          } else {
            addContract(data);
          }
          setIsContractModalOpen(false);
        }}
      />

      <Modal
        isOpen={!!selectedZone}
        onClose={() => setSelectedZone(null)}
        title={selectedZone?.name || ''}
        subtitle="温区详情"
        size="lg"
      >
        {selectedZone && (
          <ZoneDetail
            zone={selectedZone}
            contracts={getZoneContracts(selectedZone.id)}
            records={temperatureRecords[selectedZone.id] || []}
            availablePallets={getAvailablePallets(selectedZone.id)}
            onAddContract={() => {
              setSelectedZone(null);
              handleAddContract(selectedZone.id);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

interface ZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  zone: TemperatureZone | null;
  onSave: (data: Omit<TemperatureZone, 'id' | 'status'>) => void;
}

function ZoneModal({ isOpen, onClose, zone, onSave }: ZoneModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    minTemp: 0,
    maxTemp: 10,
    currentTemp: 5,
    totalPallets: 100,
    usedPallets: 0,
    minLeaseDays: 7,
    dailyRate: 15,
    description: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (zone) {
        setFormData({
          name: zone.name,
          minTemp: zone.minTemp,
          maxTemp: zone.maxTemp,
          currentTemp: zone.currentTemp,
          totalPallets: zone.totalPallets,
          usedPallets: zone.usedPallets,
          minLeaseDays: zone.minLeaseDays,
          dailyRate: zone.dailyRate,
          description: zone.description || '',
        });
      } else {
        setFormData({
          name: '',
          minTemp: 0,
          maxTemp: 10,
          currentTemp: 5,
          totalPallets: 100,
          usedPallets: 0,
          minLeaseDays: 7,
          dailyRate: 15,
          description: '',
        });
      }
    }
  }, [isOpen, zone]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={zone ? '编辑温区' : '新增温区'}
      subtitle={zone ? '修改温区配置信息' : '创建新的冷库温区'}
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
          >
            保存
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            温区名称
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
            placeholder="例如：A区 - 恒温冷藏"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              最低温度 (°C)
            </label>
            <input
              type="number"
              value={formData.minTemp}
              onChange={(e) =>
                setFormData({ ...formData, minTemp: Number(e.target.value) })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              最高温度 (°C)
            </label>
            <input
              type="number"
              value={formData.maxTemp}
              onChange={(e) =>
                setFormData({ ...formData, maxTemp: Number(e.target.value) })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Package className="w-4 h-4 inline mr-1" />
              总托盘位
            </label>
            <input
              type="number"
              value={formData.totalPallets}
              onChange={(e) =>
                setFormData({ ...formData, totalPallets: Number(e.target.value) })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Clock className="w-4 h-4 inline mr-1" />
              最低租期 (天)
            </label>
            <input
              type="number"
              value={formData.minLeaseDays}
              onChange={(e) =>
                setFormData({ ...formData, minLeaseDays: Number(e.target.value) })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            日租金 (元/托)
          </label>
          <input
            type="number"
            value={formData.dailyRate}
            onChange={(e) =>
              setFormData({ ...formData, dailyRate: Number(e.target.value) })
            }
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            温区描述
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all resize-none"
            placeholder="描述温区用途、特点等..."
          />
        </div>
      </form>
    </Modal>
  );
}

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: TenantContract | null;
  zones: TemperatureZone[];
  defaultZoneId: string;
  onSave: (data: Omit<TenantContract, 'id' | 'status'>) => void;
}

function ContractModal({
  isOpen,
  onClose,
  contract,
  zones,
  defaultZoneId,
  onSave,
}: ContractModalProps) {
  const [formData, setFormData] = useState({
    zoneId: '',
    tenantName: '',
    contactInfo: '',
    contactPerson: '',
    startDate: '',
    endDate: '',
    leasedPallets: 0,
  });

  useEffect(() => {
    if (isOpen) {
      if (contract) {
        setFormData({
          zoneId: contract.zoneId,
          tenantName: contract.tenantName,
          contactInfo: contract.contactInfo,
          contactPerson: contract.contactPerson,
          startDate: contract.startDate,
          endDate: contract.endDate,
          leasedPallets: contract.leasedPallets,
        });
      } else {
        const today = new Date();
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        setFormData({
          zoneId: defaultZoneId || zones[0]?.id || '',
          tenantName: '',
          contactInfo: '',
          contactPerson: '',
          startDate: today.toISOString().split('T')[0],
          endDate: nextYear.toISOString().split('T')[0],
          leasedPallets: 10,
        });
      }
    }
  }, [isOpen, contract, defaultZoneId, zones]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={contract ? '编辑合同' : '新增合同'}
      subtitle={contract ? '修改合同信息' : '创建新的租户合同'}
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
          >
            保存
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            <FileText className="w-4 h-4 inline mr-1" />
            所属温区
          </label>
          <select
            value={formData.zoneId}
            onChange={(e) =>
              setFormData({ ...formData, zoneId: e.target.value })
            }
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
          >
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            <Building2 className="w-4 h-4 inline mr-1" />
            租户名称
          </label>
          <input
            type="text"
            value={formData.tenantName}
            onChange={(e) =>
              setFormData({ ...formData, tenantName: e.target.value })
            }
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
            placeholder="请输入租户公司名称"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <User className="w-4 h-4 inline mr-1" />
              联系人
            </label>
            <input
              type="text"
              value={formData.contactPerson}
              onChange={(e) =>
                setFormData({ ...formData, contactPerson: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
              placeholder="联系人姓名"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Phone className="w-4 h-4 inline mr-1" />
              联系电话
            </label>
            <input
              type="text"
              value={formData.contactInfo}
              onChange={(e) =>
                setFormData({ ...formData, contactInfo: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
              placeholder="联系电话"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Calendar className="w-4 h-4 inline mr-1" />
              开始日期
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Calendar className="w-4 h-4 inline mr-1" />
              结束日期
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            <Package className="w-4 h-4 inline mr-1" />
            租赁托盘数
          </label>
          <input
            type="number"
            value={formData.leasedPallets}
            onChange={(e) =>
              setFormData({ ...formData, leasedPallets: Number(e.target.value) })
            }
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
            placeholder="租赁的托盘位数量"
          />
        </div>
      </form>
    </Modal>
  );
}

interface ZoneDetailProps {
  zone: TemperatureZone;
  contracts: TenantContract[];
  records: any[];
  availablePallets: number;
  onAddContract: () => void;
}

function ZoneDetail({ zone, contracts, records, availablePallets, onAddContract }: ZoneDetailProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">总托盘位</p>
          <p className="text-2xl font-bold text-slate-800">{zone.totalPallets}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">已使用</p>
          <p className="text-2xl font-bold text-cyan-600">{zone.usedPallets}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">可用</p>
          <p className="text-2xl font-bold text-emerald-600">{availablePallets}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">最低租期</p>
          <p className="text-2xl font-bold text-violet-600">{zone.minLeaseDays}天</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-slate-700 mb-3">24小时温度曲线</h4>
        {records.length > 0 && (
          <TemperatureChart
            records={records}
            minTemp={zone.minTemp}
            maxTemp={zone.maxTemp}
            height={180}
          />
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-slate-700">
            租户合同 ({contracts.length})
          </h4>
          <button
            onClick={onAddContract}
            className="text-xs font-medium text-cyan-600 hover:text-cyan-700"
          >
            + 添加合同
          </button>
        </div>
        <div className="space-y-2">
          {contracts.map((c) => (
            <div
              key={c.id}
              className="p-3 bg-slate-50 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {c.tenantName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {c.startDate} ~ {c.endDate}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-700">
                  {c.leasedPallets} 托
                </p>
                <StatusBadge status={c.status} />
              </div>
            </div>
          ))}
          {contracts.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-4">
              暂无租户合同
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
