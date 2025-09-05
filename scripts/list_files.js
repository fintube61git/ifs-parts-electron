const fs = require('fs').promises;
const path = require('path');

const MAX_FILES_TO_SHOW = 5;

async function getFileStructure(dir, prefix = '') {
  let output = '';
  let files = [];
  try {
    // Read files asynchronously
    files = await fs.readdir(dir, { withFileTypes: true });
  } catch (error) {
    // Handle potential errors like permissions issues
    return `${prefix}├── [Error reading directory]\n`;
  }

  let filesToShow = files;
  let hasMore = false;

  if (files.length > MAX_FILES_TO_SHOW) {
    filesToShow = files.slice(0, MAX_FILES_TO_SHOW);
    hasMore = true;
  }

  for (let i = 0; i < filesToShow.length; i++) {
    const file = filesToShow[i];
    const isLast = i === filesToShow.length - 1 && !hasMore;
    const newPrefix = prefix + (isLast ? '    ' : '│   ');
    output += `${prefix}${isLast ? '└── ' : '├── '}${file.name}\n`;

    if (file.isDirectory()) {
      output += await getFileStructure(path.join(dir, file.name), newPrefix);
    }
  }

  if (hasMore) {
    const remainingCount = files.length - MAX_FILES_TO_SHOW;
    output += `${prefix}└── ... (${remainingCount} more files)\n`;
  }

  return output;
}

async function main() {
  const projectRoot = __dirname;
  console.log(path.basename(projectRoot));
  console.log(await getFileStructure(projectRoot));
}

main();
