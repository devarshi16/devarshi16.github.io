import { visibleArticles, articleUrl } from '../lib/content';
export async function GET(){return new Response(JSON.stringify((await visibleArticles()).map(p=>({title:p.data.title,url:articleUrl(p.id),category:p.data.category,tags:p.data.tags}))),{headers:{'Content-Type':'application/json'}});}
