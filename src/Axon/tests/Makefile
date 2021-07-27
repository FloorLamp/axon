MOC ?= $(shell vessel bin)/moc
# MOC ?= $(shell dfx cache show)/moc
SOURCES = $(shell vessel sources)

TESTS=$(wildcard *.test.mo)
TEST_TARGETS = $(patsubst %.mo,%.wasm,$(TESTS))

.PHONY: $(TESTS)

all: $(TEST_TARGETS)

%.wasm: %.mo
	$(MOC) $(SOURCES) -wasi-system-api -o $@ $< && wasmtime $@
	rm -f $@

clean:
	rm *.wasm
