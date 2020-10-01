"use strict";
import Git from 'nodegit';
import { promises as fs, existsSync } from 'fs';
import { execFileSync, execSync } from 'child_process';

function invoke(command) {
    console.log('> ', command);
    execSync(command, {stdio: "inherit"});
}

(async () => {
    invoke('test -e ./stack || curl -sSL https://get.haskellstack.org/ | sh -s - -d "$(pwd)"');

    if(!existsSync('.managed'))
        await fs.mkdir('.managed');
    if(!existsSync('.managed/cache'))
        await fs.mkdir('.managed/cache');
    if(!existsSync('.managed/cache/std'))
        await fs.mkdir('.managed/cache/std');

    console.log('Cloning draft...');
    if(!existsSync('.managed/draft'))
        await Git.Clone.clone('https://github.com/cplusplus/draft', '.managed/draft');
    console.log('Done.');

    console.log('Cloning cxxdraft-htmlgen...');
    if(!existsSync('.managed/cxxdraft-htmlgen'))
        await Git.Clone.clone('https://github.com/Eelis/cxxdraft-htmlgen', '.managed/cxxdraft-htmlgen');
    console.log('Done.');

    console.log('Building...');
    console.log(`CWD: ${process.cwd()}`);
    console.log(`'./stack' exists: ${existsSync('./stack')}`);
    invoke('./stack config set system-ghc --global true');
    let stack_conf = await fs.readFile('.managed/cxxdraft-htmlgen/stack.yaml', {encoding: 'utf8'});
    stack_conf = stack_conf.replace(/resolver: lts-\d+\.\d+/, 'resolver: lts-14.27'); // GHC 8.6.5 is available on CI images
    await fs.writeFile('.managed/cxxdraft-htmlgen/stack.yaml', stack_conf, {encoding: 'utf8'});
    execFileSync(`${process.cwd()}/stack`, ["build"], {cwd: '.managed/cxxdraft-htmlgen', stdio: 'inherit'});
})();
