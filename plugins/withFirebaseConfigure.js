const { withAppDelegate } = require('@expo/config-plugins');

const FIREBASE_IMPORT = 'import FirebaseCore';
const FIREBASE_CONFIGURE = 'FirebaseApp.configure()';

module.exports = function withFirebaseConfigure(config) {
  return withAppDelegate(config, (config) => {
    if (config.modResults.language !== 'swift') {
      throw new Error('withFirebaseConfigure verwacht een Swift AppDelegate.');
    }

    let contents = config.modResults.contents;

    if (!contents.includes(FIREBASE_IMPORT)) {
      contents = contents.replace(/^import Expo$/m, `import Expo\n${FIREBASE_IMPORT}`);
    }

    if (!contents.includes(FIREBASE_CONFIGURE)) {
      const returnAnchor =
        /^(\s*)return super\.application\(application, didFinishLaunchingWithOptions: launchOptions\)$/m;

      if (!returnAnchor.test(contents)) {
        throw new Error('Kon het Firebase-initialisatiepunt in AppDelegate.swift niet vinden.');
      }

      contents = contents.replace(
        returnAnchor,
        (match, indent) => `${indent}${FIREBASE_CONFIGURE}\n\n${match}`,
      );
    }

    config.modResults.contents = contents;
    return config;
  });
};
