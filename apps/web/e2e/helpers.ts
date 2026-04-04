import type { Page } from '@playwright/test'

/**
 * Simulate HTML5 drag-and-drop of a component card onto the ReactFlow canvas.
 * Playwright's built-in dragTo does not trigger HTML5 DnD events reliably,
 * so we dispatch them via page.evaluate.
 */
export async function dragNodeToCanvas(
  page: Page,
  nodeType: string,
  dropX: number,
  dropY: number,
) {
  await page.evaluate(
    ({ nodeType, dropX, dropY }) => {
      const pane = document.querySelector('.react-flow__pane') as HTMLElement
      if (!pane) throw new Error('ReactFlow pane not found')

      const dt = new DataTransfer()
      dt.setData('nodeType', nodeType)

      pane.dispatchEvent(new DragEvent('dragover', { dataTransfer: dt, bubbles: true, cancelable: true, clientX: dropX, clientY: dropY }))
      pane.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true, clientX: dropX, clientY: dropY }))
    },
    { nodeType, dropX, dropY },
  )
}

/**
 * Clear the onboarding flag and any lesson progress so each test starts clean.
 */
export async function clearStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('scalecraft_onboarded')
    // Remove all lesson progress keys
    Object.keys(localStorage)
      .filter(k => k.startsWith('scalecraft_'))
      .forEach(k => localStorage.removeItem(k))
  })
}

/**
 * Mark onboarding as done so tests that don't test onboarding skip it.
 */
export async function markOnboarded(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem('scalecraft_onboarded', '1')
  })
}
