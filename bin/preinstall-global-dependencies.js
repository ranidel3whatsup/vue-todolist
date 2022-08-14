const { execSync } = require("child_process");
const fs = require("fs");
const packageFile = JSON.parse(fs.readFileSync("package.json"));

function getOperatingSystem() {
	const nameOS = process.platform;

	console.groupCollapsed("Operation System:");
	console.log(nameOS);
	console.groupEnd();

	return nameOS;
}

function checkMacOS() {
	const nameOS = getOperatingSystem();

	if (nameOS == "darwin") {
		return true;
	}

	return false;
}

function getGlobalDependenciesInstalled() {
	const dependenceList = JSON.parse(execSync(`npm list -g --depth 0 --json`).toString()).dependencies;

	Object.keys(dependenceList).forEach(dependenceName => {
		delete dependenceList[dependenceName].from;
		delete dependenceList[dependenceName].resolved;
	});

	console.groupCollapsed("Global dependencies installed:");
	console.table(dependenceList);
	console.groupEnd();

	return dependenceList;
}

function getGlobalDependenciesToInstall() {
	const dependenceList = packageFile.globalDependencies;

	console.groupCollapsed("Global dependencies to install:");
	console.table(dependenceList);
	console.groupEnd();

	return dependenceList;
}

async function installGlobalDependencies() {
	const installed = await getGlobalDependenciesInstalled();
	const toInstall = await getGlobalDependenciesToInstall();

	Object.keys(toInstall).forEach(dependenceName => {
		const found = Object.keys(installed).find(dependenceInstalled => dependenceInstalled === dependenceName);
		const dependenceVersion = toInstall[dependenceName].replace("~", "").replace("^", "");

		if (!found) {
			console.log(`Installing dependencies: ${dependenceName}@${dependenceVersion}`);
			execSync(`${checkMacOS ? "sudo" : ""} npm i -g ${dependenceName}@${dependenceVersion}`);
		} else {
			console.log(`Dependencies already installed: ${dependenceName}@${dependenceVersion}`);
		}
	});
}

installGlobalDependencies().
	then(() => {
		console.log("Pre-installation of global packages is completed!");
	}).
	catch(err => {
		console.log("Error: ", err);
	});
