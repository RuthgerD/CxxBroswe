import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import morgan from 'morgan';
import path from 'path';
import cors from 'cors';
import history from 'connect-history-api-fallback';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const { ObjectId } = mongoose.Types;

import DiffRoute from './routes/diff.mjs';
import PageRoute from './routes/page.mjs';
import ProposalRoute from './routes/proposal.mjs';
import StandardRoute from './routes/standard.mjs';
import UserRoute from './routes/user.mjs';
import SettingsRoute from './routes/settings.mjs';
import AuthRoute from './routes/auth.mjs';

import { authoriseRequest } from './services/auth.mjs';
import ghPatchRoute from './routes/gh_patch.mjs'

import ProposalService from './services/proposal.mjs';

import operations from './src/operations.mjs';

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cxx-draft-browse';
const port = process.env.PORT || 3000;
const domain = process.env.BACK_END_DOMAIN || 'dev.cxxbroswe.xyz';

// Connect to MongoDB
mongoose.set('useFindAndModify', false);
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true }, function (err) {
    if (err) {
        console.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
        console.error(err.stack);
        process.exit(1);
    }
    console.log(`Connected to MongoDB with URI: ${mongoURI}`);
});

const app = express();

(async () => {
    await operations.import_draft_commits();
    await operations.import_standard_hashes();
    await operations.gen_all_static();
    console.log('Init done');

    dotenv.config()
    // Parse requests of content-type 'application/json'
    app.use(bodyParser.json());
    // HTTP request logger
    app.use(morgan('dev'));
    // Enable cross-origin resource sharing for frontend must be registered before api
    app.options('*', cors());
    app.use(cors());

    app.use(function(req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });

    app.get('/api', async (req, res) => {
        res.json({ 'message': 'Welcome to your DIT341 backend ExpressJS project!' });
    });

    app.get('/api/version', async (req, res) => {
        res.json(1);
    });

    app.use('/auth', AuthRoute);
    app.use('/api/diffs', DiffRoute);
    app.use('/api/pages', PageRoute);
    app.use('/api/proposals', ProposalRoute);
    app.use('/api/standards', StandardRoute);
    app.use('/api/users', authoriseRequest, UserRoute);
    app.use('/api/settings', authoriseRequest, SettingsRoute);
    app.use('/api/gh_patch', ghPatchRoute)

    app.use('/api/*', (req, res) => {
        res.status(404).json({ 'message': 'Not Found' });
    });

    app.use('/auth/*', async (req, res) => {
        res.status(404).json({ 'message': 'Not Found' });
    });



    // Configuration for serving frontend in production mode
    // Support Vuejs HTML 5 history mode
    app.use(history());
    // Serve static assets
    const root = path.normalize(__dirname + '/..');
    const client = path.join(root, 'client', 'dist');
    app.use(express.static(client));

    // Error handler (i.e., when exception is thrown) must be registered last
    const env = app.get('env');
    // eslint-disable-next-line no-unused-vars
    app.use((err, req, res, next) => {
        void (next);
        console.error(err.stack);
        let err_res = {
            'message': err.message,
            'error': {}
        };
        if (env === 'development')
            err_res['error'] = err;
        res.status(err.status || 500);
        res.json(err_res);
    });

    app.listen(port, err => {
        if (err)
            throw err;
        console.log(`Express server listening on port ${port}, in ${env} mode`);
        console.log(`Backend: http://${domain}:${port}/api/`);
        console.log(`Frontend (production): http://${domain}:${port}/`);
    });

})();

export default app;
