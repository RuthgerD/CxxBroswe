"use strict";
import { promises as fs, existsSync } from 'fs';
import operations from '../src/operations.mjs';

export const listPages = async (std, diffs) => {
    let dir;
    if(std) {
        dir = `./.managed/cache/std/${std}`;
        if(!existsSync(dir))
            throw Error("Standard does not exist");
    } else {
        dir = operations.path_for('cdf68b3335a02a820273f53a9fa0cbb45c31016c', diffs);
        switch(await operations.gen_dynamic('cdf68b3335a02a820273f53a9fa0cbb45c31016c', diffs)) {
            case 'Scheduled':
            case 'Pending':
                return null;
            case 'Failed':
                throw Error('Build has failed');
            case 'Exists':
        }
    }
    const names = await fs.readdir(dir);
    return names.filter(e => e.endsWith('.html')).map(e => e.slice(0, -5));
};


export const getPage = async (page, std, diffs) => {
    let dir_path;
    if(std)
        dir_path = `./.managed/cache/std/${std}`;
    else
        dir_path = operations.path_for('cdf68b3335a02a820273f53a9fa0cbb45c31016c', diffs);

    if(!existsSync(dir_path))
        throw Error("Build does not exist");

    const page_path = `${dir_path}/${page}.html`;
    if(!existsSync(page_path))
        throw Error("Page does not exist");
    return await fs.readFile(page_path, {encoding: 'utf-8'});
};
