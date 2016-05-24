ROOT_DIR	:= $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
NOW		:= $(shell date --iso=seconds)
SRC_DIR 	:= $(ROOT_DIR)/src
BUILD_DIR 	:= $(ROOT_DIR)/build

define GetFromPkg
$(shell node -p "require('./package.json').$(1)")
endef

LAST_VERSION	:= $(call GetFromPkg,version)
DESCRIPTION	:= $(call GetFromPkg,description)
PROJECT_URL	:= $(call GetFromPkg,homepage)

JS_DEBUG	:= $(ROOT_DIR)/$(call GetFromPkg,rollup.dest)
JS_FINAL	:= $(ROOT_DIR)/$(call GetFromPkg,main)

TMPFILE 	:= $(BUILD_DIR)/tmp

NODE_MODULES	:= ./node_modules/.bin

ESLINT 		:= $(NODE_MODULES)/eslint
UGLIFYJS 	:= $(NODE_MODULES)/uglifyjs
UGLIFYJSFLAGS 	:= --mangle --mangle-regex --screw-ie8 -c warnings=false

NODEMON 	:= $(NODE_MODULES)/nodemon

ROLLUP	 	:= $(NODE_MODULES)/rollup
ROLLUPFLAGS 	:= -c config/rollup.config.js

define HEADER
/**
 * $(DESCRIPTION)
 * $(PROJECT_URL)
 * Version: v$(LAST_VERSION)
 * Built: $(NOW)
 */

endef
export HEADER

# targets

.PHONY: build-watch
build-watch: build watch

.PHONY: watch
watch: watch-js

.PHONY: build
build: build-js

.PHONY: build-js
build-js: bundle-js lint uglifyjs add-js-header
	@echo `date +'%H:%M:%S'` "Build JS ... OK"

.PHONY: bundle-js
bundle-js:
	@$(ROLLUP) $(ROLLUPFLAGS)

.PHONY: lint
lint: $(JS_DEBUG)
	@$(ESLINT) $^

.PHONY: uglifyjs
uglifyjs: $(JS_DEBUG)
	@$(UGLIFYJS) $^ $(UGLIFYJSFLAGS) > $(JS_FINAL)

.PHONY: add-js-header-debug
add-js-header-debug: $(JS_DEBUG)
	@echo "$$HEADER" | cat - $^ > $(TMPFILE) && mv $(TMPFILE) $^

.PHONY: add-js-header-min
add-js-header-min: $(JS_FINAL)
	@echo "$$HEADER" | cat - $^ > $(TMPFILE) && mv $(TMPFILE) $^

.PHONY: add-js-header
add-js-header: add-js-header-debug add-js-header-min

.PHONY: watch-js
watch-js: $(SRC_DIR)
	@$(NODEMON) --on-change-only --watch $^ --ext js --exec "make build-js"

.DEFAULT_GOAL := build