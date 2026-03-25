#!/usr/bin/env node

/**
 * 数据处理脚本：将 JSON 转换为 Markdown 文件
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// 确保 skills 目录存在
if (!existsSync('skills')) {
  mkdirSync('skills', { recursive: true });
  console.log('📁 Created skills directory');
}

// 读取采集的数据
const trendingData = JSON.parse(readFileSync('output/trending.json', 'utf-8'));

console.log(`📊 Processing ${trendingData.repos.length} repos...`);

// 为每个仓库生成 Markdown 文件
for (const repo of trendingData.repos) {
  const dirName = repo.full_name.replace('/', '-');
  const skillDir = join('skills', dirName);
  
  // 创建目录
  if (!existsSync(skillDir)) {
    mkdirSync(skillDir, { recursive: true });
  }
  
  // 生成 Markdown 内容
  const content = `---
name: ${repo.name}
full_name: ${repo.full_name}
owner: ${repo.owner}
url: ${repo.url}
language: ${repo.language}
stars: ${repo.stars}
forks: ${repo.forks}
today_stars: ${repo.today_stars || 0}
rank: ${repo.rank}
date: ${trendingData.meta.timestamp.split('T')[0]}
---

# ${repo.full_name}

> ${repo.description || 'No description available'}

## 基本信息

| 项目 | 值 |
|------|-----|
| **语言** | ${repo.language} |
| **星标** | ${repo.stars.toLocaleString()} ⭐ |
| **Fork** | ${repo.forks.toLocaleString()} 🍴 |
| **今日新增** | ${(repo.today_stars || 0).toLocaleString()} 📈 |
| **排名** | #${repo.rank} |

## 仓库链接

[${repo.full_name}](${repo.url})

---

*数据采集时间: ${trendingData.meta.timestamp}*
`;

  // 写入文件
  const filePath = join(skillDir, 'SKILL.md');
  writeFileSync(filePath, content);
}

console.log(`✅ Generated ${trendingData.repos.length} skill files in skills/`);
