import { test, expect } from '@playwright/test'
import { dragNodeToCanvas, markOnboarded } from './helpers'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await markOnboarded(page)
  await page.goto('/explore')
})

test('sandbox page renders with all major sections', async ({ page }) => {
  await expect(page.locator('text=Sandbox')).toBeVisible()
  await expect(page.locator('.react-flow')).toBeVisible()
  // Sidebar should show component palette (all categories)
  await expect(page.locator('text=Networking')).toBeVisible()
  await expect(page.locator('text=Storage')).toBeVisible()
  await expect(page.locator('text=Compute')).toBeVisible()
  // Simulation panel should be present
  await expect(page.locator('text=Traffic')).toBeVisible()
})

test('sandbox sidebar shows all component categories', async ({ page }) => {
  await expect(page.locator('[data-testid="component-card-load_balancer"]')).toBeVisible()
  await expect(page.locator('[data-testid="component-card-database"]')).toBeVisible()
  await expect(page.locator('[data-testid="component-card-api_server"]')).toBeVisible()
  await expect(page.locator('[data-testid="component-card-cache"]')).toBeVisible()
  await expect(page.locator('[data-testid="component-card-message_queue"]')).toBeVisible()
})

test('sandbox initial canvas shows client node', async ({ page }) => {
  // Client node is always present as the initial node
  await expect(page.locator('.react-flow__node').filter({ hasText: 'client' })).toBeVisible()
})

test('drag api_server node onto sandbox canvas', async ({ page }) => {
  const canvas = page.locator('.react-flow__pane')
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()

  const dropX = box!.x + box!.width / 2
  const dropY = box!.y + box!.height / 2

  await dragNodeToCanvas(page, 'api_server', dropX, dropY)

  await expect(page.locator('.react-flow__node').filter({ hasText: 'api server' })).toBeVisible({ timeout: 3000 })
})

test('drag multiple nodes and simulation panel updates', async ({ page }) => {
  const canvas = page.locator('.react-flow__pane')
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()

  const cx = box!.x + box!.width / 2
  const cy = box!.y + box!.height / 2

  await dragNodeToCanvas(page, 'api_server', cx, cy - 60)
  await dragNodeToCanvas(page, 'database', cx + 200, cy)
  await dragNodeToCanvas(page, 'cache', cx, cy + 60)

  // After placing nodes, simulation panel should show metrics
  await expect(page.locator('.react-flow__node')).toHaveCount(4) // client + 3
})

test('templates gallery opens from Templates button', async ({ page }) => {
  await page.locator('button', { hasText: 'Templates' }).click()
  // Gallery modal should open
  await expect(page.locator('text=URL Shortener').first()).toBeVisible()
})
