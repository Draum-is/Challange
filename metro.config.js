// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);
// Allow .cjs (used by some Firebase submodules)
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

module.exports = config;
