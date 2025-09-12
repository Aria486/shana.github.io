// vite-plugin-auto-route.js
const path = require('path');
const { generateRouteStructure } = require('./auto-route-generator');

function autoRoutePlugin(options = {}) {
  let watcher = null;
  let isProduction = false;
  let isDevelopment = false;

  const { enabled = true, watchInDev = true, generateOnBuild = true } = options;

  return {
    name: 'auto-route-generator',

    configResolved(config) {
      isProduction = config.command === 'build';
      isDevelopment = config.command === 'serve';
    },

    buildStart() {
      if (!enabled) return;

      if (isProduction && generateOnBuild) {
        console.log('🔄 Generating route structure for production build...');
        generateRouteStructure();
      }
    },

    configureServer(server) {
      console.log('isDev?', isDevelopment); // ✅ 这里能正常输出 true/false

      if (watchInDev && isDevelopment && !watcher) {
        console.log('🔄 Starting auto route generator in development mode...');
        generateRouteStructure();

        const noteDir = path.resolve('./src/note');
        server.watcher.add(noteDir);

        server.watcher.on('change', (filePath) => {
          if (filePath.includes(noteDir)) {
            console.log(`📄 File changed: ${path.relative(noteDir, filePath)}`);
            generateRouteStructure();
          }
        });
      }
    }
  };
}


module.exports = autoRoutePlugin;