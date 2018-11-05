const inquirer = require('inquirer'),
    path = require('path'),
    fs = require('fs'),
    rimraf = require('rimraf'),
    mkdirp = require('mkdirp');

inquirer
    .prompt([
        {
            type: 'input',
            name: 'appid',
            message: 'Steam APP ID',
            validate: input => {
                if (!+input) {
                    return 'Please provide a numeric APP ID';
                }

                return true;
            },
        },
        {
            type: 'input',
            name: 'description',
            message: 'Build description (optional)',
        },
        {
            type: 'input',
            name: 'branch',
            message: 'Name of the branch to set live after deployment',
            default: 'beta',
            validate: input => !!input ? true : 'Please provide a branch name to set live after deployment',
        },
        {
            type: 'input',
            name: 'depots.windows',
            message: 'Depot ID for windows build, leave empty if you don\'t have a windows build',
            validate: input => {
                if (input && !+input) {
                    return 'Please provide a numeric DEPOT ID';
                }

                return true;
            },
        },
        {
            type: 'input',
            name: 'depots.macos',
            message: 'Depot ID for macos build, leave empty if you don\'t have a macos build',
            validate: input => {
                if (input && !+input) {
                    return 'Please provide a numeric DEPOT ID';
                }

                return true;
            },
        },
        {
            type: 'input',
            name: 'depots.linux',
            message: 'Depot ID for linux build, leave empty if you don\'t have a linux build',
            validate: input => {
                if (input && !+input) {
                    return 'Please provide a numeric DEPOT ID';
                }

                return true;
            },
        },
        {
            type: 'confirm',
            name: 'override',
            message: 'Config directory already exists. Do you want to replace the config? (Otherwise script is aborted)',
            default: true,
            when: () => checkIfConfigAlreadyExists(),
        },
    ])
    .then(answers => {
        if (typeof answers.override !== 'undefined' && !answers.override) {
            console.warn('Config replacement not allowed. Aborting...');
            return;
        }

        if (!checkDepotsSet(answers)) {
            console.warn('You did not specify a depot. Aborting...');
            return;
        }

        console.log('Creating config files...');

        return removeConfigDirectory(answers);
    })
    .then(answers => mkdirp.sync(configFilePath) && answers)
    .then(answers => writeAppFile(answers))
    .then(answers => writeDepotFiles(answers))
    .then(() => console.log('Done.'))
    .catch(console.error);

const configFilePath = path.join(__dirname, '..', 'config');

const checkDepotsSet = answers => {
    const depots = answers.depots;
    return depots.windows || depots.linux || depots.macos;
};

const checkIfConfigAlreadyExists = () => {
    return fs.existsSync(configFilePath);
};

const removeConfigDirectory = answers => new Promise((resolve, reject) =>
    rimraf(configFilePath, err => !!err ? reject(err) : resolve(answers)),
);

const writeAppFile = answers => {
    let depots = '';

    if (answers.depots.windows) {
        depots += `		"${answers.depots.windows}" "depot_build_${answers.depots.windows}.vdf"\n`;
    }

    if (answers.depots.macos) {
        depots += `		"${answers.depots.macos}" "depot_build_${answers.depots.macos}.vdf"\n`;
    }

    if (answers.depots.linux) {
        depots += `		"${answers.depots.linux}" "depot_build_${answers.depots.linux}.vdf"\n`;
    }

    const appFile = `"appbuild"
{
	"appid"	"${answers.appid}"
	"desc" "${answers.description}"
	"buildoutput" "..\\output\\"
	"contentroot" "..\\content\\"
	"setlive"	"${answers.branch}"
	"preview" "0"
	"local"	"" 
	
	"depots"
	{
		${depots.trim()}
	}
}`;

    fs.writeFileSync(path.join(configFilePath, `app_build_${answers.appid}.vdf`), appFile);

    return answers;
};

const writeDepotFiles = answers => {
    writeDepotFile(answers, 'windows');
    writeDepotFile(answers, 'macos');
    writeDepotFile(answers, 'linux');
};

const writeDepotFile = (answers, depotName) => {
    const depotId = answers.depots[depotName];

    if (!depotId) {
        return;
    }

    const depotFile = `"DepotBuildConfig"
{
	"DepotID" "${depotId}"

	"FileMapping"
    {
  	  "LocalPath" ".\\${depotName}\\*"
      "DepotPath" "."
      "recursive" "1"
    }

	"FileExclusion" "*.pdb"
}`;

    fs.writeFileSync(path.join(configFilePath, `depot_build_${depotId}.vdf`), depotFile);
};
