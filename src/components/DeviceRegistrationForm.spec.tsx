
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { notification } from 'antd';
import DeviceRegistrationForm from './DeviceRegistrationForm';

jest.mock('axios');
jest.mock('antd', () => {
  const antd = jest.requireActual('antd');
  return {
    ...antd,
    notification: {
      success: jest.fn(),
      error: jest.fn(),
    },
  };
});

describe('DeviceRegistrationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<DeviceRegistrationForm />);
    expect(screen.getByLabelText(/Device Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Serial Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Metadata/i)).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('submits form successfully and shows success notification', async () => {
    (axios.post as jest.Mock).mockResolvedValueOnce({ data: {} });
    render(<DeviceRegistrationForm />);

    fireEvent.change(screen.getByLabelText(/Device Name/i), { target: { value: 'Test Device' } });
    fireEvent.change(screen.getByLabelText(/Serial Number/i), { target: { value: 'SN12345' } });
    fireEvent.change(screen.getByLabelText(/Metadata/i), { target: { value: '{"key":"value"}' } });

    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledWith('/api/devices', {
      name: 'Test Device',
      serialNumber: 'SN12345',
      metadata: '{"key":"value"}',
    }));

    await waitFor(() => expect(notification.success).toHaveBeenCalled());
  });

  it('handles API error and shows error notification', async () => {
    (axios.post as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: 'Invalid data' } },
    });
    render(<DeviceRegistrationForm />);

    fireEvent.change(screen.getByLabelText(/Device Name/i), { target: { value: 'Bad Device' } });
    fireEvent.change(screen.getByLabelText(/Serial Number/i), { target: { value: '' } }); // missing serial triggers validation but we bypass by submitting directly
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    await waitFor(() => expect(notification.error).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Device registration failed',
    })));
  });
});
