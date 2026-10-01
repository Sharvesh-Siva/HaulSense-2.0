/**
 * HaulSense - Unified Logistics State & Two-Sided Operational Context
 * Synchronizes Manager ↔ HaulSense Agent ↔ Driver in real-time.
 * Persists state across sessions with realistic fleet defaults.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Driver,
  DriverTripIssue,
  ReturnLoad,
  Shipment,
  TripChatMessage,
  TripLifecycleStatus,
  Vehicle,
} from '../types';
import {
  ALL_SHIPMENTS,
  DRIVERS,
  RETURN_LOADS,
  TARGET_SHIPMENTS,
  VEHICLES,
} from '../data/mockData';

export interface AppNotification {
  id: string;
  timestamp: string;
  source: 'driver' | 'manager' | 'agent' | 'system';
  targetRole: 'manager' | 'driver' | 'all';
  type: 'mismatch_alert' | 'status_change' | 'incident' | 'return_load_match' | 'assignment';
  title: string;
  message: string;
  read: boolean;
  relatedShipmentId?: string;
  relatedVehicleId?: string;
}

interface LogisticsContextType {
  shipments: Shipment[];
  vehicles: Vehicle[];
  drivers: Driver[];
  returnLoads: ReturnLoad[];
  notifications: AppNotification[];
  chatMessages: Record<string, TripChatMessage[]>;
  // Actions
  updateTripLifecycle: (shipmentId: string, status: TripLifecycleStatus) => void;
  reportIncident: (issue: Omit<DriverTripIssue, 'id' | 'timestamp' | 'resolved'>) => void;
  requestVehicleAlternative: (shipmentId: string, currentVehicleId: string, reason: string) => void;
  claimReturnLoad: (returnLoadId: string, driverId: string) => void;
  updateDriverAvailability: (driverId: string, status: Driver['status']) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearNotifications: () => void;
  sendChatMessage: (tripId: string, msg: Omit<TripChatMessage, 'id' | 'timestamp' | 'readByOtherRole'>) => Promise<TripChatMessage>;
  markTripChatAsRead: (tripId: string, forRole: 'manager' | 'driver') => void;
  resetToDefaults: () => void;
}

const STORAGE_KEYS = {
  SHIPMENTS: 'haulsense_shipments_v2',
  VEHICLES: 'haulsense_vehicles_v2',
  DRIVERS: 'haulsense_drivers_v2',
  RETURN_LOADS: 'haulsense_return_loads_v2',
  NOTIFICATIONS: 'haulsense_notifications_v2',
  CHAT: 'haulsense_trip_chat_v2',
};

const INITIAL_TRIP_CHATS: Record<string, TripChatMessage[]> = {
  'S-GOLDEN': [
    {
      id: 'msg-1',
      tripId: 'S-GOLDEN',
      senderRole: 'manager',
      senderId: 'MGR-001',
      senderName: 'Karthik Subramanian (Dispatch Lead)',
      timestamp: new Date(Date.now() - 40 * 60000).toISOString(),
      text: 'Ravi, FMCG pallet dispatch for S-GOLDEN is ready at Chennai Central Bay 4. Total weight 6.2T with 22 m³ volume. Tarp seal #CHN-9921 is allocated.',
      readByOtherRole: true,
    },
    {
      id: 'msg-2',
      tripId: 'S-GOLDEN',
      senderRole: 'driver',
      senderId: 'DRV-001',
      senderName: 'Ravi Kumar (Driver)',
      timestamp: new Date(Date.now() - 32 * 60000).toISOString(),
      text: 'Vanakkam Karthik sir. Arrived at Bay 4 with assigned truck TN 38 AB 4521. Pre-trip inspection completed, tire pressure and 24V engine diagnostics all green.',
      readByOtherRole: true,
    },
    {
      id: 'msg-3',
      tripId: 'S-GOLDEN',
      senderRole: 'manager',
      senderId: 'MGR-001',
      senderName: 'Karthik Subramanian (Dispatch Lead)',
      timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
      text: 'Superb. Consignee deadline in Bengaluru is 8:00 PM. HaulSense Agent also identified Return Load R1 (Bengaluru → Chennai) with ₹7,800 driver share. I have locked that backhaul for your truck.',
      readByOtherRole: true,
    },
    {
      id: 'msg-4',
      tripId: 'S-GOLDEN',
      senderRole: 'driver',
      senderId: 'DRV-001',
      senderName: 'Ravi Kumar (Driver)',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      text: 'Thank you sir! Return haul R1 is perfect. Fits our 7.5T closed hold. Loading completed, gate pass verified. Departing Chennai via NH-48 corridor.',
      attachmentType: 'location_pin',
      attachmentTitle: 'Current GPS Pin',
      attachmentData: 'NH-48 Sriperumbudur Tollway (Lat: 12.9821, Lng: 79.9412)',
      readByOtherRole: true,
    },
  ],
};

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'NOTIF-1',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    source: 'agent',
    targetRole: 'all',
    type: 'return_load_match',
    title: 'High-Profit Return Haul Identified',
    message: 'Return load R1 (Bengaluru → Chennai) offers ₹7,800 driver earnings. Cycle profit optimal.',
    read: false,
    relatedShipmentId: 'S-GOLDEN',
  },
  {
    id: 'NOTIF-2',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    source: 'manager',
    targetRole: 'driver',
    type: 'assignment',
    title: 'New Trip Assigned: S-GOLDEN',
    message: 'You have been assigned FMCG Pallet Distribution (Chennai → Bengaluru) with TN 38 AB 4521.',
    read: false,
    relatedShipmentId: 'S-GOLDEN',
    relatedVehicleId: 'V1',
  },
];

const LogisticsContext = createContext<LogisticsContextType | undefined>(undefined);

export const LogisticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shipments, setShipments] = useState<Shipment[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SHIPMENTS);
      return stored ? JSON.parse(stored) : ALL_SHIPMENTS;
    } catch {
      return ALL_SHIPMENTS;
    }
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VEHICLES);
      return stored ? JSON.parse(stored) : VEHICLES;
    } catch {
      return VEHICLES;
    }
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DRIVERS);
      return stored ? JSON.parse(stored) : DRIVERS;
    } catch {
      return DRIVERS;
    }
  });

  const [returnLoads, setReturnLoads] = useState<ReturnLoad[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RETURN_LOADS);
      return stored ? JSON.parse(stored) : RETURN_LOADS;
    } catch {
      return RETURN_LOADS;
    }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return stored ? JSON.parse(stored) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [chatMessages, setChatMessages] = useState<Record<string, TripChatMessage[]>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CHAT);
      return stored ? JSON.parse(stored) : INITIAL_TRIP_CHATS;
    } catch {
      return INITIAL_TRIP_CHATS;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(shipments));
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
      localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
      localStorage.setItem(STORAGE_KEYS.RETURN_LOADS, JSON.stringify(returnLoads));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(chatMessages));
    } catch (e) {
      console.warn('Failed to persist logistics data', e);
    }
  }, [shipments, vehicles, drivers, returnLoads, notifications, chatMessages]);

  // Actions
  const updateTripLifecycle = (shipmentId: string, status: TripLifecycleStatus) => {
    setShipments((prev) =>
      prev.map((s) => {
        if (s.id === shipmentId) {
          const updated: Shipment = {
            ...s,
            lifecycleStatus: status,
            status: status === 'delivered' || status === 'completed' ? 'delivered' : 'in_transit',
          };
          return updated;
        }
        return s;
      })
    );

    // Notify Manager
    const newNotif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      timestamp: new Date().toISOString(),
      source: 'driver',
      targetRole: 'manager',
      type: 'status_change',
      title: `Trip ${shipmentId} Status Updated`,
      message: `Driver updated trip status to '${status.toUpperCase().replace('_', ' ')}'.`,
      read: false,
      relatedShipmentId: shipmentId,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const reportIncident = (issue: Omit<DriverTripIssue, 'id' | 'timestamp' | 'resolved'>) => {
    const newNotif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      timestamp: new Date().toISOString(),
      source: 'driver',
      targetRole: 'manager',
      type: 'incident',
      title: `⚠ Incident Reported: ${issue.category.toUpperCase().replace('_', ' ')}`,
      message: `Severity [${issue.severity.toUpperCase()}]: ${issue.description}`,
      read: false,
      relatedShipmentId: issue.tripId,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const requestVehicleAlternative = (
    shipmentId: string,
    currentVehicleId: string,
    reason: string
  ) => {
    const curVeh = vehicles.find((v) => v.id === currentVehicleId);
    const newNotif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      timestamp: new Date().toISOString(),
      source: 'driver',
      targetRole: 'manager',
      type: 'mismatch_alert',
      title: `⚠ Vehicle Mismatch Alert: ${curVeh?.plateNumber || currentVehicleId}`,
      message: `Driver flagged vehicle mismatch for shipment ${shipmentId}. Reason: ${reason}. Alternative vehicle requested.`,
      read: false,
      relatedShipmentId: shipmentId,
      relatedVehicleId: currentVehicleId,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const claimReturnLoad = (returnLoadId: string, driverId: string) => {
    setReturnLoads((prev) =>
      prev.map((r) => (r.id === returnLoadId ? { ...r, status: 'reserved' } : r))
    );

    const ret = returnLoads.find((r) => r.id === returnLoadId);
    const newNotif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      timestamp: new Date().toISOString(),
      source: 'driver',
      targetRole: 'all',
      type: 'return_load_match',
      title: `Return Load Claimed: ${ret?.origin} → ${ret?.destination}`,
      message: `Driver ${driverId} claimed return load ${returnLoadId} (Driver Earnings: ₹${ret?.driverShare.toLocaleString('en-IN')}).`,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const updateDriverAvailability = (driverId: string, status: Driver['status']) => {
    setDrivers((prev) =>
      prev.map((d) =>
        d.id === driverId
          ? {
              ...d,
              status,
              availability: { ...d.availability, status },
            }
          : d
      )
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const sendChatMessage = async (
    tripId: string,
    msg: Omit<TripChatMessage, 'id' | 'timestamp' | 'readByOtherRole'>
  ): Promise<TripChatMessage> => {
    const localNewMessage: TripChatMessage = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tripId,
      timestamp: new Date().toISOString(),
      readByOtherRole: false,
      ...msg,
    };

    // Optimistic local state update
    setChatMessages((prev) => {
      const existing = prev[tripId] || [];
      return {
        ...prev,
        [tripId]: [...existing, localNewMessage],
      };
    });

    // Also add notification for the other role
    const otherRole: 'manager' | 'driver' = msg.senderRole === 'manager' ? 'driver' : 'manager';
    const notif: AppNotification = {
      id: `NOTIF-CHAT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      source: msg.senderRole,
      targetRole: otherRole,
      type: 'status_change',
      title: `New Dispatch Message (${tripId})`,
      message: `${msg.senderName}: "${msg.text.length > 60 ? msg.text.substring(0, 60) + '...' : msg.text}"`,
      read: false,
      relatedShipmentId: tripId,
    };
    setNotifications((prev) => [notif, ...prev]);

    // Send to backend
    try {
      fetch(`/api/chat/${tripId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg),
      }).catch(() => {});
    } catch {}

    return localNewMessage;
  };

  const markTripChatAsRead = (tripId: string, forRole: 'manager' | 'driver') => {
    setChatMessages((prev) => {
      const list = prev[tripId];
      if (!list) return prev;
      return {
        ...prev,
        [tripId]: list.map((m) =>
          m.senderRole !== forRole ? { ...m, readByOtherRole: true } : m
        ),
      };
    });
  };

  const resetToDefaults = () => {
    setShipments(ALL_SHIPMENTS);
    setVehicles(VEHICLES);
    setDrivers(DRIVERS);
    setReturnLoads(RETURN_LOADS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setChatMessages(INITIAL_TRIP_CHATS);
    try {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    } catch {}
  };

  return (
    <LogisticsContext.Provider
      value={{
        shipments,
        vehicles,
        drivers,
        returnLoads,
        notifications,
        chatMessages,
        updateTripLifecycle,
        reportIncident,
        requestVehicleAlternative,
        claimReturnLoad,
        updateDriverAvailability,
        markNotificationAsRead,
        clearNotifications,
        sendChatMessage,
        markTripChatAsRead,
        resetToDefaults,
      }}
    >
      {children}
    </LogisticsContext.Provider>
  );
};

export const useLogistics = (): LogisticsContextType => {
  const context = useContext(LogisticsContext);
  if (!context) {
    throw new Error('useLogistics must be used within a LogisticsProvider');
  }
  return context;
};
