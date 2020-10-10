import child_process from 'child_process';
import { promises as fs, existsSync } from 'fs';
import { promisify } from 'util';
import Agenda from 'agenda';
import Git from 'nodegit';
import touch from 'touch';
import git_utils from './git-utils.js';
import DraftCommitService from '../services/draft_commit.mjs';
import StandardService from '../services/standard.mjs';
import DiffService from '../services/diff.mjs';


const execFile = promisify(child_process.execFile);

let repo;
const agenda = new Agenda({db: {address: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agenda'}});

const invoke_eelis_gen = async () => {
    const env = process.env;
    env.PATH += `:${process.cwd()}/node_modules/mathjax-node-cli/bin/`;
    console.log('CWD: ', process.cwd());
    await execFile(`${process.cwd()}/stack`,
        ['exec', 'cxxdraft-htmlgen', '../draft'],
        {cwd: './.managed/cxxdraft-htmlgen', env, stdio: 'inherit'});
};

const import_draft_commits = async () => {
    repo = await Git.Repository.open('.managed/draft');
    const master_commit = await repo.getMasterCommit();
    const walker = repo.createRevWalk();
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
    const std = async (iso_name, name, hash) => {
        const aliasof = (await DraftCommitService.one({hash: hash}, '_id'))._id;
        if(await StandardService.one({name}) === null)
            await StandardService.create({name, aliasof, iso_name});
    };
    //await std('14', '1y', '6e84eb9183afc560edbed403f86809b67f3d916a');
    //await std('17', '1z', 'c92eb3a25a347c5f4b2f3fdb5e293c6f771e349c');
    //await std('20', '2a', 'be5fa97a402d817518b6ce8d0451874f289761c0');
    await std('HEAD', '2b', 'cdf68b3335a02a820273f53a9fa0cbb45c31016c');
};

const gen_to = async (out) => {
    await invoke_eelis_gen();
    await fs.rename('.managed/cxxdraft-htmlgen/14882', out);
};

const gen_all_static = async () => {
    const stds = await StandardService.list({}, '', ['aliasof']);
    for (const std of stds) {
        if(!existsSync(`.managed/cache/std/${std.iso_name}`)) {
            await git_utils.reset(std.aliasof.hash);
            await gen_to(`.managed/cache/std/${std.iso_name}`);
        }
    }
};

agenda.define('gen-cdhg', async job => {
    const { base, diffs, path } = job.attrs.data;
    try {
        await git_utils.reset(base);

        for(let i = 0; i < diffs.length; ++i)
            diffs[i] = await DiffService.get(diffs[i]);

        for(let i = 0; i < diffs.length; ++i)
            diffs[i] = await Git.Diff.fromBuffer(diffs[i].content, diffs[i].content.length);

        for (const diff of diffs)
            Git.Apply.apply(repo, diff, Git.Apply.LOCATION.INDEX, new Git.ApplyOptions());


        await gen_to(path);
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

const gen_dynamic = async (base, diffs) => {
    const path = path_for(base, diffs);
    console.log(path);
    if(existsSync(`${path}-FAILED`))
        return 'Failed';
    const pending_path = `${path}-PENDING`;
    if(existsSync(pending_path))
        return 'Pending';
    if(existsSync(path))
        return 'Exists';

    await touch(pending_path);
    agenda.now('gen-cdhg', {base, diffs, path});
    return 'Scheduled';
};

export default {
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
