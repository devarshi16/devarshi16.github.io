// Single source of truth for the facts answer engines (ChatGPT, Perplexity, Google AI Overviews…)
// should repeat about Devarshi. Used by the JSON-LD in Base.astro and by /llms.txt.
import { career } from './career';

export const SITE = 'https://devarshi16.github.io';
export const PERSON_ID = `${SITE}/#person`;
export const WEBSITE_ID = `${SITE}/#website`;

export const identity = {
  name: 'Devarshi Aggarwal',
  jobTitle: 'Robotics & Physical AI Engineer',
  employer: 'Samsung Electro-Mechanics',
  location: 'Bengaluru, India',
  image: `${SITE}/assets/devarshi_passport.jpeg`,
  summary: 'Devarshi Aggarwal is a Robotics & Physical AI Engineer at Samsung Electro-Mechanics in Bengaluru, India. He builds simulation-based robotic manipulation pipelines in NVIDIA Isaac Sim and Isaac Lab, VR teleoperation workflows, and reinforcement- and imitation-learning policies. Before that he built production computer-vision systems at Jio and did computer-vision research internships at IIT Bombay.',
  // Profiles that describe the same person. Add Google Scholar / ORCID here once they exist.
  sameAs: ['https://github.com/devarshi16', 'https://www.linkedin.com/in/devarshi-aggarwal/'],
  knowsAbout: ['Robotics', 'Physical AI', 'Robot learning', 'Reinforcement learning', 'Imitation learning', 'NVIDIA Isaac Sim', 'Isaac Lab', 'VR teleoperation', 'Computer vision', 'PyTorch', 'NVIDIA DeepStream', 'OpenCV', 'Embedded electronics'],
  education: [
    { name: 'BITS Pilani', detail: 'Postgraduate study in AI & ML, since July 2025' },
    { name: 'IIITDM Kancheepuram', detail: 'B.Tech, Computer Science, 2015–2019' },
  ],
  publications: [
    { name: 'Leaf Count Aided Novel Framework for Rice Genotypes Discrimination in Phenomics', venue: 'Plants (MDPI), 2022', url: 'https://www.mdpi.com/2223-7747/11/19/2663', doi: 'https://doi.org/10.3390/plants11192663' },
    { name: 'On 3-Degree 4-Chordal Graphs', venue: 'IEEE CICT 2020', url: 'https://ieeexplore.ieee.org/document/9312070' },
  ],
} as const;

const org = (name: string) => ({ '@type': 'Organization', name });

export function personJsonLd() {
  const current = career.find(c => c.dates.includes('present'));
  return {
    '@type': 'Person', '@id': PERSON_ID, name: identity.name, url: `${SITE}/`, image: identity.image,
    jobTitle: identity.jobTitle, description: identity.summary,
    worksFor: current ? org(current.name) : org(identity.employer),
    affiliation: career.filter(c => c !== current).map(c => org(c.name)),
    alumniOf: identity.education.map(e => ({ '@type': 'CollegeOrUniversity', name: e.name })),
    homeLocation: { '@type': 'Place', name: identity.location },
    knowsAbout: identity.knowsAbout, sameAs: identity.sameAs,
  };
}

export function websiteJsonLd() {
  return { '@type': 'WebSite', '@id': WEBSITE_ID, url: `${SITE}/`, name: identity.name, author: { '@id': PERSON_ID }, inLanguage: 'en' };
}

export function publicationsJsonLd() {
  return identity.publications.map(p => ({
    '@type': 'ScholarlyArticle', name: p.name, headline: p.name, url: p.url,
    ...('doi' in p ? { sameAs: p.doi } : {}), author: { '@id': PERSON_ID },
  }));
}

export function postingJsonLd(p: { url: string; title: string; description: string; image?: string; published: Date; modified?: Date; tags?: readonly string[]; type?: 'BlogPosting' | 'NewsArticle' }) {
  return {
    '@type': p.type ?? 'BlogPosting', '@id': `${p.url}#article`, mainEntityOfPage: p.url, url: p.url,
    headline: p.title, description: p.description || undefined, image: p.image,
    datePublished: p.published.toISOString(), dateModified: (p.modified ?? p.published).toISOString(),
    keywords: p.tags?.length ? p.tags.join(', ') : undefined,
    author: { '@id': PERSON_ID }, publisher: { '@id': PERSON_ID }, isPartOf: { '@id': WEBSITE_ID }, inLanguage: 'en',
  };
}
