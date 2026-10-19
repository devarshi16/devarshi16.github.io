import test from 'node:test';
import assert from 'node:assert/strict';
import { latestGames, fetchSteamProfile } from '../src/lib/steam';

test('latest Steam games are the three most recently played, newest first',()=>{
  const games=[
    {appid:1,name:'Old',rtime_last_played:100,playtime_forever:60},
    {appid:2,name:'Newest',rtime_last_played:400,playtime_forever:90},
    {appid:3,name:'Never played',rtime_last_played:0},
    {appid:4,name:'Middle',rtime_last_played:300},
    {appid:5,name:'Third',rtime_last_played:200},
  ];
  const recent=latestGames(games);
  assert.deepEqual(recent.map(g=>g.title),['Newest','Middle','Third']);
  assert.equal(recent[0].hours,1.5);
  assert.equal(recent[0].url,'https://store.steampowered.com/app/2/');
});
test('without Steam credentials the build skips the API and falls back',async()=>{
  assert.equal(await fetchSteamProfile({}),null);
});
test('Steam profile combines the player summary with the latest games',async()=>{
  const original=globalThis.fetch;
  globalThis.fetch=(async(url:string)=>new Response(JSON.stringify(String(url).includes('GetOwnedGames')
    ?{response:{games:[{appid:7,name:'Game',rtime_last_played:1760000000,playtime_forever:120}]}}
    :{response:{players:[{personaname:'MissFortune',profileurl:'https://steamcommunity.com/id/example/'}]}}))) as typeof fetch;
  try{
    const profile=await fetchSteamProfile({STEAM_API_KEY:'k',STEAM_ID:'1'});
    assert.equal(profile?.persona,'MissFortune');assert.equal(profile?.profileUrl,'https://steamcommunity.com/id/example/');
    assert.deepEqual(profile?.recent.map(g=>g.title),['Game']);
  }finally{globalThis.fetch=original;}
});
test('a custom profile name is resolved to the numeric Steam id',async()=>{
  const original=globalThis.fetch;const urls:string[]=[];
  globalThis.fetch=(async(url:string)=>{urls.push(String(url));return new Response(JSON.stringify(String(url).includes('ResolveVanityURL')
    ?{response:{success:1,steamid:'76561198000000000'}}:{response:{}}));}) as typeof fetch;
  try{
    await fetchSteamProfile({STEAM_API_KEY:'k',STEAM_ID:'https://steamcommunity.com/id/example/'});
    assert.ok(urls[0].includes('vanityurl=example'));assert.ok(urls.slice(1).every(u=>u.includes('76561198000000000')));
  }finally{globalThis.fetch=original;}
});
