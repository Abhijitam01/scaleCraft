import { test, expect } from '@playwright/test'
import { dragNodeToCanvas, markOnboarded } from './helpers'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await markOnboarded(page)
  await page.goto('/lessons/rate-limiter')
  await expect(page.locator('.react-flow')).toBeVisible()
})

test('rate-limiter lesson page renders correctly', async ({ page }) => {
  await expect(page.locator('text=Rate Limiter')).toBeVisible()
  await expect(page.locator('text=beginner')).toBeVisible()
  await expect(page.locator('text=/1 \\/ \\d+/')).toBeVisible()
})

test('rate-limiter first step instructs placing api_gateway', async ({ page }) => {
  await expect(page.locator('[data-testid="component-card-api_gateway"]')).toBeVisible()
})

test('placing api_gateway advances step in rate-limiter lesson', async ({ page }) => {
  const canvas = page.locator('.react-flow__pane')
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()

  await dragNodeToCanvas(page, 'api_gateway', box!.x + box!.width / 2, box!.y + box!.height / 2)
  await expect(page.locator('.react-flow__node').filter({ hasText: 'api gateway' })).toBeVisible({ timeout: 3000 })
})

test('rate-limiter lesson shows step count', async ({ page }) => {
  // Should show 5-step progress: "1 / 5"
  await expect(page.locator('text=/ 5')).toBeVisible()
})

test('rate-limiter canvas starts with only client node', async ({ page }) => {
  const nodeCount = await page.locator('.react-flow__node').count()
  expect(nodeCount).toBe(1)
  await expect(page.locator('.react-flow__node').filter({ hasText: 'client' })).toBeVisible()
})

test('simulation panel visible on rate-limiter lesson', async ({ page }) => {
  await expect(page.locator('text=Traffic')).toBeVisible()
  // Traffic level options should be present
  await expect(page.locator('text=Low')).toBeVisible()
})
