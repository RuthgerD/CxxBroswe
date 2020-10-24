import { execFile, spawn } from 'promisify-child-process';
import {  execSync, execFileSync, spawnSync } from 'child_process';
import { promises as fs, existsSync } from 'fs';
import Agenda from 'agenda';
import touch from 'touch';
import DraftCommitService from '../services/draft_commit.mjs';
import StandardService from '../services/standard.mjs';
import DiffService from '../services/diff.mjs';


function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

let draft_repo;
const agenda = new Agenda({db: {address: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agenda'}});
const stack_path = `${process.cwd()}/stack`;

export const force_override_resolver = async () => {
    let stack_conf = await fs.readFile(`${process.cwd()}/.managed/cxxdraft-htmlgen/stack.yaml`, {encoding: 'utf8'});
    stack_conf = stack_conf.replace(/resolver: lts-\d+\.\d+/, 'resolver: lts-16.19'); // GHC 8.6.5 is available on CI images
    console.log('Forcing local stack config: ', stack_conf);
    await fs.writeFile(`${process.cwd()}/.managed/cxxdraft-htmlgen/stack.yaml`, stack_conf, {encoding: 'utf8'});
};

export const build_eelis_gen = async (gen_sha) => {
    if(gen_sha === undefined)
        gen_sha = (await spawn('git', ['rev-parse', 'master'], {cwd: '.managed/cxxdraft-htmlgen', encoding: 'utf8'})).stdout;

    const out_path = `${process.cwd()}/.managed/cxxdraft-htmlgen/.versions/${gen_sha}`;
    if(existsSync(out_path))
        return out_path + '/cxxdraft-htmlgen';
    await fs.mkdir(out_path);

    console.log('Resetting...');
    await spawnSync('git', ['reset', gen_sha], {cwd: '.managed/cxxdraft-htmlgen'});
    console.log('Done.');
    await force_override_resolver();
    console.log('Building...');
    execSync(`${stack_path} config set system-ghc --global true`);
    await sleep(7000);
    execFileSync(`${process.cwd()}/stack`,
        ['build', '--system-ghc', '--copy-bins', '--local-bin-path', out_path, './'],
        {cwd: '.managed/cxxdraft-htmlgen', stdio: 'inherit'});
    console.log('Done.');
    return out_path + '/cxxdraft-htmlgen';
};

const invoke_eelis_gen = async (location) => {
    const env = process.env;
    env.PATH += `:${process.cwd()}/node_modules/mathjax-node-cli/bin/`;
    console.log('CWD: ', process.cwd());
    await execFile(location,
        ['../draft'],
        {cwd: './.managed/cxxdraft-htmlgen', env, stdio: 'inherit'});
};

const import_draft_commits = async () => {
    const block_size = 128;
    const total = parseInt((await spawn('git', ['rev-list', '--count', 'master'], {cwd: '.managed/draft', encoding: 'utf8'})).stdout);
    let count = 0;
    while (count < total && /** ONLY LIST ALL COMMITS ON A PERMANENT INSTALLATION **/ count < 1024) {
        const commits =
            (await spawn('git', ['--no-pager', 'log', '--reverse', '--oneline', `--skip=${(count += block_size, count - block_size)}`, `-n${block_size}`, 'master'], {cwd: '.managed/draft', encoding: 'utf8'})).stdout
                .toString()
                .split(/\n|\r\n|\r/)
                .map(s => s.split(' ')[0])
                .filter(s => (s.length > 0));

        for(const hash of commits) {
            if(await DraftCommitService.one({hash}) === null)
                await DraftCommitService.create({
                    hash,
                    content: (await spawn('git', ['format-patch', '--stdout', '-1', '--', hash], {cwd: '.managed/draft', encoding: 'utf8', maxBuffer: 1024*1024})).stdout
                });
        }
    }
};

const import_standard_hashes = async () => {
    const std = async (iso_name, name, draft_sha, gen_sha) => {
        const aliasof = (await DraftCommitService.one({hash: draft_sha}, '_id'))._id;
        if(await StandardService.one({name}) === null)
            await StandardService.create({name, aliasof, iso_name, gen_sha});
    };
    await std('20', '2a', 'be5fa97a', '27d1ecca36e68b75c7b31552458eddcbf7a6f14e');
    await std('HEAD', '2b','c19ff876', 'f197e366e044b4c07e2cc711a5b18b71ce4f73b5');
};

const gen_to = async (out, gen_sha) => {
    const loc = await build_eelis_gen(gen_sha);
    await invoke_eelis_gen(loc);
    await fs.rename('.managed/cxxdraft-htmlgen/14882', out);
};

const gen_all_static = async () => {
    const stds = await StandardService.list({}, '', ['aliasof']);
    for (const std of stds) {
        if(!existsSync(`.managed/cache/std/${std.iso_name}`)) {
            spawnSync('git', ['reset', std.aliasof.hash, {cwd: '.managed/draft'}]);
            await gen_to(`.managed/cache/std/${std.iso_name}`, std.gen_sha);
        }
    }
};

agenda.define('gen-cdhg', async job => {
    const { base, diffs, path } = job.attrs.data;
    try {
        await spawn('git', ['reset', base], {cwd: '.managed/draft'});

        const commit = await DraftCommitService.one({hash: base}, '_id');
        if(!commit)
            throw new Error('Unknown base commit' + base);
        const res = await StandardService.one({aliasof: commit._id}, 'gen_sha');
        if(!res || !res.gen_sha)
            throw new Error('Unsupported base commit' + base);

        for (const diff of diffs)
            await spawn('git', ['patch', '-'], {cwd: '.managed/draft', input: await DiffService.get(diff)});

        await gen_to(path, res.gen_sha);
    } catch (err) {
        console.log(err);
        await touch(`${path}-FAILED`);
        return 'Failed';
    } finally {
        await fs.unlink(`${path}-PENDING`);
    }
});

const path_for = (base, diffs) => {
    return `.managed/cache/${base}${diffs.length > 0 ? '+' + diffs.map(s => (s + ',')).reduce((a, b) => (a + b)) : ''}`
};

const gen_dynamic = async (std, diffs) => {
    const path = path_for(std, diffs);
    console.log(path);
    if(existsSync(`${path}-FAILED`))
        return 'Failed';
    const pending_path = `${path}-PENDING`;
    if(existsSync(pending_path))
        return 'Pending';
    if(existsSync(path))
        return 'Exists';

    await touch(pending_path);
    agenda.now('gen-cdhg', {base: std, diffs, path});
    return 'Scheduled';
};

export default {
    invoke_eelis_gen,
    import_draft_commits,
    import_standard_hashes,
    gen_all_static,
    gen_to,
    path_for,
    gen_dynamic
};

(async () => {
    await agenda.start();
})();
