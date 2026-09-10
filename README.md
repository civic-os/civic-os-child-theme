# Civic OS Child Theme

A thin [Hello Elementor](https://wordpress.org/themes/hello-elementor/) child theme that holds the accessibility base for [civic-os.org](https://civic-os.org): the things Elementor cannot cleanly own, kept in version control instead of in the Elementor kit's custom-CSS box.

## What it does

- **Self-hosts the site fonts** — Public Sans (headings + body) and JetBrains Mono (accent labels), as local `woff2` files. No external origins, so nothing needs whitelisting in the shared nginx Content-Security-Policy.
- **Applies the font cutover** — sets the base `font-family` only. Heading and body **sizes** are deliberately left alone so activating the theme does not resize existing pages; the type scale rides with the components during migration.
- **Visible keyboard focus** — a 3px focus ring (Link Blue `#186C90`) on every interactive element via `:focus-visible`.
- **Skip link** — reveals Hello Elementor's existing skip-to-content link when it is focused.
- **Reduced motion** — neutralizes Elementor animations, transitions, and page transitions for visitors who set `prefers-reduced-motion`.
- **Owns section vertical rhythm** — one token (`--cos-section-space`) sets the top/bottom padding of every top-level Elementor band, so section spacing is consistent across every page and cannot drift page to page. This deliberately overrides any padding-block a band carries in its own Elementor settings; to change the rhythm, edit the token, not the pages. Bands that should breathe more take a modifier class in their Elementor "CSS Classes" field: `cos-band-hero` (the opening band with the h1), `cos-band-cta` (a prominent call to action), or `cos-band-flush` (no top gap against the band above).

It is purely additive on top of Hello Elementor; it overrides no parent markup.

## Structure

```
civic-os-child/
├── style.css                     Theme header (Template: hello-elementor)
├── functions.php                 Enqueues the stylesheets + wires GitHub-release self-updates
├── assets/
│   ├── css/
│   │   ├── fonts.css             @font-face declarations
│   │   ├── accessibility.css     font cutover, focus, skip link, reduced-motion
│   │   └── layout.css            section vertical rhythm (--cos-section-space) + band modifiers
│   └── fonts/                    self-hosted woff2 + font licenses
└── vendor/
    └── plugin-update-checker/    YahnisElsts/plugin-update-checker v5.5 (self-update library)
```

## Deploy to the server

GitHub is the source of truth; the server gets the files. Prefer deploying **without** a `.git` directory in the web root, so the repo history is never web-accessible.

Recommended — copy the files in (no `.git`):

```bash
# from a checkout on your machine:
rsync -a --exclude '.git' ./ root@wp.swiftlet.technology:/var/www/html/wp-content/themes/civic-os-child/
# then on the server:
wp theme activate civic-os-child --url=https://civic-os.org --allow-root
```

Alternative — `git clone` on the server, only if nginx already denies dotfiles (e.g. `location ~ /\.git { deny all; }`):

```bash
cd /var/www/html/wp-content/themes
git clone https://github.com/civic-os/civic-os-child-theme.git civic-os-child
wp theme activate civic-os-child --url=https://civic-os.org --allow-root
```

Reverting is a theme switch: `wp theme activate hello-elementor --url=https://civic-os.org --allow-root`.

## Updates from GitHub

After the first deploy above, the theme keeps itself up to date from this repository's **GitHub Releases**, using the bundled [Plugin Update Checker](https://github.com/YahnisElsts/plugin-update-checker) (v5). WordPress checks periodically and surfaces a newer release under **Network Admin → Themes** (this is a multisite), updatable in one click; you can also enable auto-updates there. No further rsync is needed for routine changes.

Publishing an update is three steps:

1. Make the change and **bump `Version:` in `style.css`** (the updater compares this to the release tag; nothing updates unless it increases).
2. Commit and push to `main`.
3. Cut a **GitHub Release** whose tag matches the version, prefixed with `v` (for example `v1.2.1`). PUC uses the release's source zip and installs it into the existing theme folder.

Access:

- **Public repository** (recommended; the theme is AGPL and Civic OS is open-source by mission): nothing more to configure.
- **Private repository:** add a read-only GitHub token to `wp-config.php` (kept out of the theme, so it never ships in the zip or the repo):

  ```php
  define( 'CIVIC_OS_CHILD_GH_TOKEN', 'ghp_your_read_only_token' );
  ```

The initial rsync deploy is still needed once, to put this updater-enabled version on the server; from then on releases drive the updates.

## Licenses

- Theme code: **AGPL-3.0**, matching the Civic OS convention.
- Fonts: **SIL Open Font License 1.1** — see `assets/fonts/`.
- Bundled Plugin Update Checker: **MIT** — see `vendor/plugin-update-checker/license.txt`.
