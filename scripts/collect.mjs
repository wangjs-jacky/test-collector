#!/usr/bin/env node

/**
 * GitHub Trending 数据采集脚本
 */

import 'dotenv/config';
import { writeFileSync } from 'fs';

const TRENDING_URL = 'https://github.com/trending';

/**
 * 抓取 GitHub Trending 页面
 */
export async function fetchTrendingPage(language = '', since = 'daily') {
  const params = new URLSearchParams();
  if (language) params.append('language', language);
  if (since !== 'daily') params.append('since', since);

  const url = `${TRENDING_URL}${params.toString() ? '?' + params.toString() : ''}`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'text/html,application/xhtml+xml',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.text();
}

/**
 * 解析仓库条目
 */
export function parseRepoArticle(html) {
  const repo = {};

  // 提取仓库路径
  const hrefMatch = html.match(/<h2[^>]*>.*?<a[^>]*href="\/([^"]+)"[^>]*>/s);
  if (hrefMatch) {
    repo.full_name = hrefMatch[1];
    repo.owner = hrefMatch[1].split('/')[0];
    repo.name = hrefMatch[1].split('/')[1];
    repo.url = `https://github.com/${hrefMatch[1]}`;
  }

  // 提取描述
  const descMatch = html.match(/<p[^>]*class="[^"]*col-9[^"]*"[^>]*>([\s\S]*?)<\/p>/);
  if (descMatch) {
    repo.description = descMatch[1].replace(/<[^>]+>/g, '').trim();
  }

  // 提取语言
  const langMatch = html.match(/<span[^>]*itemprop="programmingLanguage"[^>]*>([^<]+)<\/span>/);
  repo.language = langMatch ? langMatch[1].trim() : 'Unknown';

  // 提取星标数
  const starsMatch = html.match(/<a[^>]*href="\/[^"]+\/stargazers"[^>]*>[\s\S]*?<\/svg>\s*([\d,]+)/);
  repo.stars = starsMatch ? parseInt(starsMatch[1].replace(/,/g, '')) : 0;

  // 提取 Fork 数
  const forksMatch = html.match(/<a[^>]*href="\/[^"]+\/forks"[^>]*>[\s\S]*?<\/svg>\s*([\d,]+)/);
  repo.forks = forksMatch ? parseInt(forksMatch[1].replace(/,/g, '')) : 0;

  // 提取今日星标数
  const todayMatch = html.match(/([\d,]+)\s*stars\s*today/);
  repo.today_stars = todayMatch ? parseInt(todayMatch[1].replace(/,/g, '')) : 0;

  return repo;
}

/**
 * 解析 GitHub Trending 页面
 */
export function parseTrendingPage(html) {
  const repos = [];
  const articleRegex = /<article[^>]*class="[^"]*Box-row[^"]*"[^>]*>([\s\S]*?)<\/article>/g;
  let match;
  let rank = 1;

  while ((match = articleRegex.exec(html)) !== null) {
    try {
      const repo = parseRepoArticle(match[1]);
      repo.rank = rank++;
      repos.push(repo);
    } catch (e) {
      console.error(`Failed to parse repo: ${e.message}`);
    }
  }

  return repos;
}

/**
 * 主函数
 */
export async function collectTrending(options = {}) {
  const { language = '', since = 'daily' } = options;
  const timestamp = new Date().toISOString();

  console.log(`📊 Fetching GitHub Trending...`);

  const html = await fetchTrendingPage(language, since);
  const repos = parseTrendingPage(html);

  const result = {
    meta: {
      timestamp,
      language: language || 'all',
      since,
      count: repos.length,
      source: TRENDING_URL
    },
    repos
  };

  // 保存到文件
  const outputPath = 'output/trending.json';
  writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`✅ Saved ${repos.length} repos to ${outputPath}`);

  return result;
}

// CLI 入口
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  const args = process.argv.slice(2);
  collectTrending({ language: args[0] || '', since: args[1] || 'daily' })
    .catch(err => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}
