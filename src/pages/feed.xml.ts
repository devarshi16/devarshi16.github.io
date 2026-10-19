import { technicalArticles, articleUrl } from '../lib/content';
const escape=(s:string)=>s.replace(/[<>&'\"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','\"':'&quot;'}[c]!));
export async function GET(){
  const posts=await technicalArticles();
  const items=posts.map(p=>`<item><title>${escape(p.data.title)}</title><link>https://devarshi16.github.io${articleUrl(p.id)}</link><guid>https://devarshi16.github.io${articleUrl(p.id)}</guid><pubDate>${p.data.date.toUTCString()}</pubDate><description>${escape(p.data.description)}</description></item>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Devarshi’s Technical Journal</title><link>https://devarshi16.github.io/blog/</link><description>Robot learning, vision, hardware, and notes from the workbench.</description>${items}</channel></rss>`,{headers:{'Content-Type':'application/rss+xml'}});
}
