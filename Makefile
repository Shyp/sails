.PHONY: test install clean shrinkwrap

circle-install:
	curl --remote-name https://raw.githubusercontent.com/Shyp/set-node-npm/master/set-node-npm
	chmod +x set-node-npm
	./set-node-npm

test:
	node --version
	TZ=GMT ./node_modules/.bin/mocha --bail --slow 2

install:
	npm --version
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
