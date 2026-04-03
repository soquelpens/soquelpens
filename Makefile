.PHONY: all
all: html css js

.PHONY: html
html:
	python main.py

.PHONY: css
css:
	mkdir -p public/css
	sass --style=compressed scss/main.scss > public/css/main.css
	sass --style=compressed scss/mobile.scss > public/css/mobile.css

.PONY: js
js:
	mkdir -p public/js
	tsc ./ts/wc.ts --lib ES2022,DOM --outDir public/js
