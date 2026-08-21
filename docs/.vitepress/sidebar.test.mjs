import test from 'node:test'
import assert from 'node:assert/strict'
import { buildGuideSidebar } from './sidebar.mts'

test('buildGuideSidebar maps guide markdown files to sidebar items', () => {
  const files = [
    'docs/guide/getting-started.md',
    'docs/guide/writing.md',
    'docs/guide/notes.txt',
    'docs/index.md'
  ]
  const items = buildGuideSidebar(files, {
    'docs/guide/getting-started.md': '开始使用',
    'docs/guide/writing.md': '如何写作'
  })
  assert.deepEqual(items, [
    { text: '开始使用', link: '/guide/getting-started' },
    { text: '如何写作', link: '/guide/writing' }
  ])
})
