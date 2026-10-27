const { withXcodeProject } = require("expo/config-plugins");

// Sentry's "Upload Debug Symbols" phase finds node via ${NODE_BINARY:-node} but, unlike the React Native
// phases, never sources ios/.xcode.env. Xcode launched from the Dock has no Homebrew node on PATH, so the
// phase ran `/bin/sh ""` and failed. Sourcing the same files gives it NODE_BINARY.
const SOURCE_XCODE_ENV =
  'if [ -f \\"$SRCROOT/.xcode.env\\" ]; then . \\"$SRCROOT/.xcode.env\\"; fi\\n' +
  'if [ -f \\"$SRCROOT/.xcode.env.local\\" ]; then . \\"$SRCROOT/.xcode.env.local\\"; fi\\n';

module.exports = function withSentryNodeBinary(config) {
  return withXcodeProject(config, (cfg) => {
    const phases = cfg.modResults.hash.project.objects.PBXShellScriptBuildPhase ?? {};
    for (const phase of Object.values(phases)) {
      const script = typeof phase === "object" ? phase.shellScript : undefined;
      if (script?.includes("sentry-xcode-debug-files.sh") && !script.includes(".xcode.env")) {
        phase.shellScript = `"${SOURCE_XCODE_ENV}${script.slice(1)}`; // shellScript is stored with its quotes
      }
    }
    return cfg;
  });
};
