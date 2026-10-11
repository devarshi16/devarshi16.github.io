(() => {
  const apply=theme=>document.documentElement.dataset.theme=theme==='dark'?'dark':'light';
  try{apply(window.parent!==window?parent.document.documentElement.dataset.theme:localStorage.getItem('portfolio-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));}catch{apply('light');}
  window.addEventListener('message',event=>{if(event.origin===location.origin&&event.source===parent&&event.data?.type==='portfolio:theme'){apply(event.data.theme);document.dispatchEvent(new CustomEvent('portfolio:theme'));}});
  const sendSize=()=>{if(parent!==window)parent.postMessage({type:'portfolio:demo-size',height:Math.ceil(document.querySelector('main')?.getBoundingClientRect().height??document.body.scrollHeight)+4},location.origin);};
  const observer=new ResizeObserver(sendSize);observer.observe(document.querySelector('main')||document.body);
  if(parent!==window)parent.postMessage({type:'portfolio:demo-ready'},location.origin);
  sendSize();
  window.addEventListener('pagehide',event=>{if(!event.persisted)observer.disconnect();});
})();
