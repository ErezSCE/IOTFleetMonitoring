const fs = require('fs');
const path = require('path');

test('package.json should define workspaces including frontend', () => {
  const pkgPath = path.resolve(__dirname, '..', 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  expect(Array.isArray(pkg.workspaces)).toBe(true);
  expect(pkg.workspaces).toContain('frontend');
});
