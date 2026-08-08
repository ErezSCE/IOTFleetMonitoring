import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeviceRegistrationForm from './DeviceRegistrationForm';

// Mock external dependencies to avoid real HTTP requests and UI side effects
jest.mock('axios', () => ({
  post: jest.fn().mockResolvedValue({ data: {} }),
}));

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
  it('renders the registration form with required fields', () => {
    render(<DeviceRegistrationForm />);
    // Check that the form fields are present
    expect(screen.getByLabelText(/Device Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Serial Number/i)).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });
});
