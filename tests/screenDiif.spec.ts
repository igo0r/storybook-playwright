import { test, expect } from '@playwright/test';

test('Check screenshots of existing storybooks', async ({ page }) => {
  let storybookConfig;
  await expect(async () => {
    storybookConfig = await (await page.request.get('index.json')).json();
    await expect(storybookConfig).toEqual(expect.objectContaining({entries: expect.any(Object)}))
  }).toPass();
  const storybooks = Object.keys(storybookConfig.entries).filter(entry => storybookConfig.entries[entry].type === 'story')
  const errors = [];
  for(let story of storybooks) {
    const url = `iframe.html?globals=&args=&id=${story}&viewMode=story`;
    await expect.poll(async () => {
      const response = await page.request.get(url);
      return response.status()
    }).toBe(200);
    await page.goto(url);
    await expect(page.locator('#storybook-root')).toBeVisible();
    await expect(page.locator('.sb-preparing-story .sb-loader')).not.toBeVisible();
    await page.waitForTimeout(1000);
    try{
      await expect(page).toHaveScreenshot(`${story}.png`, {fullPage: true});
    } catch(e) {
      errors.push(e.message);
    }
  }
  if(errors.length > 0) {
    const errorMessage = `${errors.join('\n')}`;
    throw new Error(errorMessage);
  }
});
