"use strict";
import { execFileSync, execSync } from 'child_process';
import { promises as fs, existsSync } from 'fs';
import Git from 'nodegit';
import { force_override_resolver, build_eelis_gen } from './src/operations.mjs'

function invoke(command) {
    console.log('> ', command);
    execSync(command, {stdio: "inherit"});
}

const mkdir_if_not_exists = async (path) => {
    if(!existsSync(path))
        await fs.mkdir(path);
};

(async () => {
    invoke('test -e ./stack || curl -sSL https://gist.githubusercontent.com/RuthgerD/14f10ba827d062399432cca8b7656c52/raw/5169cfd5199cf55eed40ea7bcd1a03788909fad4/stash.sh | sh -s - -d "$(pwd)"');

    await mkdir_if_not_exists('.managed');
    await mkdir_if_not_exists('.managed/cache');
    await mkdir_if_not_exists('.managed/cache/std');

    console.log('Cloning draft...');
    if(!existsSync('.managed/draft'))
        await Git.Clone.clone('https://github.com/cplusplus/draft', '.managed/draft');
    else
        await Git.Repository.open(`.managed/draft`).then(repo => repo.fetch('origin'));
    console.log('Done.');

    console.log('Cloning cxxdraft-htmlgen...');
    if(!existsSync('.managed/cxxdraft-htmlgen'))
        await Git.Clone.clone('https://github.com/Eelis/cxxdraft-htmlgen', '.managed/cxxdraft-htmlgen');
    else
        await Git.Repository.open(`.managed/cxxdraft-htmlgen`).then(repo => repo.fetch('origin'));
    console.log('Done.');
    await mkdir_if_not_exists('.managed/cxxdraft-htmlgen/.versions');

    invoke('./stack config set system-ghc --global true');

    // Build gen's HEAD once, to install GHC and build dependencies
    await build_eelis_gen();
    console.log('Setup done.');
    process.exit(0);
})();
