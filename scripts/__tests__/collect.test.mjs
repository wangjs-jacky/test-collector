/**
 * collect.mjs 测试用例
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseRepoArticle, parseTrendingPage } from '../collect.mjs';

describe('parseRepoArticle', () => {
  it('should parse a valid repo article', () => {
    const html = `
      <h2 class="h3 lh-condensed">
        <a href="/vercel/next.js">
          <span class="text-normal">vercel /</span>
          next.js
        </a>
      </h2>
      <p class="col-9 color-fg-muted my-1 pr-4">The React Framework</p>
      <span itemprop="programmingLanguage">TypeScript</span>
      <a href="/vercel/next.js/stargazers"><svg></svg>120,000</a>
      <a href="/vercel/next.js/forks"><svg></svg>25,000</a>
      <span>500 stars today</span>
    `;

    const repo = parseRepoArticle(html);

    assert.strictEqual(repo.full_name, 'vercel/next.js');
    assert.strictEqual(repo.language, 'TypeScript');
    assert.strictEqual(repo.stars, 120000);
    assert.strictEqual(repo.forks, 25000);
    assert.strictEqual(repo.today_stars, 500);
  });

  it('should handle missing fields', () => {
    const html = `<h2><a href="/test/repo">test</a></h2>`;
    const repo = parseRepoArticle(html);

    assert.strictEqual(repo.full_name, 'test/repo');
    assert.strictEqual(repo.language, 'Unknown');
    assert.strictEqual(repo.stars, 0);
  });
});

describe('parseTrendingPage', () => {
  it('should parse multiple repos', () => {
    const html = `
      <article class="Box-row">
        <h2><a href="/vercel/next.js">next.js</a></h2>
      </article>
      <article class="Box-row">
        <h2><a href="/facebook/react">react</a></h2>
      </article>
    `;

    const repos = parseTrendingPage(html);
    assert.strictEqual(repos.length, 2);
    assert.strictEqual(repos[0].name, 'next.js');
    assert.strictEqual(repos[1].name, 'react');
  });

  it('should return empty array for no matches', () => {
    const repos = parseTrendingPage('<html>No repos</html>');
    assert.strictEqual(repos.length, 0);
  });
});
