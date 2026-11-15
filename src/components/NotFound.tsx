import { href } from '../lib/router'

export function NotFound({ path }: { path: string }) {
  return (
    <section className="container page-head">
      <p className="eyebrow">404 · LOST IN THE MAIL</p>
      <h1 className="page-title">这一页不在信里。</h1>
      <p className="page-lede">
        「{path}」没有对应的日期或月份。也许是信寄丢了，也许只是地址写错了。
      </p>
      <div className="hero-actions">
        <a className="button" href={href('/')}>
          回到一年
        </a>
        <a className="button is-ghost" href={href('/month')}>
          按月找
        </a>
      </div>
    </section>
  )
}
