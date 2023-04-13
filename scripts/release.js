const { execSync } = require('child_process');
const semver = require('semver');
const path = require('path');
const fs = require('fs');

const rootDir = path.join(__dirname, '..');
const pkgFilePath = path.join(rootDir, 'package.json');
const pkgLockFilePath = path.join(rootDir, 'package-lock.json');

// Get the ReleaseType as a command line argument
const releaseType = process.argv[2];

// Define the allowed ReleaseTypes
const allowedReleaseTypes = ['patch', 'minor', 'major'];

// Check if the ReleaseType is allowed
if (!releaseType || !allowedReleaseTypes.includes(releaseType)) {
  console.error(`Invalid ReleaseType "${releaseType}". Allowed values are: ${allowedReleaseTypes.join(', ')}`);
  process.exit(1);
}

const currentVersion = require(pkgFilePath).version;
const newVersion = semver.inc(currentVersion, releaseType);

const tagName = `v${newVersion}`;

// Check if the tag already exists locally
const tagExistsLocally = execSync(`git tag --list "${tagName}"`).toString().trim() !== '';
if (tagExistsLocally) {
  console.error(`Tag "${tagName}" already exists locally. Please delete it and try again.`);
  process.exit(1);
}

// Check if the tag already exists on remote
const tagExistsOnRemote = execSync(`git ls-remote --tags origin "${tagName}"`).toString().trim() !== '';
if (tagExistsOnRemote) {
  console.error(`Tag "${newVersion}" already exists on remote. Please delete it and try again.`);
  process.exit(1);
}

// Update package.json with new version
const packageJson = JSON.parse(fs.readFileSync(pkgFilePath));
packageJson.version = newVersion;
fs.writeFileSync(pkgFilePath, JSON.stringify(packageJson, null, 2) + '\n');

// Update package-lock.json with new version
const packageLockJson = JSON.parse(fs.readFileSync(pkgLockFilePath));
packageLockJson.version = newVersion;
fs.writeFileSync(pkgLockFilePath, JSON.stringify(packageLockJson, null, 2) + '\n');

// Commit changes in package.json and package-lock.json files
execSync(`git commit -am "Bump version to ${newVersion}"`);

// Push the changes to remote
execSync(`git push`);

// Create a new git tag
const tagMessage = `Release ${tagName}`;
execSync(`git tag -a ${tagName} -m "${tagMessage}"`);

// Push the new tag to remote
execSync(`git push origin ${tagName}`);
