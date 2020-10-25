"use strict";
import { execFileSync, execSync } from 'child_process';
import { promises as fs, existsSync } from 'fs';
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
    invoke('test -e ./stack || curl -sSL https://get.haskellstack.org/ | sh -s - -d "$(pwd)"');

    await mkdir_if_not_exists('.managed');
    await mkdir_if_not_exists('.managed/cache');
    await mkdir_if_not_exists('.managed/cache/std');

    console.log('Cloning draft...');
    if(!existsSync('.managed/draft'))
        invoke('git clone https://github.com/cplusplus/draft .managed/draft');
    else
        invoke('cd .managed/draft; git fetch; cd -')
    console.log('Done.');

    console.log('Cloning cxxdraft-htmlgen...');
    if(!existsSync('.managed/cxxdraft-htmlgen'))
        invoke('git clone https://github.com/Eelis/cxxdraft-htmlgen .managed/cxxdraft-htmlgen');
    else
        invoke('cd .managed/cxxdraft-htmlgen; git fetch; cd -')
    console.log('Done.');
    await mkdir_if_not_exists('.managed/cxxdraft-htmlgen/.versions');

    invoke('./stack config set system-ghc --global true');

    // Build gen's HEAD once, to install GHC and build dependencies
    await build_eelis_gen();
    console.log('Setup done.');
    process.exit(0);
})();
