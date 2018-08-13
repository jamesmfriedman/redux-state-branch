const path = require('path');

module.exports = function override(config, env) {
  // add module aliases
  config.resolve.alias['redux-state-branch'] = path.resolve(
    './src/redux-state-branch'
  );

  return config;
};
