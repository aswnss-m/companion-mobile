const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const { withNativeWind } = require("nativewind/metro");

// Sentry's wrapper of expo/metro-config adds debug IDs so uploaded source maps match the bundle.
const config = getSentryExpoConfig(__dirname);
module.exports = withNativeWind(config, { input: "./global.css", inlineRem: 16 });
