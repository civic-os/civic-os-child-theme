# Civic OS Child Theme

A thin [Hello Elementor](https://wordpress.org/themes/hello-elementor/) child theme that holds the accessibility base for [civic-os.org](https://civic-os.org): the things Elementor cannot cleanly own, kept in version control instead of in the Elementor kit's custom-CSS box.

## What it does

- **Self-hosts the site fonts** — Public Sans (headings + body) and JetBrains Mono (accent labels), as local `woff2` files. No external origins, so nothing needs whitelisting in the shared nginx Content-Security-Policy.
- **Applies the font cutover** — sets the base `font-family` only. Heading and body **sizes** are deliberately left alone so activating the theme does not resize existing pages; the type scale rides with the components during migration.
- **Visible keyboard focus** — a 3px focus ring (Link Blue `#186C90`) on every interactive element via `:focus-visible`.
- **Skip link** — reveals Hello Elementor's existing skip-to-content link when it is focused.
- **Reduced motion** — neutralizes Elementor animations, transitions, and page transitions for visitors who set `prefers-reduced-motion`.

It is purely additive on top of Hello Elementor; it overrides no parent markup.

## Structure

```
civic-os-child/
├── style.css                     Theme header (Template: hello-elementor)
├── functions.php                 Enqueues the two stylesheets below
└── assets/
    ├── css/
    │   ├── fonts.css             @font-face declarations
    │   └── accessibility.css     font cutover, focus, skip link, reduced-motion
    └── fonts/                    self-hosted woff2 + font licenses
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

## Licenses

- Theme code: **AGPL-3.0**, matching the Civic OS convention.
- Fonts: **SIL Open Font License 1.1** — see `assets/fonts/`.
