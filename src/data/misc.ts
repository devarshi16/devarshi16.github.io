// Gaming corner on /misc/. Edit by hand; nothing here is fetched at build time.
// TODO(devarshi): confirm the Steam profile link and the games below.
export const steam = {
  account: '__REVOLUTION__',
  // Leave empty until the real profile URL (steamcommunity.com/id/... or /profiles/...) is confirmed.
  profileUrl: '',
  nowPlaying: [
    { title: 'Your current game', note: 'Placeholder. Replace with what you are playing right now.', placeholder: true },
  ],
  favourites: [] as { title: string; note?: string }[],
};
