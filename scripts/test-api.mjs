#!/usr/bin/env node

/**
 * Qwen API 连通性测试脚本
 * 发送 "hello world" 测试请求验证 API Key 是否有效
 */

import 'dotenv/config';

const QWEN_API_KEY = process.env.QWEN_API_KEY;

if (!QWEN_API_KEY) {
  console.error('❌ 错误：未找到 QWEN_API_KEY 环境变量');
  process.exit(1);
}

console.log('🔑 检测到 API Key:', QWEN_API_KEY.slice(0, 15) + '...');
console.log('');

/**
 * 测试 Qwen API 连通性
 */
async function testQwenAPI() {
  const url = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${QWEN_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'qwen-turbo',
      messages: [
        { role: 'user', content: 'hello world' }
      ],
      max_tokens: 50
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data;
}

// 执行测试
console.log('🧪 测试 Qwen API 连通性...');
console.log('   发送测试请求: "hello world"');
console.log('');

testQwenAPI()
  .then(data => {
    console.log('✅ API 连通性测试通过！');
    console.log('');
    console.log('📄 响应数据:');
    console.log(JSON.stringify(data, null, 2));
    console.log('');
    console.log('🎉 API Key 有效，可以继续创建项目');
  })
  .catch(error => {
    console.error('❌ API 测试失败！');
    console.error('');
    console.error('错误信息:', error.message);
    console.error('');
    console.error('可能的原因:');
    console.error('  1. API Key 无效或已过期');
    console.error('  2. 余额不足');
    console.error('  3. 网络连接问题');
    console.error('');
    console.error('请检查你的 API Key 并重试');
    process.exit(1);
  });
