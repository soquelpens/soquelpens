
.PHONY: html
html:
	python main.py

.PHONY: css
css:
	sass --style=compressed scss/main.scss > public/css/main.css
