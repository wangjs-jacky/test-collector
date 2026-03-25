#!/usr/bin/env node

/**
 * GitHub Trending 数据采集脚本
 */

import 'dotenv/config';
import { writeFileSync, existsSync, mkdirSync } from 'fs';

const TRENDING_URL = 'https://github.com/trending';

// 确保 output 目录存在
if (!existsSync('output')) {
  mkdirSync('output', { recursive: true });
  console.log('📁 Created output directory');
}
