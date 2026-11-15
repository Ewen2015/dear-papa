import { archive } from '../lib/archive'
import { href } from '../lib/router'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-rule" aria-hidden="true">
        <span>（.）</span>
      </div>
      <div className="footer-inner">
        <p>
          <strong>Dear Papa · 一年</strong>
          <span>把 {archive.meta.totalLetters} 封信放回 365 天。</span>
        </p>
        <p className="footer-source">
          数据来自《{archive.meta.title}》，{archive.meta.publisher}，{archive.meta.edition}。
          仅作个人阅读与研究；文字版权归原作者与出版方。
        </p>
        <a className="footer-top" href={href('/about')}>
          关于这个项目 →
        </a>
      </div>
    </footer>
  )
}
