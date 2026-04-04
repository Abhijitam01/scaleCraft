import { test, expect } from '@playwright/test'
import { dragNodeToCanvas, markOnboarded } from './helpers'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await markOnboarded(page)
})

test('navigating between lessons gives each a fresh canvas', async ({ page }) => {
  // Go to url-shortener lesson
  await page.goto('/lessons/url-shortener')
  await expect(page.locator('.react-flow')).toBeVisible()

  const canvas = page.locator('.react-flow__pane')
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()

  // Drop api_server onto url-shortener canvas
  await dragNodeToCanvas(page, 'api_server', box!.x + box!.width / 2, box!.y + box!.height / 2)
  await expect(page.locator('.react-flow__node').filter({ hasText: 'api server' })).toBeVisible({ timeout: 3000 })

  // Navigate to rate-limiter lesson
  await page.goto('/lessons/rate-limiter')
  await expect(page.locator('.react-flow')).toBeVisible()

  // rate-limiter canvas should NOT have the api_server node we placed in url-shortener
  // (only the initial client node should be present)
  const rateNodes = await page.locator('.react-flow__node').count()
  expect(rateNodes).toBe(1)
})

test('canvas state is restored when returning to a lesson', async ({ page }) => {
  // Go to url-shortener and place a node
  await page.goto('/lessons/url-shortener')
  await expect(page.locator('.react-flow')).toBeVisible()

  const canvas = page.locator('.react-flow__pane')
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()

  await dragNodeToCanvas(page, 'api_server', box!.x + box!.width / 2, box!.y + box!.height / 2)
  await expect(page.locator('.react-flow__node').filter({ hasText: 'api server' })).toBeVisible({ timeout: 3000 })

  // Navigate away
  await page.goto('/lessons/rate-limiter')
  await expect(page.locator('.react-flow')).toBeVisible()

  // Navigate back to url-shortener
  await page.goto('/lessons/url-shortener')
  await expect(page.locator('.react-flow')).toBeVisible()

  // api_server node should be restored
  await expect(page.locator('.react-flow__node').filter({ hasText: 'api server' })).toBeVisible({ timeout: 3000 })
})

test('sandbox canvas is isolated from lesson canvases', async ({ page }) => {
  // Place a node in sandbox
  await page.goto('/explore')
  await expect(page.locator('.react-flow')).toBeVisible()

  const canvas = page.locator('.react-flow__pane')
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()

  await dragNodeToCanvas(page, 'database', box!.x + box!.width / 2, box!.y + box!.height / 2)
  await expect(page.locator('.react-flow__node').filter({ hasText: 'database' })).toBeVisible({ timeout: 3000 })

  // Navigate to url-shortener lesson
  await page.goto('/lessons/url-shortener')
  await expect(page.locator('.react-flow')).toBeVisible()

  // Lesson canvas should not have the database node (only client node initially)
  const nodes = await page.locator('.react-flow__node').count()
  expect(nodes).toBe(1)
})

test('TopBar shows lesson title and difficulty on lesson pages', async ({ page }) => {
  await page.goto('/lessons/url-shortener')
  await expect(page.locator('text=URL Shortener')).toBeVisible()
  // Difficulty badge should be visible
  await expect(page.locator('text=beginner')).toBeVisible()
})

test('TopBar shows Sandbox title on sandbox page', async ({ page }) => {
  await page.goto('/explore')
  await expect(page.locator('text=Sandbox')).toBeVisible()
  // No difficulty badge on sandbox
  await expect(page.locator('text=beginner')).not.toBeVisible()
})
