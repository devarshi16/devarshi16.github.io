import { visibleArticles, visibleBooks, visibleNews, allTags, articleUrl, newsUrl } from '../lib/content';
export async function GET(){
  const articles=await visibleArticles();const news=await visibleNews();
  const day=(d:Date)=>d.toISOString().slice(0,10);
  const latest=[...articles.map(p=>p.data.updated??p.data.date),...news.map(n=>n.data.date)].sort((a,b)=>b.getTime()-a.getTime())[0];
  const entries:[string,Date?][]=[
    ['/',latest],['/blog/',latest],['/projects/'],['/projects/robotics/'],['/projects/vision/'],['/projects/hardware/'],['/about/'],['/research/'],['/books/'],['/news/',news[0]?.data.date],['/misc/'],['/llms.txt'],
    ...articles.map(p=>[articleUrl(p.id),p.data.updated??p.data.date] as [string,Date]),
    ...(await allTags()).map(t=>[`/tags/${t}/`] as [string]),
    ...(await visibleBooks()).map(b=>[`/books/${b.id}/`] as [string]),
    ...news.map(n=>[newsUrl(n.id),n.data.date] as [string,Date]),
  ];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map(([p,d])=>`<url><loc>https://devarshi16.github.io${p}</loc>${d?`<lastmod>${day(d)}</lastmod>`:''}</url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml'}});
}
