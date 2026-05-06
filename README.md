# Fujimura Keiji Profile Site

Static site prepared for GitHub Pages with a custom domain.

## Files

- `index.html`
- `en.html`
- `styles.css`
- `script.js`
- `CNAME`
- `.nojekyll`

## GitHub Pages setup

1. Create a GitHub repository.
2. Upload these files to the repository root.
3. In GitHub, open `Settings` -> `Pages`.
4. Set `Build and deployment` to `Deploy from a branch`.
5. Choose branch `main` and folder `/ (root)`.
6. Save.
7. In the custom domain field, set `fujimurakeiji.com`.
8. Wait for GitHub Pages to publish.

## DNS for fujimurakeiji.com

For the apex domain:

- `A` -> `185.199.108.153`
- `A` -> `185.199.109.153`
- `A` -> `185.199.110.153`
- `A` -> `185.199.111.153`

Recommended for `www`:

- `CNAME` -> `<your-github-username>.github.io`

## Notes

- Google Workspace manages email, but not static web hosting.
- Website hosting is done by GitHub Pages.
- DNS changes can take time to propagate.
