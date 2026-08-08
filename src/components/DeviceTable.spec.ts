import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { io } from 'socket.io-client'; // socket.io-client is mocked in tests
// Removed direct import of io to avoid type issues
import DeviceTable from './DeviceTable';

// Mock axios
jest.mock('axios');
// Mock socket.io-client
jest.mock('socket.io-client');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedIo = io as jest.MockedFunction<typeof io>;

// Helper to create a mock socket
function createMockSocket() {
  const listeners: Record<string, ((...args: any[]) => void)[]> = {};
  return {
    on: jest.fn((event: string, cb: (...args: any[]) => void) => {
      listeners[event] = listeners[event] || [];
      listeners[event].push(cb);
    }),
    off: jest.fn((event: string, cb: (...args: any[]) => void) => {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter(l => l !== cb);
    }),
    emit: jest.fn(),
    disconnect: jest.fn(),
    // expose a method to trigger events in tests
    __trigger: (event: string, data: any) => {
      (listeners[event] || []).forEach(cb => cb(data));
    },
  } as any;
}

describe('DeviceTable component', () => {
  const devices = [
    { id: '1', name: 'Alpha', serialNumber: 'SN001', isActive: true },
    { id: '2', name: 'Beta', serialNumber: 'SN002', isActive: false },
  ];

  let mockSocket: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValueOnce({ data: devices });
    mockSocket = createMockSocket();
    mockedIo.mockReturnValue(mockSocket);
  });

  it('renders device rows after fetching', async () => {
    render(React.createElement(DeviceTable));
    // Wait for axios call to resolve and table to render rows
    await waitFor(() => expect(screen.getByText('Alpha')).toBeInTheDocument());
    expect(screen.getByText('Beta')).toBeInTheDocument();
    // Check status tags
    expect(screen.getAllByText('Active')).toHaveLength(1);
    expect(screen.getAllByText('Inactive')).toHaveLength(1);
  });

  it('filters devices via search input', async () => {
    render(<DeviceTable />);
    await waitFor(() => expect(screen.getByText('Alpha')).toBeInTheDocument());
    const search = screen.getByPlaceholderText('Search by name');
    fireEvent.change(search, { target: { value: 'Alpha' } });
    fireEvent.keyDown(search, { key: 'Enter', code: 'Enter' });
    // After filtering, only Alpha should remain
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
  });

  it('updates a device row when receiving a WebSocket deviceUpdate event', async () => {
    render(<DeviceTable />);
    await waitFor(() => expect(screen.getByText('Alpha')).toBeInTheDocument());
    // Simulate a device update via socket
    const updatedDevice = { id: '1', name: 'Alpha Updated', serialNumber: 'SN001', isActive: false };
    mockSocket.__trigger('deviceUpdate', updatedDevice);
    // The table should reflect updated name and status
    await waitFor(() => expect(screen.getByText('Alpha Updated')).toBeInTheDocument());
    expect(screen.getAllByText('Inactive')).toHaveLength(2); // both rows now inactive
  });
});
