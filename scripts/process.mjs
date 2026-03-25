#!/usr/bin/env node

/**
 * 数据处理脚本：调用 Qwen AI 生成仓库分析报告
 */

import 'dotenv/config';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const QWEN_API_KEY = process.env.QWEN_API_KEY;
const QWEN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

if (!QWEN_API_KEY) {
  console.error('❌ 错误：未找到 QWEN_API_KEY 环境变量');
  process.exit(1);
}

// 确保 trending 目录存在
if (!existsSync('trending')) {
  mkdirSync('trending', { recursive: true });
  console.log('📁 Created trending directory');
}

// 读取采集的数据
const trendingData = JSON.parse(readFileSync('output/trending.json', 'utf-8'));
console.log(`📊 Processing ${trendingData.repos.length} repos with Qwen AI...`);

/**
 * 调用 Qwen API 生成仓库分析
 */
async function analyzeRepo(repo) {
  const prompt = `你是一个 GitHub 项目分析专家。请分析以下 GitHub 仓库并生成简洁的分析报告。

## 仓库信息

- **名称**: ${repo.full_name}
- **描述**: ${repo.description || '暂无描述'}
- **语言**: ${repo.language}
- **星标数**: ${repo.stars.toLocaleString()}
- **今日新增**: ${(repo.today_stars || 0).toLocaleString()} stars

## 分析要求

请从以下维度进行分析（直接输出内容，不要标题）：

1. **项目定位**（50-100字）- 这个项目是做什么的？解决什么问题？

2. **核心功能**（3-5 个要点）

3. **技术特点**（50-100字）

4. **适用场景**（3-5 个场景）

5. **推荐理由**（50-100字）

请用 Markdown 格式输出，简洁明了，直接开始内容，不要有"AI 分析"之类的标题。`;

  const response = await fetch(QWEN_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${QWEN_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'qwen-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Qwen API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * 生成 Markdown 文件
 */
function generateMarkdown(repo, analysis) {
  const date = new Date().toISOString().split('T')[0];
  
  return `---
name: ${repo.name}
full_name: ${repo.full_name}
owner: ${repo.owner}
url: ${repo.url}
language: ${repo.language}
stars: ${repo.stars}
forks: ${repo.forks}
today_stars: ${repo.today_stars || 0}
rank: ${repo.rank}
date: ${date}
text: |
${analysis.split('\n').map(line => '  ' + line).join('\n')}
---

# ${repo.full_name}

${repo.description || '暂无描述'}

${analysis}

---

> 采集时间: ${date} | 排名: #${repo.rank} | 今日新增: ${(repo.today_stars || 0).toLocaleString()} ⭐
`;
}

// 处理每个仓库
const results = [];
for (let i = 0; i < trendingData.repos.length; i++) {
  const repo = trendingData.repos[i];
  const dirName = repo.full_name.replace('/', '-');
  const trendingDir = join('trending', dirName);

  console.log(`\n[${i + 1}/${trendingData.repos.length}] 处理 ${repo.full_name}...`);

  try {
    if (!existsSync(trendingDir)) {
      mkdirSync(trendingDir, { recursive: true });
    }

    console.log(`   🤖 调用 Qwen AI 分析...`);
    const analysis = await analyzeRepo(repo);
    const markdown = generateMarkdown(repo, analysis);
    writeFileSync(join(trendingDir, 'README.md'), markdown);

    console.log(`   ✅ 完成`);
    results.push({ repo: repo.full_name, status: 'success' });

    if (i < trendingData.repos.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error(`   ❌ 失败: ${error.message}`);
    results.push({ repo: repo.full_name, status: 'failed', error: error.message });
  }
}

console.log(`\n📊 处理完成！成功: ${results.filter(r => r.status === 'success').length}, 失败: ${results.filter(r => r.status === 'failed').length}`);
