// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Force Metro to prefer CJS ("main") over ESM ("module")
config.resolver.resolverMainFields = ["react-native", "browser", "main"];

// If you’re on an Expo/Metro setup where package.json "exports" is enabled,
// disabling it avoids pulling ESM builds that contain import.meta
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
