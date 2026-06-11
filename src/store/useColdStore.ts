import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  TemperatureZone,
  TenantContract,
  Reservation,
  TemperatureRecord,
  TemperatureAlert,
  OutboundNote,
} from '@/types';
import {
  mockZones,
  mockContracts,
  mockReservations,
  mockTemperatureRecords,
  mockAlerts,
  mockOutboundNotes,
  generateId,
} from '@/data/mockData';

interface ColdStoreState {
  zones: TemperatureZone[];
  contracts: TenantContract[];
  reservations: Reservation[];
  temperatureRecords: Record<string, TemperatureRecord[]>;
  alerts: TemperatureAlert[];
  outboundNotes: OutboundNote[];

  addZone: (zone: Omit<TemperatureZone, 'id' | 'status'>) => void;
  updateZone: (id: string, updates: Partial<TemperatureZone>) => void;
  deleteZone: (id: string) => void;

  addContract: (contract: Omit<TenantContract, 'id' | 'status'>) => void;
  updateContract: (id: string, updates: Partial<TenantContract>) => void;
  deleteContract: (id: string) => void;

  addReservation: (
    reservation: Omit<Reservation, 'id' | 'status'>
  ) => void;
  updateReservation: (
    id: string,
    updates: Partial<Reservation>
  ) => void;
  deleteReservation: (id: string) => void;

  addTemperatureRecord: (zoneId: string, record: TemperatureRecord) => void;
  addAlert: (alert: Omit<TemperatureAlert, 'id'>) => void;
  addOutboundNote: (note: Omit<OutboundNote, 'id'>) => void;

  getAvailablePallets: (zoneId: string) => number;
  getZoneContracts: (zoneId: string) => TenantContract[];
  getZoneReservations: (zoneId: string) => Reservation[];
  getZoneAlerts: (zoneId: string) => TemperatureAlert[];
  getReservationAlerts: (reservationId: string) => TemperatureAlert[];
}

export const useColdStore = create<ColdStoreState>()(
  persist(
    (set, get) => ({
      zones: mockZones,
      contracts: mockContracts,
      reservations: mockReservations,
      temperatureRecords: mockTemperatureRecords,
      alerts: mockAlerts,
      outboundNotes: mockOutboundNotes,

      addZone: (zone) =>
        set((state) => ({
          zones: [
            ...state.zones,
            {
              ...zone,
              id: generateId('zone'),
              status: 'normal' as const,
            },
          ],
        })),

      updateZone: (id, updates) =>
        set((state) => ({
          zones: state.zones.map((z) =>
            z.id === id ? { ...z, ...updates } : z
          ),
        })),

      deleteZone: (id) =>
        set((state) => ({
          zones: state.zones.filter((z) => z.id !== id),
          contracts: state.contracts.filter((c) => c.zoneId !== id),
          reservations: state.reservations.filter((r) => r.zoneId !== id),
        })),

      addContract: (contract) =>
        set((state) => ({
          contracts: [
            ...state.contracts,
            {
              ...contract,
              id: generateId('contract'),
              status: 'active' as const,
            },
          ],
        })),

      updateContract: (id, updates) =>
        set((state) => ({
          contracts: state.contracts.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      deleteContract: (id) =>
        set((state) => ({
          contracts: state.contracts.filter((c) => c.id !== id),
        })),

      addReservation: (reservation) =>
        set((state) => {
          const newReservation: Reservation = {
            ...reservation,
            id: generateId('res'),
            status: 'pending' as const,
          };
          const zone = state.zones.find((z) => z.id === reservation.zoneId);
          const updatedZones = zone
            ? state.zones.map((z) =>
                z.id === reservation.zoneId
                  ? { ...z, usedPallets: z.usedPallets + reservation.palletCount }
                  : z
              )
            : state.zones;
          return {
            reservations: [...state.reservations, newReservation],
            zones: updatedZones,
          };
        }),

      updateReservation: (id, updates) =>
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      deleteReservation: (id) =>
        set((state) => {
          const reservation = state.reservations.find((r) => r.id === id);
          const updatedZones = reservation
            ? state.zones.map((z) =>
                z.id === reservation.zoneId
                  ? { ...z, usedPallets: z.usedPallets - reservation.palletCount }
                  : z
              )
            : state.zones;
          return {
            reservations: state.reservations.filter((r) => r.id !== id),
            zones: updatedZones,
          };
        }),

      addTemperatureRecord: (zoneId, record) =>
        set((state) => {
          const zoneRecords = state.temperatureRecords[zoneId] || [];
          const newRecords = [...zoneRecords.slice(-47), record];
          const zone = state.zones.find((z) => z.id === zoneId);
          let updatedZones = state.zones;
          if (zone) {
            let status: 'normal' | 'warning' | 'alert' = 'normal';
            if (
              record.temperature > zone.maxTemp ||
              record.temperature < zone.minTemp
            ) {
              status = 'alert';
            } else if (
              record.temperature > zone.maxTemp - (zone.maxTemp - zone.minTemp) * 0.1 ||
              record.temperature < zone.minTemp + (zone.maxTemp - zone.minTemp) * 0.1
            ) {
              status = 'warning';
            }
            updatedZones = state.zones.map((z) =>
              z.id === zoneId
                ? { ...z, currentTemp: record.temperature, status }
                : z
            );
          }
          return {
            temperatureRecords: {
              ...state.temperatureRecords,
              [zoneId]: newRecords,
            },
            zones: updatedZones,
          };
        }),

      addAlert: (alert) =>
        set((state) => ({
          alerts: [
            ...state.alerts,
            {
              ...alert,
              id: generateId('alert'),
            },
          ],
        })),

      addOutboundNote: (note) =>
        set((state) => ({
          outboundNotes: [
            ...state.outboundNotes,
            {
              ...note,
              id: generateId('note'),
            },
          ],
        })),

      getAvailablePallets: (zoneId) => {
        const state = get();
        const zone = state.zones.find((z) => z.id === zoneId);
        if (!zone) return 0;
        return zone.totalPallets - zone.usedPallets;
      },

      getZoneContracts: (zoneId) => {
        const state = get();
        return state.contracts.filter((c) => c.zoneId === zoneId);
      },

      getZoneReservations: (zoneId) => {
        const state = get();
        return state.reservations.filter((r) => r.zoneId === zoneId);
      },

      getZoneAlerts: (zoneId) => {
        const state = get();
        return state.alerts.filter((a) => a.zoneId === zoneId);
      },

      getReservationAlerts: (reservationId) => {
        const state = get();
        const reservation = state.reservations.find((r) => r.id === reservationId);
        if (!reservation?.temperatureAlerts) return [];
        return state.alerts.filter((a) =>
          reservation.temperatureAlerts?.includes(a.id)
        );
      },
    }),
    {
      name: 'cold-storage-store',
    }
  )
);
