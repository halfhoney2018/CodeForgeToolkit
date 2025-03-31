const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// 创建命令行交互界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 读取当前package.json
const packageJsonPath = path.resolve(__dirname, '../package.json');
const packageJson = require(packageJsonPath);
const currentVersion = packageJson.version;

console.log(`当前版本: ${currentVersion}`);

// 询问版本类型
rl.question('请选择版本更新类型 (1: 补丁版本 patch, 2: 次要版本 minor, 3: 主要版本 major): ', (answer) => {
  let newVersion;
  const versionParts = currentVersion.split('.').map(Number);

  switch (answer.trim()) {
    case '1':
      // 补丁版本 +0.0.1
      newVersion = `${versionParts[0]}.${versionParts[1]}.${versionParts[2] + 1}`;
      break;
    case '2':
      // 次要版本 +0.1.0
      newVersion = `${versionParts[0]}.${versionParts[1] + 1}.0`;
      break;
    case '3':
      // 主要版本 +1.0.0
      newVersion = `${versionParts[0] + 1}.0.0`;
      break;
    default:
      console.error('无效的选择，请输入1、2或3');
      rl.close();
      return;
  }

  console.log(`新版本将是: ${newVersion}`);

  // 询问更新内容
  rl.question('请输入此版本的更新内容 (用于CHANGELOG): ', (changelog) => {
    // 更新package.json
    packageJson.version = newVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    // 更新manifest.json
    const manifestPath = path.resolve(__dirname, '../public/manifest.json');
    const manifest = require(manifestPath);
    manifest.version = newVersion;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    
    // 创建CHANGELOG条目
    const changelogPath = path.resolve(__dirname, '../CHANGELOG.md');
    let changelogContent = '';
    
    if (fs.existsSync(changelogPath)) {
      changelogContent = fs.readFileSync(changelogPath, 'utf8');
    } else {
      changelogContent = '# 更新日志\n\n';
    }
    
    const date = new Date().toISOString().split('T')[0];
    const newChangelogEntry = `## [${newVersion}] - ${date}\n\n${changelog}\n\n`;
    
    fs.writeFileSync(
      changelogPath,
      changelogContent.replace('# 更新日志\n\n', `# 更新日志\n\n${newChangelogEntry}`)
    );
    
    // 提交更改
    try {
      console.log('提交版本更新...');
      execSync('git add package.json public/manifest.json CHANGELOG.md');
      execSync(`git commit -m "chore: bump version to ${newVersion}"`);
      
      // 创建标签
      console.log('创建版本标签...');
      execSync(`git tag -a v${newVersion} -m "Version ${newVersion}"`);
      
      console.log(`
=================================================
✅ 版本 ${newVersion} 准备就绪!

要发布此版本，请运行:
git push origin main
git push origin v${newVersion}

GitHub Actions 将自动构建并创建 Release
=================================================
      `);
    } catch (error) {
      console.error('Git 操作失败:', error.message);
    }
    
    rl.close();
  });
});
