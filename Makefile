.PHONY: all
all: html css js

.PHONY: html
html:
	python main.py

CSS_FILES := $(wildcard scss/*.scss)
.PHONY: css
css:
	mkdir -p public/css
	@for file in $(CSS_FILES); do \
		base_file=`echo $$file | cut -d . -f 1 | cut -d / -f '2'`; \
		echo "Building public/css/$$base_file.css"; \
		sass --style=compressed --no-source-map $$file public/css/$$base_file.css; \
	done

.PONY: js
js:
	mkdir -p public/js
	tsc ./ts/wc.ts --lib ES2022,DOM --outDir public/js
