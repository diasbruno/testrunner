NODE_MODULES=./node_modules
NODE_MODULES_BIN=$(NODE_MODULES)/.bin
WEBPACK=$(NODE_MODULES_BIN)/webpack

WEBPACK_CONFIG=webpack.config.test.js

run:
	$(WEBPACK) --config $(WEBPACK_CONFIG)
