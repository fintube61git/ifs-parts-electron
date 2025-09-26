module.exports = {
  packagerConfig: {
    asar: true,
    executableName: "ifs-parts-electron",
    // Base icon for Electron packaging (omit extension)
    icon: "src/Icons/app"
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-deb",
      config: {
        options: {
          productName: "IFS Parts",
          maintainer: "T. Dawson Woodrum",
          description: "IFS Parts Application — Electron Desktop App",
          // Point to a concrete PNG. Debian tools will install it under hicolor.
          // (We also checked in multi-size PNGs for future-proofing.)
          icon: "build/icons/hicolor/512x512/apps/ifs-parts-electron.png",
          categories: ["Education", "Utility"]
        }
      }
    }
  ]
};
