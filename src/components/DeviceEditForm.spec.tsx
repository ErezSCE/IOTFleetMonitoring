import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { notification } from 'antd';
import DeviceEditForm, { DeviceEditFormProps } from './DeviceEditForm';

jest.mock('axios');
jest.mock('antd', () => {
  const React = require('react');
  const Form = ({ children, onFinish, initialValues, ...rest }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onFinish(Object.fromEntries(new FormData(e.target)));
      }}
      {...rest}
    >
      {children}
    </form>
  );
  const Input = (props) => <input {...props} />;
  Input.TextArea = (props) => <textarea {...props} />;
  const Button = ({ children, ...props }) => <button {...props}>{children}</button>;
  const notification = { success: jest.fn(), error: jest.fn() };
  return { Form, Input, Button, notification };
});

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
