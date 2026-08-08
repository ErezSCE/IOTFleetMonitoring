const fs = require('fs');
const path = require('path');

describe('CI workflow smoke test step', () => {
  const workflowPath = path.resolve(__dirname, '..', '.github', 'workflows', 'ci.yml');

  test('workflow file should exist', () => {
    expect(fs.existsSync(workflowPath)).toBe(true);
  });

  test('should contain post-deployment smoke test step using curl', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    // Check for step name
    expect(content).toMatch(/name:\s*Post-deployment smoke test/);
    // Check that curl command is present
    expect(content).toMatch(/curl\s+-f\s+-s/);
  });
});
