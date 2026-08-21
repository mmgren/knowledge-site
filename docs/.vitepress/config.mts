import { defineConfig } from 'vitepress'
import { guideSidebar } from './sidebar.mts'

export default defineConfig({
  title: '知识手册',
  description: '个人知识手册（GitHub 为源）',
  base: '/knowledge-site/',
  themeConfig: {
    nav: [{ text: '指南', link: '/guide/getting-started' }],
    sidebar: [
      {
        text: '指南',
        items: guideSidebar
      }
    ],
    search: { provider: 'local' },
    editLink: {
      pattern: 'https://github.com/mmgren/knowledge-site/edit/main/docs/:path',
      text: '在 GitHub 上编辑'
    }
  }
})
