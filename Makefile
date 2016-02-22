.PHONY: test install clean shrinkwrap

test:
	TZ=GMT mocha --bail --slow 2

install:
	npm install

shrinkwrap: clean
	npm cache clear
	npm install --production
	npm shrinkwrap
	npm install --production
	npm shrinkwrap
	clingwrap npmbegone

clean: 
	rm -rf node_modules
