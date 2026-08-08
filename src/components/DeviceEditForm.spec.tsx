// Mock Ant Design components and notification
jest.mock('antd', () => {
  const React = require('react');
  // Simple Form mock that calls onFinish with form values
  const Form = ({ children, onFinish, ...rest }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const values = {};
        for (let [key, value] of formData.entries()) {
          values[key] = value;
        }
        onFinish(values);
      }}
      {...rest}
    >
      {children}
    </form>
  );
  // Mock Form.Item to simply render its children
  Form.Item = ({ label, name, children }) => (
    <div>
      <label>{label}</label>
      {React.cloneElement(children, { name })}
    </div>
  );
  const Input = (props) => <input {...props} />;
  Input.TextArea = (props) => <textarea {...props} />;
  const Button = ({ children, ...props }) => <button {...props}>{children}</button>;
  const notification = { success: jest.fn(), error: jest.fn() };
  return { Form, Input, Button, notification };
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import DeviceEditForm, { DeviceEditFormProps } from './DeviceEditForm';
import { notification } from 'antd';

jest.mock('axios');

describe('DeviceEditForm', () => {
  const defaultProps: DeviceEditFormProps = {
    id: '1',
    name: 'Test Device',
    serialNumber: 'SN123',
    metadata: '{"key":"value"}',
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields with initial values', () => {
    render(<DeviceEditForm {...defaultProps} />);
    expect(screen.getByLabelText(/Device Name/i)).toHaveValue('Test Device');
    expect(screen.getByLabelText(/Serial Number/i)).toHaveValue('SN123');
    expect(screen.getByLabelText(/Metadata/i)).toHaveValue('{"key":"value"}');
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('submits successfully and shows success notification', async () => {
    (axios.patch as jest.Mock).mockResolvedValueOnce({ data: {} });
    render(<DeviceEditForm {...defaultProps} />);

    // Change values
    fireEvent.change(screen.getByLabelText(/Device Name/i), { target: { value: 'Updated Device' } });
    fireEvent.change(screen.getByLabelText(/Serial Number/i), { target: { value: 'SN999' } });
    fireEvent.change(screen.getByLabelText(/Metadata/i), { target: { value: '{"new":"data"}' } });

    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith('/api/devices/1', {
        name: 'Updated Device',
        serialNumber: 'SN999',
        metadata: '{"new":"data"}',
      });
    });

    await waitFor(() => {
      expect(notification.success).toHaveBeenCalled();
      expect(defaultProps.onSuccess).toHaveBeenCalled();
    });
  });

  it('handles API error and shows error notification', async () => {
    (axios.patch as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: 'Invalid update' } },
    });
    render(<DeviceEditForm {...defaultProps} />);

    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(notification.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Device update failed',
        })
      );
    });
  });
});
