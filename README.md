Soquel PENS website

quickstart:

```
pipx install uv==0.10.8 && uv run make html
npx wrangler pages dev public
```

Test with

```
PYTHONPATH=`pwd` uv run pytest
```

Build the world with:

```
npm install
PATH=`pwd`/node_modules/.bin:$PATH uv run make
```