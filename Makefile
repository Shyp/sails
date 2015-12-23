.PHONY: test

test:
	TZ=GMT mocha --bail --slow 2

install:
	npm install
