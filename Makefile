.PHONY: all
all: html css js

.PHONY: html
html:
	python main.py

.PHONY: css
css:
	sass --style=compressed scss/main.scss > public/css/main.css

.PONY: js
js:
	tsc ./ts/wc.ts --lib ES2022,DOM --outDir public/js
