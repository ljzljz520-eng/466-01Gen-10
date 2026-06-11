export interface TemperatureZone {
  id: string;
  name: string;
  minTemp: number;
  maxTemp: number;
  currentTemp: number;
  totalPallets: number;
  usedPallets: number;
  minLeaseDays: number;
  dailyRate: number;
  status: 'normal' | 'warning' | 'alert';
  description?: string;
}

export interface TenantContract {
  id: string;
  zoneId: string;
  tenantName: string;
  contactInfo: string;
  contactPerson: string;
  startDate: string;
  endDate: string;
  leasedPallets: number;
  status: 'active' | 'expired' | 'pending';
}

export interface Reservation {
  id: string;
  zoneId: string;
  contractId: string;
  cargoName: string;
  batchNo: string;
  palletCount: number;
  inboundDate: string;
  expectedOutboundDate: string;
  actualOutboundDate?: string;
  status: 'pending' | 'in-stock' | 'outbound';
  temperatureAlerts?: string[];
}

export interface TemperatureRecord {
  id: string;
  zoneId: string;
  temperature: number;
  timestamp: string;
}

export interface TemperatureAlert {
  id: string;
  zoneId: string;
  type: 'high' | 'low';
  temperature: number;
  threshold: number;
  startTime: string;
  endTime: string;
  duration: number;
  affectedBatchNos?: string[];
}

export interface OutboundNote {
  id: string;
  reservationId: string;
  content: string;
  alertIds: string[];
  createdDate: string;
  severity: 'normal' | 'warning' | 'severe';
}
