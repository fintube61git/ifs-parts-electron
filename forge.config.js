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
          // IMPORTANT: point to the DIRECTORY that contains the hicolor tree.
          // We generated:
          //   build/icons/hicolor/48x48/apps/ifs-parts-electron.png
          //   build/icons/hicolor/64x64/apps/ifs-parts-electron.png
          //   build/icons/hicolor/128x128/apps/ifs-parts-electron.png
          //   build/icons/hicolor/256x256/apps/ifs-parts-electron.png
          //   build/icons/hicolor/512x512/apps/ifs-parts-electron.png
          // The Debian maker will install these into /usr/share/icons/hicolor/...
          icon: "./build/icons",
          categories: ["Education", "Utility"]
        }
      }
    }
  ]
};
