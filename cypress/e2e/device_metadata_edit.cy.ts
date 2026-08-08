/// <reference types="cypress" />

describe('Device metadata edit flow', () => {
  it('edits device metadata and saves', () => {
    const device = {
      id: '123',
      name: 'Device A',
      serialNumber: 'SN001',
      metadata: '{"key":"value"}',
    };

    // Stub the PATCH request to the backend API
    cy.intercept('PATCH', `/api/devices/${device.id}`, {
      statusCode: 200,
      body: {
        ...device,
        name: 'Device B',
        serialNumber: 'SN002',
        metadata: '{"new":"data"}',
      },
    }).as('updateDevice');

    // Visit the edit page for the device (assumes route exists in the SPA)
    cy.visit(`/devices/${device.id}/edit`);

    // Ensure the edit form is rendered
    cy.get('[data-testid="device-edit-form"]').should('exist');

    // Fill in new values
    cy.get('input[placeholder="Enter device name"]').clear().type('Device B');
    cy.get('input[placeholder="Enter serial number"]').clear().type('SN002');
    cy.get('textarea[placeholder="Enter metadata as JSON or plain text"]').clear().type('{"new":"data"}');

    // Submit the form
    cy.get('[data-testid="submit-button"]').click();

    // Verify the PATCH request payload
    cy.wait('@updateDevice')
      .its('request.body')
      .should('deep.equal', {
        name: 'Device B',
        serialNumber: 'SN002',
        metadata: '{"new":"data"}',
      });

    // Verify success notification appears
    cy.contains('Device updated').should('be.visible');
  });
});
