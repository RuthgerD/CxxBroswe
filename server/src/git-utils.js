const Git = require('nodegit');

const reset = async (commit) => {
    const repo = await Git.Repository.open('.managed/draft');
    commit = await Git.Commit.lookup(repo, commit);
    const res = Git.Reset.reset(repo, commit, Git.Reset.TYPE.HARD, {});
    res.catch(err => {
        throw err;
    });
};

module.exports = {
    reset
};
