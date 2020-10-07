import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import morgan from 'morgan';
import path from 'path';
import cors from 'cors';
import history from 'connect-history-api-fallback';
//import OAuthServer from 'express-oauth-server';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const { ObjectId } = mongoose.Types;

import DiffRoute from './routes/diff.mjs';
import PageRoute from './routes/page.mjs';
import ProposalRoute from './routes/proposal.mjs';
import StandardRoute from './routes/standard.mjs';
import UserRoute from './routes/user.mjs';
import auth from './routes/auth.js';

import ProposalService from './services/proposal.mjs';

import operations from './src/operations.mjs';

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cxx-draft-browse';

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

    // Parse requests of content-type 'application/json'
    app.use(bodyParser.json());
    // HTTP request logger
    app.use(morgan('dev'));
    // Enable cross-origin resource sharing for frontend must be registered before api
    app.options('*', cors());
    app.use(cors());

    // Import routes
    /*
    const authorize = app.oauth.authorize();
    app.use((req, res, next) => {
        if(req.method != 'GET')
            authorize(req, res, next);
        else
        next();
    });
    */

    app.get('/api', async (req, res) => {
        res.json({ 'message': 'Welcome to your DIT341 backend ExpressJS project!' });
    });

    app.get('/api/version', async (req, res) => {
        res.json(1);
    });

    //Auth
    app.use('/auth', auth);

    app.patch('/api/proposals/:pid/add_version/:vid', async (req, res) => {
        let proposal = await ProposalService.get(req.params.pid);
        if (!proposal)
            return res.status(404).json({ message: 'Object does not exist' });
        if (!ObjectId.isValid(req.params.vid))
            return res.status(400).json({ message: 'Invalid ID' });
        proposal.versions = proposal.versions || [];
        proposal.versions.push(req.params.vid);
        await proposal.save();
        return res.status(200).json({ message: 'Success' });
    });

    app.use('/api/diffs', DiffRoute);
    app.use('/api/pages', PageRoute);
    app.use('/api/proposals', ProposalRoute);
    app.use('/api/standards', StandardRoute);
    app.use('/api/users', UserRoute);


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
        console.log(`Backend: http://localhost:${port}/api/`);
        console.log(`Frontend (production): http://localhost:${port}/`);
    });

})();

export default app;
