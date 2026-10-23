# Blog comments and visitor analytics

The site uses hosted GoatCounter for pageviews and Giscus (GitHub Discussions) for
comments. Both work with the static GitHub Pages deployment and require no Oracle VM.
Both are disabled until their public settings are supplied. No new GitHub secrets,
personal access tokens, GoatCounter API tokens, or server database are required.

## 1. Create a hosted GoatCounter site

1. Sign up at <https://www.goatcounter.com/signup> and verify your email.
2. Register the production website, `https://devarshi16.github.io`.
3. Choose your site code. For an endpoint such as
   `https://my-portfolio.goatcounter.com/count`, the code is `my-portfolio`.
4. Set the repository variable `PUBLIC_GOATCOUNTER_CODE` to that code, without a URL.

The public tracking code is unrelated to your GoatCounter password or API tokens.
View reports by signing into your GoatCounter dashboard. Your own visits can be
excluded in GoatCounter's Settings → Tracking. Ad blockers can suppress collection.

Official setup: <https://www.goatcounter.com/help/start>.

## 2. Connect Giscus to GitHub Discussions

Use your existing GitHub account. Readers also need a GitHub account to post; reading
comments does not require login. All comments will be public in GitHub Discussions.

1. Open <https://github.com/devarshi16/devarshi16.github.io/settings> and enable
   **Discussions** under Features.
2. In Discussions, create a **Blog comments** category using the **Announcements**
   format. This lets Giscus create discussions while keeping category thread creation
   restricted to maintainers and the app.
3. Install <https://github.com/apps/giscus> for **only this repository**.
4. Open <https://giscus.app/>, enter `devarshi16/devarshi16.github.io`, and select
   the **Blog comments** category.
5. Copy the generated `data-category-id` value into the repository variable
   `PUBLIC_GISCUS_CATEGORY_ID`.

This repository's verified GraphQL ID, `R_kgDONGnexw`, is the code default, so you
normally only need the category ID. A fork or another discussion repository must
provide both its own `PUBLIC_GISCUS_REPO` and `PUBLIC_GISCUS_REPO_ID`. The optional
`PUBLIC_GISCUS_CATEGORY` variable overrides the default category name.

The integration uses strict pathname matching, so each article and news update has
its own thread. Preserve published permalinks to preserve this association. Giscus
creates the discussion when the first comment or reaction is submitted. Moderation
happens on GitHub; no build is necessary to show new comments.

## 3. Set GitHub Actions variables and deploy

Open **Settings → Secrets and variables → Actions → Variables → New repository variable**:

| Variable | Value | Required |
| --- | --- | --- |
| `PUBLIC_GOATCOUNTER_CODE` | Your hosted GoatCounter site code | For analytics |
| `PUBLIC_GISCUS_CATEGORY_ID` | `data-category-id` from giscus.app | For comments |
| `PUBLIC_GISCUS_REPO` | `devarshi16/devarshi16.github.io` | Only to override the default |
| `PUBLIC_GISCUS_REPO_ID` | `R_kgDONGnexw` | Only to override the default |
| `PUBLIC_GISCUS_CATEGORY` | `Blog comments` | Only to override the default |

These are **Variables**, not Secrets: they appear in the delivered HTML. Existing
Steam secrets remain unrelated to these integrations. The Pages workflow passes the
variables to the build explicitly. Run **Actions → Publish portfolio to GitHub Pages
→ Run workflow** on `gh-pages` after adding/changing variables, or deploy by pushing
the integration changes to `gh-pages`. Adding a variable does not update an already
published build by itself.

For local production builds, copy `.env.example` to `.env` and fill in the values.
Do not commit `.env`. An unset provider is safely omitted. Neither provider is called
during the static build. Normal local development does not collect production analytics;
analytics also checks that the browser's origin matches `astro.config.mjs`'s site URL
and skips embedded pages. Update that site URL if moving to a custom domain.

## Loading and failure behavior

- Article content is static HTML and remains available with JavaScript disabled or
  either provider blocked. Comments appear only on published articles and news updates.
- Giscus's client is requested only when the comments section approaches the viewport,
  or when the reader explicitly requests it. Comment content lives in its own iframe;
  it cannot delay the initial article render. A GitHub Discussions link remains available
  for slow/blocked loading, together with manual retry. The widget follows the site theme.
- GoatCounter is scheduled after HTML parsing with a bounded idle callback (or a timer
  fallback). Its script is asynchronous, has no dependency on page navigation or theme
  controls, and loading failure does not stop those features. Collection is best effort;
  a blocked/failed request can mean a missed pageview, never a blocked article.
- Provider downtime, ad blockers, and network failures affect the corresponding widget
  or count only. No tracking failure is retried automatically, to avoid duplicate counts.

## Verify after configuration

Open a published blog post on the deployed site. Before scrolling near the bottom,
the browser Network panel should contain no Giscus client request. Scroll to comments
to load it. Test once with `giscus.app` and `gc.zgo.at` blocked: the article and theme
toggle should still work. Use GoatCounter's dashboard to confirm a pageview; no
GoatCounter request is sent from a localhost preview or an embedded demo.
