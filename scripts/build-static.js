const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

const copyFileIfExists = (relativePath) => {
  const source = path.join(rootDir, relativePath);
  if (!fs.existsSync(source)) {
    return;
  }

  const destination = path.join(distDir, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
};

const copyDirectoryIfExists = (relativePath) => {
  const source = path.join(rootDir, relativePath);
  if (!fs.existsSync(source)) {
    return;
  }

  const destination = path.join(distDir, relativePath);
  fs.cpSync(source, destination, { recursive: true });
};

const build = () => {
  fs.rmSync(distDir, { recursive: true, force: true });
  fs.mkdirSync(distDir, { recursive: true });

  const rootEntries = fs.readdirSync(rootDir, { withFileTypes: true });

  rootEntries
    .filter((entry) => entry.isFile())
    .filter((entry) => /\.(html|css|js|txt|json)$/i.test(entry.name))
    .forEach((entry) => {
      // Keep backend/runtime and local tooling out of static deployment artifacts.
      if (["package.json", "package-lock.json", "server.js"].includes(entry.name)) {
        return;
      }
      copyFileIfExists(entry.name);
    });

  copyDirectoryIfExists("assets");

  console.log("Static site build complete.");
  console.log(`Output directory: ${distDir}`);
};

build();
