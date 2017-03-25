MAKEFLAGS += --no-print-directory
TEMPDIR = $(PWD)/temp

PATH := ./node_modules/.bin:$(PATH)
PACKAGES = $(shell find . -mindepth 1 -maxdepth 1 -name 'anno-*' -type d)
TESTS = $(shell find . -mindepth 1 -maxdepth 2 -name '*.test.js')
# REPORTER = spec
REPORTER = tap
# REPORTER = classic

MKDIR = mkdir -p
RM = rm -rf

help:
	@echo
	@echo "  Targets"
	@echo
	@echo "    bootstrap   lerna bootstrap"
	@echo "    start-all   Start mongodb and server"
	@echo "    stop-all    Stop mongodb and server"
	@echo "    clean       Remove tempdir"
	@echo "    test        Run all unit/integration tests"
	@echo "    docs        Generate static website in $(DOCDIR)"
	@echo "    fixtures    Download assets from web-platform-tests"
	@echo
	@echo "  Variables"
	@echo
	@echo "    TEMPDIR     Directory for temporary data. Default: $(TEMPDIR)"
	@echo "    REPORTER    TAP Reporter for node-tap (spec, classic, tap...). Default: $(REPORTER)"

.PHONY: bootstrap
bootstrap: fixtures
	lerna bootstrap

start-all: fixtures
	$(MAKE) -sC anno-store-mongodb start
	$(MAKE) -sC anno-server start

stop-all:
	$(MAKE) -sC anno-store-mongodb stop
	$(MAKE) -sC anno-server stop

.PHONY: test
test: $(TESTS)
	$(MAKE) start-all && sleep 2
	-tap -R$(REPORTER) $^
	$(MAKE) stop-all

.PHONY: anno-%
test\:%: anno-%
	-$(MAKE) -sC $< start && sleep 2
	-tap -R$(REPORTER) "$</"*.test.js "$</test/"*.test.js
	-$(MAKE) -sC $< stop

.PHONY: clean
clean:
	$(RM) $(TEMPDIR)

.PHONY: docs
docs:
	$(MKDIR) docs
	node -e 'console.log(JSON.stringify(require("./anno-schema/schema.js").jsonldContext, null, 2));' \
		> docs/context.jsonld
	git commit -m 'updated docs' docs && git push

fixtures:
	$(MKDIR) $(TEMPDIR)/fixtures
	git clone --depth 1 'https://github.com/w3c/web-platform-tests/' $(TEMPDIR)/web-platform-tests
	mv $(TEMPDIR)/web-platform-tests/annotation-protocol/files/annotations "$@"
	# these are invalid for the current draft (composite/list)
	rm "$@"/anno12.json "$@"/anno13.json
