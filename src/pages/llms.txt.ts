// /llms.txt: a plain-Markdown summary for LLM crawlers and answer engines (https://llmstxt.org).
import { technicalArticles, visibleNews, visibleBooks, articleUrl, newsUrl } from '../lib/content';
import { career } from '../data/career';
import { SITE, identity } from '../data/identity';
export async function GET(){
  const posts=await technicalArticles();const news=(await visibleNews()).slice(0,5);const books=await visibleBooks();
  const line=(title:string,url:string,desc?:string)=>`- [${title}](${url})${desc?`: ${desc.replace(/\s+/g,' ').trim()}`:''}`;
  const body=[
    `# ${identity.name}`,'',`> ${identity.summary}`,'',
    '## Key facts','',
    `- Name: ${identity.name}`,`- Role: ${identity.jobTitle} at ${identity.employer}`,`- Location: ${identity.location}`,
    `- Focus: ${identity.knowsAbout.join(', ')}`,
    `- Profiles: ${identity.sameAs.join(', ')}`,`- CV: ${SITE}/assets/Devarshi_Aggarwal_CV.pdf`,'',
    '## Experience','',...[...career].reverse().map(c=>`- ${c.name}, ${c.role} (${c.dates}): ${c.description}`),'',
    '## Education','',...identity.education.map(e=>`- ${e.name}: ${e.detail}`),'',
    '## Publications','',...identity.publications.map(p=>line(p.name,p.url,p.venue)),'',
    '## Pages','',
    line('About',`${SITE}/about/`,'Background, career and contact'),line('Robotics work',`${SITE}/projects/robotics/`),line('Computer vision work',`${SITE}/projects/vision/`),
    line('Hardware projects',`${SITE}/projects/hardware/`),line('Research',`${SITE}/research/`),line('Technical journal',`${SITE}/blog/`),line('News',`${SITE}/news/`),'',
    '## Technical writing','',...posts.map(p=>line(p.data.title,`${SITE}${articleUrl(p.id)}`,p.data.description)),'',
    ...(news.length?['## Recent news','',...news.map(n=>line(n.data.title,`${SITE}${newsUrl(n.id)}`,`${n.data.date.toISOString().slice(0,10)}. ${n.data.summary}`)),'']:[]),
    ...(books.length?['## Optional','',...books.map(b=>line(`${b.data.title} (book)`,`${SITE}/books/${b.id}/`,b.data.description))]:[]),
  ].join('\n');
  return new Response(body+'\n',{headers:{'Content-Type':'text/plain; charset=utf-8'}});
}
