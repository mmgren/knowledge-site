import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '知识手册',
  description: '个人知识手册（GitHub 为源）',
  // 若仓库名为 knowledge-site 且用 user.github.io/knowledge-site 访问，保持 '/knowledge-site/'
  // 若使用 <user>.github.io 根站点仓库，改为 '/'
  base: '/knowledge-site/',
  themeConfig: {
    nav: [{ text: '指南', link: '/guide/getting-started' }],
    sidebar: [
      {
        text: '指南',
        items: [
          { text: '开始使用', link: '/guide/getting-started' },
          { text: '如何写作', link: '/guide/writing' }
        ]
      }
    ],
    search: { provider: 'local' },
    editLink: {
      pattern: 'https://github.com/REPLACE_ME/knowledge-site/edit/main/docs/:path',
      text: '在 GitHub 上编辑'
    }
  }
})
