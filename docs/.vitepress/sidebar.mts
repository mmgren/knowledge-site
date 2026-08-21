import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export type SidebarItem = { text: string; link: string }

/** 纯函数：便于单测。只接受 guide 下的 .md，按文件名排序。 */
export function buildGuideSidebar(
  filePaths: string[],
  titles: Record<string, string>
): SidebarItem[] {
  return filePaths
    .filter((f) => /(?:^|\/)guide\/[^/]+\.md$/.test(f.replace(/\\/g, '/')))
    .sort((a, b) => a.localeCompare(b))
    .map((f) => {
      const norm = f.replace(/\\/g, '/')
      const base = path.posix.basename(norm, '.md')
      const link = `/guide/${base}`
      return { text: titles[norm] ?? titles[f] ?? base, link }
    })
}

function titleFromFile(absPath: string): string {
  const raw = fs.readFileSync(absPath, 'utf8')
  const m = raw.match(/^---[\s\S]*?^title:\s*(.+)$/m)
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : path.basename(absPath, '.md')
}

/** 构建时扫描真实磁盘上的 docs/guide */
export function scanGuideSidebar(docsRoot: string): SidebarItem[] {
  const guideDir = path.join(docsRoot, 'guide')
  if (!fs.existsSync(guideDir)) return []
  const names = fs.readdirSync(guideDir).filter((n) => n.endsWith('.md'))
  const filePaths = names.map((n) => path.join('docs/guide', n))
  const titles: Record<string, string> = {}
  for (const n of names) {
    const abs = path.join(guideDir, n)
    titles[path.join('docs/guide', n)] = titleFromFile(abs)
  }
  return buildGuideSidebar(filePaths, titles)
}

const here = path.dirname(fileURLToPath(import.meta.url))
export const guideSidebar = scanGuideSidebar(path.resolve(here, '..'))
