import React, { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Input, Button, Space } from 'antd';
import type { ColumnsType, TablePaginationConfig, SorterResult, FilterValue } from 'antd/es/table/interface';
import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { io, Socket } from 'socket.io-client';

interface Device {
  id: string;
  name: string;
  serialNumber: string;
  isActive: boolean;
  metadata?: Record<string, any>;
}

interface DeviceTableProps {}

const DeviceTable: React.FC<DeviceTableProps> = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Fetch devices from backend
  const fetchDevices = useCallback(async () => {
    setLoading(true);
    try {
      const response: AxiosResponse<Device[]> = await axios.get('/api/devices');
      setDevices(response.data);
    } catch (error) {
      // In production, handle error UI
      console.error('Failed to fetch devices', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize data and WebSocket connection
  useEffect(() => {
    fetchDevices();
    const newSocket = io('http://localhost:3000', {
      path: '/notifications',
      transports: ['websocket'],
    });
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [fetchDevices]);

  // Listen for device updates via WebSocket
  useEffect(() => {
    if (!socket) return;
    const handler = (data: Device) => {
      setDevices(prev => {
        const index = prev.findIndex(d => d.id === data.id);
        if (index === -1) {
          // New device
          return [...prev, data];
        }
        // Update existing device
        const updated = [...prev];
        updated[index] = data;
        return updated;
      });
    };
    socket.on('deviceUpdate', handler);
    return () => {
      socket.off('deviceUpdate', handler);
    };
  }, [socket]);

  // Table columns definition with sorting and filtering
  const columns: ColumnsType<Device> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      sorter: (a, b) => a.serialNumber.localeCompare(b.serialNumber),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Inactive'}</Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
    },
  ];

  // Handle table change for pagination, sorting, filtering (AntD handles most internally)
  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<Device> | SorterResult<Device>[]
  ) => {
    // For this simple implementation, we rely on AntD's internal state management.
    // In a real app, you might request sorted/filtered data from the server.
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Input.Search placeholder="Search by name" onSearch={(value) => {
        const filtered = devices.filter(d => d.name.toLowerCase().includes(value.toLowerCase()));
        setDevices(filtered);
      }} allowClear style={{ width: 300 }} />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={devices}
        loading={loading}
        pagination={{ pageSize: 10 }}
        onChange={handleTableChange}
      />
    </Space>
  );
};

export default DeviceTable;
