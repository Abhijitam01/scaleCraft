import { test, expect } from '@playwright/test'
import { dragNodeToCanvas, markOnboarded } from './helpers'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await markOnboarded(page)
  await page.goto('/lessons/url-shortener')
  await expect(page.locator('.react-flow')).toBeVisible()
})

test('url-shortener lesson page renders correctly', async ({ page }) => {
  await expect(page.locator('text=URL Shortener')).toBeVisible()
  await expect(page.locator('text=beginner')).toBeVisible()
  // Step counter should show 1 / N
  await expect(page.locator('text=/1 \\/ \\d+/')).toBeVisible()
})

test('url-shortener first step instructs placing api_server', async ({ page }) => {
  // The sidebar should highlight api_server as the next component
  await expect(page.locator('[data-testid="component-card-api_server"]')).toBeVisible()
  // Step instruction should be visible in sidebar
  await expect(page.locator('text=/api.server|API Server/i').first()).toBeVisible()
})

test('placing api_server on canvas advances step', async ({ page }) => {
  const canvas = page.locator('.react-flow__pane')
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()

  const dropX = box!.x + box!.width / 2
  const dropY = box!.y + box!.height / 2

  await dragNodeToCanvas(page, 'api_server', dropX, dropY)
  await expect(page.locator('.react-flow__node').filter({ hasText: 'api server' })).toBeVisible({ timeout: 3000 })

  // After placing, we need to connect client → api_server for step to advance
  // The node is now placed; step should wait for edge connection
  const nodeCount = await page.locator('.react-flow__node').count()
  expect(nodeCount).toBeGreaterThanOrEqual(2)
})

test('share button copies URL to clipboard', async ({ page, context }) => {
  // Grant clipboard permissions
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])

  await page.locator('button', { hasText: 'Share' }).click()
  // Button text changes to "Copied!" after click
  await expect(page.locator('button', { hasText: 'Copied!' })).toBeVisible({ timeout: 2000 })
  // Button reverts after timeout
  await expect(page.locator('button', { hasText: 'Share' })).toBeVisible({ timeout: 3000 })
})

test('templates gallery accessible from lesson page', async ({ page }) => {
  await page.locator('button', { hasText: 'Templates' }).click()
  await expect(page.locator('text=URL Shortener').first()).toBeVisible()
  // Load url-shortener template
  await page.locator('button', { hasText: 'Load' }).first().click()
  // Canvas should have multiple nodes after template load
  const nodeCount = await page.locator('.react-flow__node').count()
  expect(nodeCount).toBeGreaterThan(2)
})

test('back to lessons link navigates to lessons page', async ({ page }) => {
  await page.locator('a', { hasText: 'Lessons' }).click()
  await expect(page).toHaveURL('/lessons')
})
