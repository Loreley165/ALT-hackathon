import { test, expect } from '@playwright/test';
import { createStore, STORAGE_KEY } from '../src/learning.js';

const moduleFor = (page, name) => page.locator('.alt-module').filter({ has: page.locator('.alt-module__name', { hasText: name }) });
const openModule = async (page,name) => { const module = moduleFor(page,name); await module.locator('.alt-badge-button').click(); return module; };
test('original snapshots and verification are preserved', async ({ page }) => {
  await page.goto('/');
  await expect(moduleFor(page,'POS Independent').locator('.alt-module__status')).toHaveText('Ready for Verification');
  await expect(moduleFor(page,'Dietary & Allergens').locator('.alt-module__status')).toHaveText('Practising');
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow','2');
  await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('button',{name:'Profile',exact:true}).click();
  await page.getByText('Explore demo states').click();
  await page.getByRole('button',{name:'Current state',exact:true}).click();
  await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('button',{name:'Passport',exact:true}).click();
  await expect(moduleFor(page,'POS Independent').locator('.alt-module__status')).toHaveText('Practising');
  await expect(moduleFor(page,'Dietary & Allergens').locator('.alt-module__status')).toHaveText('Needs Support');
  await expect(page.getByRole('button',{name:'Request Supervisor Verification'})).toBeDisabled();
  await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('button',{name:'Profile',exact:true}).click();
  await page.getByText('Explore demo states').click();
  await page.getByRole('button',{name:'Updated state',exact:true}).click();
  await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('button',{name:'Passport',exact:true}).click();
  await page.getByRole('button',{name:'Request Supervisor Verification'}).click();
  await expect(page.getByRole('button',{name:'Sending Request…'})).toBeDisabled();
  await expect(page.getByRole('button',{name:'Verification Requested'})).toBeDisabled();
  await page.reload();
  await expect(page.getByRole('button',{name:'Verification Requested'})).toBeDisabled();
});

test('learning completion persists, turns olive, generates and downloads a today-only poster', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'canShare', { value: () => false, configurable: true }));
  await page.goto('/');
  let module = await openModule(page, 'Dietary & Allergens');
  await expect(module).toHaveClass(/alt-module--pending/);
  await module.getByRole('button',{name:'Mark complete',exact:true}).first().click();
  await expect(module.locator('.alt-task')).toHaveCount(1);
  await expect(module.locator('.alt-task__heading')).toContainText('Communicate & confirm');
  await expect(module.locator('.alt-task-overview')).toContainText('2/3 complete');
  await expect(module.locator('.alt-badge')).toHaveAttribute('style', /67%/);
  await page.reload();
  module = await openModule(page, 'Dietary & Allergens');
  await expect(module.locator('.alt-task')).toHaveCount(1);
  await expect(module.locator('.alt-task__heading')).toContainText('Communicate & confirm');
  await expect(module.locator('.alt-task-overview')).toContainText('2/3 complete');
  await module.getByRole('button',{name:'Mark complete',exact:true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const image = page.getByRole('img',{name:/Today's learning poster/});
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute('alt', /Alex Morgan, Level 2.*2 completed or reviewed tasks: Check with the right person, Communicate & confirm/);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link',{name:'Download PNG'}).click();
  const download = await downloadPromise; await download.saveAs('screenshots/today-poster.png');
  expect(download.suggestedFilename()).toBe('ALT-today.png');
  await page.getByRole('button',{name:'Share poster',exact:true}).click();
  await expect(page.getByRole('status').filter({hasText:'Image sharing is not available'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(moduleFor(page,'Dietary & Allergens')).toHaveClass(/alt-module--complete/);
  await expect(moduleFor(page,'Dietary & Allergens').locator('.alt-module__status')).toHaveText('Ready for Verification');
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow','2');
});

test('overdue steps turn light red; completing review resets their monthly cycle', async ({ page }) => {
  const data = createStore();
  const old = new Date(); old.setMonth(old.getMonth()-2);
  data.scenarios.updated.records['guest/welcome'] = {completedAt:old.toISOString()};
  await page.addInitScript(({key,data}) => localStorage.setItem(key,JSON.stringify(data)), {key:STORAGE_KEY,data});
  await page.goto('/');
  const module = await openModule(page,'Guest Interaction');
  await expect(module).toHaveClass(/alt-module--review/);
  await expect(module.locator('.alt-task--review')).toHaveCount(1);
  await module.getByRole('button',{name:'Mark reviewed'}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button',{name:'Close poster'}).click();
  await expect(module).toHaveClass(/alt-module--complete/);
  const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), STORAGE_KEY);
  expect(stored.scenarios.updated.records['guest/welcome'].reviewedAt).toBeTruthy();
  expect(stored.scenarios.updated.activities[0].kind).toBe('review');
});

test('profile name and photo persist and appear on passport and poster', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('button',{name:'Profile',exact:true}).click();
  await page.getByLabel('Your name',{exact:true}).fill('Jamie Chen');
  await page.getByLabel('Upload avatar').setInputFiles('public/icons/icon-192.png');
  await expect(page.getByRole('img',{name:"Alex Morgan's avatar"}).first()).toBeVisible();
  await page.getByRole('button',{name:'Save profile'}).click();
  await page.reload();
  await expect(page.locator('.alt-passport__identity')).toContainText('Jamie Chen');
  await expect(page.locator('.alt-passport__avatar img')).toBeVisible();
  const module = await openModule(page,'Dietary & Allergens');
  await module.getByRole('button',{name:'Mark complete',exact:true}).first().click();
  await page.getByRole('button',{name:'Close skill tasks'}).click();
  await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('button',{name:/^Today/}).click();
  await page.getByRole('button',{name:'Create today’s poster'}).click();
  await expect(page.getByRole('img',{name:/Today's learning poster for Jamie Chen/})).toBeVisible();
});

test('mobile navigation and keyboard badge dialogs work without horizontal overflow', async ({ page }) => {
  for (const width of [320,390]) {
    await page.setViewportSize({width,height:844}); await page.goto('/');
    const summary = moduleFor(page,'Dietary & Allergens').locator('.alt-badge-button');
    await summary.focus(); await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog',{name:'Dietary & Allergens'})).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(summary).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('button',{name:/^Today/}).click();
    await expect(page.getByRole('heading',{name:'Your next chapter starts here.'})).toBeVisible();
    await expect(page.getByRole('button',{name:'Create today’s poster'})).toBeDisabled();
    await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('button',{name:'Profile',exact:true}).click();
    await expect(page.getByLabel('Your name',{exact:true})).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('button',{name:'Passport',exact:true}).click();
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(844);
  await page.screenshot({path:'screenshots/mobile-app.png',fullPage:true});
  await openModule(page,'Dietary & Allergens');
  const sheet = page.getByRole('dialog',{name:'Dietary & Allergens'});
  const box = await sheet.boundingBox();
  expect(box.width).toBeLessThanOrEqual(326);
  expect(box.height).toBeLessThanOrEqual(844 * .68 + 1);
  await expect(sheet.locator('.alt-task')).toHaveCount(1);
  await expect(sheet.locator('.alt-task-overview')).toContainText('1/3 complete');
  await page.screenshot({path:'screenshots/skill-dialog.png'});
  await page.getByRole('button',{name:'Close skill tasks'}).click();
  await openModule(page,'Guest Interaction');
  await expect(page.getByRole('heading',{name:'All steps complete.'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Mark complete',exact:true})).toHaveCount(0);
});

test('PWA manifest, icons and service worker support offline reload', async ({ page, context }) => {
  await page.goto('/');
  const manifest = await (await page.request.get('/manifest.webmanifest')).json();
  expect(manifest.display).toBe('standalone');
  for (const icon of manifest.icons) expect((await page.request.get(icon.src)).ok()).toBe(true);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true})); });
  await context.setOffline(true); await page.reload();
  await expect(page.getByRole('heading',{name:'Skill Passport.'})).toBeVisible();
  await openModule(page,'Dietary & Allergens');
  await expect(page.getByRole('button',{name:'Mark complete',exact:true})).toHaveCount(1);
  await context.setOffline(false);
});

test('desktop has no runtime errors and shows the modular passport', async ({ page }) => {
  const errors = []; page.on('pageerror',error => errors.push(error.message));
  await page.setViewportSize({width:1440,height:1150}); await page.goto('/');
  await expect(page.locator('.alt-module')).toHaveCount(4);
  await expect(page.locator('.demo-heading')).toBeHidden();
  await expect(page.locator('.demo-nav')).toBeHidden();
  await expect(page.locator('.alt-shield-art')).toHaveCount(4);
  expect(await page.locator('.alt-module').first().evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
  await expect(page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('button')).toHaveCount(3);
  await page.screenshot({path:'screenshots/desktop-app.png',fullPage:true});
  expect(errors).toEqual([]);
});
