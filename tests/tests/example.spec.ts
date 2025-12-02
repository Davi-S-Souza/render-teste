import { test, expect, request } from '@playwright/test';


test('ver se api subiu', async ({ request }) => {
  const response = await request.get('http://localhost:8080/posts');
  console.log(await response.text());
  expect(response.ok()).toBeTruthy();
});

test('Feed carregando', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  await page.locator('#home').click();

  await page.waitForResponse(resp =>
    resp.url().includes('/posts') && resp.status() === 200
  );//se nao ele testa antes do feed carregar

  await expect(page.locator('xpath=//*[@id="main-feed"]/div')).toBeVisible();

  const children = page.locator('xpath=//*[@id="main-feed"]/div/div');
  
  const count = await children.count();

  expect(count).toBeGreaterThan(1);
});

