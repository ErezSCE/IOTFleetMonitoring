const fs = require('fs');
const path = require('path');

describe('Frontend scaffold', () => {
  test('src directory should contain index.tsx and App.tsx', () => {
    const srcPath = path.resolve(__dirname, '..', 'frontend', 'src');
    const indexPath = path.join(srcPath, 'index.tsx');
    const appPath = path.join(srcPath, 'App.tsx');
    expect(fs.existsSync(indexPath)).toBe(true);
    expect(fs.existsSync(appPath)).toBe(true);
    const appContent = fs.readFileSync(appPath, 'utf-8');
    expect(appContent).toMatch(/IoT Fleet Monitoring/);
  });

  test('folder structure includes components and pages directories', () => {
    const componentsPath = path.resolve(__dirname, '..', 'frontend', 'src', 'components');
    const pagesPath = path.resolve(__dirname, '..', 'frontend', 'src', 'pages');
    expect(fs.existsSync(componentsPath)).toBe(true);
    expect(fs.existsSync(pagesPath)).toBe(true);
  });
});
