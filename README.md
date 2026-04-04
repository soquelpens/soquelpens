Soquel PENS website

quickstart:

```
npm ci
pipx install uv
uv run make
npx wrangler pages dev public
```

Test with

```
PYTHONPATH=`pwd` uv run pytest
```

* Sass files in `./scss`
* Typescript in `./ts`
* Liquid templates in `./templates`

These all are rendered into `./public`

Any yaml defined in a `{% comment %} START_DATA ... END_DATA {% endcomment %}` block is exposed as page.var. See `./templates/photos.html` for a complex example.

Deployed to CloudFlare pages on build. Ensure the `secrets.CLOUDFLARE_API_TOKEN` var is defined to deploy.
