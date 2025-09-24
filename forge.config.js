module.exports = {
  packagerConfig: {
    asar: true,
    executableName: "ifs-parts-electron",
    icon: "./src/Icons/app"
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
          icon: "./src/Icons/app.png",
          categories: ["Education", "Utility"]
        }
      }
    }
  ]
};
