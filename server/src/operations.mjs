import { execFile as legacyExecFile, execSync, execFileSync } from 'child_process';
import { promises as fs, existsSync } from 'fs';
import { promisify } from 'util';
import Agenda from 'agenda';
import Git from 'nodegit';
import touch from 'touch';
import git_utils from './git-utils.js';
import DraftCommitService from '../services/draft_commit.mjs';
import StandardService from '../services/standard.mjs';
import DiffService from '../services/diff.mjs';


const execFile = promisify(legacyExecFile);

let draft_repo;
const agenda = new Agenda({db: {address: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agenda'}});
const stack_path = `${process.cwd()}/stack`;

export const force_override_resolver = async () => {
    let stack_conf = await fs.readFile(`${process.cwd()}/.managed/cxxdraft-htmlgen/stack.yaml`, {encoding: 'utf8'});
    stack_conf = stack_conf.replace(/resolver: lts-\d+\.\d+/, 'resolver: lts-14.27'); // GHC 8.6.5 is available on CI images
    console.log('Forcing local stack config: ', stack_conf);
    await fs.writeFile(`${process.cwd()}/.managed/cxxdraft-htmlgen/stack.yaml`, stack_conf, {encoding: 'utf8'});
};

export const guess_best_gen_sha = async (draft_sha) => {
    let target_date = new Date((await Git.Commit.lookup(draft_repo, draft_sha)).date().setHours(0, 0, 0, 0));
    console.log('Target date: ', target_date.toISOString());

    const gen_repo = await Git.Repository.open(`${process.cwd()}/.managed/cxxdraft-htmlgen`);
    const walker = gen_repo.createRevWalk();
    walker.push((await gen_repo.getMasterCommit()).id());
    walker.sorting(Git.Revwalk.SORT.TIME);

    let last = null;
    do {
        const trail = await walker.getCommits(1);
        last = trail[0];
        console.log('Option:', last.date());
    } while(last.date() >= target_date);
    console.log(`Using generator ${last.sha()} for draft ${draft_sha}`);
    return last.sha();
};

export const build_eelis_gen = async (gen_sha) => {
    const gen_repo = await Git.Repository.open(`${process.cwd()}/.managed/cxxdraft-htmlgen`);
    if(gen_sha === undefined)
        gen_sha = (await gen_repo.getMasterCommit()).sha();

    const out_path = `${process.cwd()}/.managed/cxxdraft-htmlgen/.versions/${gen_sha}`;
    if(existsSync(out_path))
        return out_path + '/cxxdraft-htmlgen';
    await fs.mkdir(out_path);

    console.log('Resetting...');
    await git_utils.reset(gen_sha, gen_repo);
    console.log('Done.');
    await force_override_resolver();
    console.log('Building...');
    execSync(`${stack_path} config set system-ghc --global true`);
    execFileSync(`${process.cwd()}/stack`,
        ['build', '--copy-bins', '--local-bin-path', out_path, './'],
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
    draft_repo = await Git.Repository.open('.managed/draft');
    const master_commit = await draft_repo.getMasterCommit();
    const walker = draft_repo.createRevWalk();
    walker.push(master_commit.id());
    walker.sorting(Git.Revwalk.SORT.TIME);
    const commits = await walker.getCommits(Infinity);
    for (const commit of commits) {
        const hash = commit.sha();
        if(await DraftCommitService.one({hash}) === null)
            await DraftCommitService.create({hash, content: commit.body()});
    }
};

const import_standard_hashes = async () => {
    const std = async (iso_name, name, draft_sha, gen_sha) => {
        const aliasof = (await DraftCommitService.one({hash:draft_sha}, '_id'))._id;
        if(await StandardService.one({name}) === null)
            await StandardService.create({name, aliasof, iso_name, gen_sha});
    };
    //await std('14', '1y', '6e84eb9183afc560edbed403f86809b67f3d916a');
    //await std('17', '1z', 'c92eb3a25a347c5f4b2f3fdb5e293c6f771e349c', '27d1ecca36e68b75c7b31552458eddcbf7a6f14e');
    await std('20', '2a', 'be5fa97a402d817518b6ce8d0451874f289761c0', '27d1ecca36e68b75c7b31552458eddcbf7a6f14e');
    await std('HEAD', '2b','c19ff8763500ac0f576b80c46e120d286ca5e8d5', 'f197e366e044b4c07e2cc711a5b18b71ce4f73b5');
};

const gen_to = async (out, gen_sha) => {
    //const loc = await build_eelis_gen(await guess_best_gen_sha(draft_sha));
    const loc = await build_eelis_gen(gen_sha);
    await invoke_eelis_gen(loc);
    await fs.rename('.managed/cxxdraft-htmlgen/14882', out);
};

const gen_all_static = async () => {
    const stds = await StandardService.list({}, '', ['aliasof']);
    for (const std of stds) {
        if(!existsSync(`.managed/cache/std/${std.iso_name}`)) {
            await git_utils.reset(std.aliasof.hash);
            await gen_to(`.managed/cache/std/${std.iso_name}`, std.gen_sha);
        }
    }
};

agenda.define('gen-cdhg', async job => {
    const { base, diffs, path } = job.attrs.data;
    try {
        await git_utils.reset(base);

        let gen_sha;
        switch (base) {
            case 'c19ff8763500ac0f576b80c46e120d286ca5e8d5':
                gen_sha = 'f197e366e044b4c07e2cc711a5b18b71ce4f73b5';
                break;
            case 'be5fa97a402d817518b6ce8d0451874f289761c0':
                gen_sha = '27d1ecca36e68b75c7b31552458eddcbf7a6f14e';
                break;
            default:
                throw new Error('Unsupported base commit');
        }

        for(let i = 0; i < diffs.length; ++i)
            diffs[i] = await DiffService.get(diffs[i]);

        for(let i = 0; i < diffs.length; ++i)
            diffs[i] = await Git.Diff.fromBuffer(diffs[i].content, diffs[i].content.length);

        for (const diff of diffs)
            Git.Apply.apply(draft_repo, diff, Git.Apply.LOCATION.WORKDIR, new Git.ApplyOptions());

        await gen_to(path, gen_sha);
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
    agenda.now('gen-cdhg', {std, diffs, path});
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
