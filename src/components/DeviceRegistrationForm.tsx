import React from 'react';
import { Form, Input, Button, notification } from 'antd';
import axios from 'axios';

interface DeviceFormValues {
  name: string;
  serialNumber: string;
  metadata?: string;
}

/**
 * DeviceRegistrationForm allows operators to register a new device.
 * It uses Ant Design components and posts the data to the backend API.
 */
const DeviceRegistrationForm: React.FC = () => {
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: DeviceFormValues) => {
    setLoading(true);
    try {
      await axios.post('/api/devices', values);
      notification.success({
        message: 'Device registered',
        description: `Device "${values.name}" has been created successfully.`,
      });
    } catch (error) {
      // Extract error message if available
      const errMsg =
        (error as any).response?.data?.message ||
        (error as any).message ||
        'Registration failed';
      notification.error({
        message: 'Device registration failed',
        description: errMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      name="device-registration"
      layout="vertical"
      onFinish={onFinish}
      data-testid="device-registration-form"
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
          Register Device
        </Button>
      </Form.Item>
    </Form>
  );
};

export default DeviceRegistrationForm;
