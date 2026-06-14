const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Firebase JS SDK (v9+) ships some files as .cjs, and the React Native build of
// @firebase/auth — the only one that exports getReactNativePersistence — is only
// picked up when Metro resolves packages via their main fields instead of the new
// "exports" map. Without this, Firebase Auth falls back to in-memory persistence
// and the session is lost on every app restart.
// See: https://docs.expo.dev/guides/using-firebase/
config.resolver.sourceExts.push("cjs");
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
