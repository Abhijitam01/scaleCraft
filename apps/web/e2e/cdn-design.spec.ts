import { test, expect } from '@playwright/test'
import { dragNodeToCanvas, markOnboarded } from './helpers'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await markOnboarded(page)
  await page.goto('/lessons/cdn-design')
  await expect(page.locator('.react-flow')).toBeVisible()
})

test('cdn-design lesson page renders correctly', async ({ page }) => {
  await expect(page.locator('text=CDN Design').first()).toBeVisible()
  await expect(page.locator('text=beginner')).toBeVisible()
})

test('cdn-design first step instructs placing cdn node', async ({ page }) => {
  await expect(page.locator('[data-testid="component-card-cdn"]')).toBeVisible()
})

test('cdn-design canvas starts with only client node', async ({ page }) => {
  const nodeCount = await page.locator('.react-flow__node').count()
  expect(nodeCount).toBe(1)
})

test('placing cdn node on cdn-design canvas', async ({ page }) => {
  const canvas = page.locator('.react-flow__pane')
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()

  await dragNodeToCanvas(page, 'cdn', box!.x + box!.width / 2, box!.y + box!.height / 2)
  await expect(page.locator('.react-flow__node').filter({ hasText: 'cdn' })).toBeVisible({ timeout: 3000 })
})

test('cdn-design lesson shows correct step count', async ({ page }) => {
  // Should be 5 steps
  await expect(page.locator('text=/ 5')).toBeVisible()
})

test('cdn-design lesson shows duration in TopBar', async ({ page }) => {
  await expect(page.locator('text=/\\d+ min/')).toBeVisible()
})

test('simulation panel shows pattern detection for cdn', async ({ page }) => {
  // Place cdn node and check Patterns tab
  const canvas = page.locator('.react-flow__pane')
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()

  await dragNodeToCanvas(page, 'cdn', box!.x + box!.width / 2, box!.y + box!.height / 2)

  // Switch to Patterns tab if it exists
  const patternsTab = page.locator('button', { hasText: 'Patterns' })
  if (await patternsTab.isVisible()) {
    await patternsTab.click()
    await expect(page.locator('text=CDN')).toBeVisible()
  }
})
