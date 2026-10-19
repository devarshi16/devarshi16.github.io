// Gaming corner on /misc/. Edit by hand; nothing here is fetched at build time.
// Profile figures copied from the Steam app on 2026-10-19.
// TODO(devarshi): add the profile link and the games below.
export const steam = {
  account: 'MissFortune',
  level: 51,
  games: 166,
  // Leave empty until the real profile URL (steamcommunity.com/id/... or /profiles/...) is confirmed.
  profileUrl: '',
  nowPlaying: [
    { title: 'Your current game', note: 'Placeholder. Replace with what you are playing right now.', placeholder: true },
  ],
  favourites: [] as { title: string; note?: string }[],
};
