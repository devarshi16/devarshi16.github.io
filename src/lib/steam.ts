// Build-time Steam data for /misc/. Needs STEAM_API_KEY and STEAM_ID (64-bit id, profile URL or custom name)
// in the environment; without them, or if Steam is unreachable, the page falls back
// to the hand-written entries in src/data/misc.ts.
export type OwnedGame = { appid: number; name?: string; playtime_forever?: number; rtime_last_played?: number };
export type RecentGame = { title: string; appid: number; lastPlayed: Date; hours: number; image: string; url: string };
export type SteamProfile = { persona?: string; profileUrl?: string; recent: RecentGame[] };

export function latestGames(games: OwnedGame[], count = 3): RecentGame[] {
  return games.filter(game => game.name && (game.rtime_last_played ?? 0) > 0)
    .sort((a, b) => (b.rtime_last_played ?? 0) - (a.rtime_last_played ?? 0)).slice(0, count)
    .map(game => ({
      title: game.name!, appid: game.appid, lastPlayed: new Date(game.rtime_last_played! * 1000),
      hours: Math.round((game.playtime_forever ?? 0) / 6) / 10,
      image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
      url: `https://store.steampowered.com/app/${game.appid}/`,
    }));
}

export async function fetchSteamProfile(env: Record<string, string | undefined> = process.env): Promise<SteamProfile | null> {
  const key = env.STEAM_API_KEY, account = env.STEAM_ID?.trim();
  if (!key || !account) return null;
  const get = async (url: string) => {
    const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!response.ok) throw new Error(`Steam API ${response.status}`);
    return response.json();
  };
  try {
    const base = 'https://api.steampowered.com';
    // STEAM_ID may be the 17-digit id, a profile URL, or the custom name from steamcommunity.com/id/<name>.
    const numeric = account.match(/(\d{17})/)?.[1];
    const vanity = account.replace(/\/+$/, '').split('/').pop()!;
    const id = numeric ?? (await get(`${base}/ISteamUser/ResolveVanityURL/v1/?key=${key}&vanityurl=${encodeURIComponent(vanity)}`))?.response?.steamid;
    if (!id) throw new Error(`could not resolve Steam account ${vanity}`);
    const [owned, summary] = await Promise.all([
      get(`${base}/IPlayerService/GetOwnedGames/v1/?key=${key}&steamid=${id}&include_appinfo=1&include_played_free_games=1`),
      get(`${base}/ISteamUser/GetPlayerSummaries/v2/?key=${key}&steamids=${id}`),
    ]);
    const player = summary?.response?.players?.[0];
    return { persona: player?.personaname, profileUrl: player?.profileurl, recent: latestGames(owned?.response?.games ?? []) };
  } catch (error) {
    console.warn(`Steam data unavailable, using src/data/misc.ts: ${(error as Error).message}`);
    return null;
  }
}
