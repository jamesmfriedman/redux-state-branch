const path = require('path');

module.exports = function override(config, env) {
  // add module aliases
  config.resolve.alias['redux-state-branch'] = path.resolve(
    './src/redux-state-branch'
  );

  // grab the "oneOf" rule
  const rules = config.module.rules[2].oneOf;

  // add a markdown loader
  rules.unshift(
    /**
     * This loader allows you to render inline code blocks
     */
    {
      test: /\.md$/,
      include: path.resolve('./src'),
      use: [
        {
          loader: require.resolve('babel-loader'),
          options: {
            // @remove-on-eject-begin
            babelrc: false,
            presets: [require.resolve('babel-preset-react-app')],
            // @remove-on-eject-end
            // This is a feature of `babel-loader` for webpack (not Babel itself).
            // It enables caching results in ./node_modules/.cache/babel-loader/
            // directory for faster rebuilds.
            cacheDirectory: true
          }
        },
        require.resolve('react-markdown-loader')
      ]
    }
  );

  return config;
};
