import React from 'react';
import { Form, Input, Button, notification } from 'antd';
import axios from 'axios';

/**
 * Props for DeviceEditForm component.
 * The component expects a device object containing the current values.
 */
export interface DeviceEditFormProps {
  /** Unique identifier of the device */
  id: string;
  /** Current device name */
  name: string;
  /** Current serial number */
  serialNumber: string;
  /** Optional metadata (JSON string or plain text) */
  metadata?: string;
  /** Optional callback after successful update */
  onSuccess?: () => void;
}

/**
 * DeviceEditForm allows an operator to edit an existing device's metadata.
 * It is pre‑filled with the provided device data and sends a PATCH request
 * to the backend API. Success and error toasts are displayed via Ant Design
 * notifications.
 */
const DeviceEditForm: React.FC<DeviceEditFormProps> = (props) => {
  const { id, name, serialNumber, metadata, onSuccess } = props;
  const [loading, setLoading] = React.useState(false);

  const initialValues = {
    name,
    serialNumber,
    metadata: metadata ?? '',
  };

  const onFinish = async (values: { name: string; serialNumber: string; metadata?: string }) => {
    setLoading(true);
    try {
      await axios.patch(`/api/devices/${id}`, values);
      notification.success({
        message: 'Device updated',
        description: `Device "${values.name}" has been updated successfully.`,
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      const errMsg =
        (error as any).response?.data?.message ||
        (error as any).message ||
        'Update failed';
      notification.error({
        message: 'Device update failed',
        description: errMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      name="device-edit"
      layout="vertical"
      onFinish={onFinish}
      initialValues={initialValues}
      data-testid="device-edit-form"
    >
      <Form.Item
        label="Device Name"
        name="name"
        rules={[{ required: true, message: 'Please input the device name' }]}
      >
        <Input placeholder="Enter device name" />
      </Form.Item>

      <Form.Item
        label="Serial Number"
        name="serialNumber"
        rules={[{ required: true, message: 'Please input the serial number' }]}
      >
        <Input placeholder="Enter serial number" />
      </Form.Item>

      <Form.Item label="Metadata (optional)" name="metadata">
        <Input.TextArea rows={4} placeholder="Enter metadata as JSON or plain text" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} data-testid="submit-button">
          Save Changes
        </Button>
      </Form.Item>
    </Form>
  );
};

export default DeviceEditForm;
