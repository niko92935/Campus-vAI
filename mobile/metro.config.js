const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// This is an npm-workspace install: Expo, React Native Web and Metro live in the
// repository root, while React 18.2 (the version Expo SDK 50 expects) is nested in
// mobile/node_modules. Force every dependency - including Expo's web runtime - to
// use that single React copy, otherwise hooks are dispatched by two React instances
// and the page crashes with "Cannot read properties of null (reading 'useState')".
const mobileModules = path.join(__dirname, 'node_modules');

function resolveFromMobile(moduleName) {
  try {
    return require.resolve(moduleName, { paths: [mobileModules] });
  } catch (error) {
    return null;
  }
}

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const shouldPin =
    moduleName === 'react' ||
    moduleName.startsWith('react/') ||
    moduleName === 'react-dom' ||
    moduleName.startsWith('react-dom/');

  if (shouldPin) {
    const pinned = resolveFromMobile(moduleName);
    if (pinned) {
      return { type: 'sourceFile', filePath: pinned };
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

// Disable the web node shims package-exports issue on Windows.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
