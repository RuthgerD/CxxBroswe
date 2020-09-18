const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const history = require('connect-history-api-fallback');
const bcrypt = require('bcrypt');
//const OAuthServer = require('express-oauth-server');

const User = require('./models/User.js');
const Diff = require('./models/Diff.js');
const Proposal = require('./models/Proposal.js');
const Standard = require('./models/Standard.js');

const mkcrud = require('./src/mkcrud.js')

const ObjectId = mongoose.Types.ObjectId;

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cxx-draft-browse';
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.set('useFindAndModify', false);
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true }, function(err) {
    if (err) {
        console.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
        console.error(err.stack);
        process.exit(1);
    }
    console.log(`Connected to MongoDB with URI: ${mongoURI}`);
});

const app = express();
// Parse requests of content-type 'application/json'
app.use(bodyParser.json());
// HTTP request logger
app.use(morgan('dev'));
// Enable cross-origin resource sharing for frontend must be registered before api
app.options('*', cors());
app.use(cors());

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
    res.json({'message': 'Welcome to your DIT341 backend ExpressJS project!'});
});

app.get('/api/version', async (req, res) => {
    res.json(1);
});

app.get('/api/id', async (req, res) => {
    res.json(ObjectId());
});

app.patch('/api/users/:uid/change_password', async (req, res) => {
    let user = await User.findById(req.params.uid).exec();
    user.passhash = await bcrypt.hash(req.body.password.toString(), 10);
    await user.save();
    return res.status(200).json({message: "Success"});
});

app.patch('/api/proposals/:pid/add_version/:vid', async (req, res) => {
    let proposal = await Proposal.findById(req.params.pid).exec();
    if(!ObjectId.isValid(req.params.vid))
        return res.status(400).json({message: 'Invalid ID'});
    proposal.versions = proposal.versions || [];
    proposal.versions.push(req.body);
    await proposal.save();
    return res.status(200).json({message: "Success"});
});

app.get('/api/users/:uid/proposals', async (req, res) => {
    const obj = (await Proposal.find({author: req.params.uid}, 'proposals').exec());
    return res.status(200).json(obj);
});

app.post('/api/users/:uid/proposals', async (req, res) => {
    let user = await User.findById(req.params.uid).exec();
    if (!user)
        return res.status(404).json({message: 'Object does not exist'});
    
    if(req.body._id !== undefined)
        return res.status(400).json({message: 'POST requests may not set "_id"'});
    
    req.body._id = ObjectId();
    req.body.author = req.params.uid;
    const obj = await new Proposal(req.body).save();
    
    user.proposals.push(obj._id);
    await user.save();
    
    return res.status(200).send(obj._id);
});

app.use('/api/users/:uid/proposals/:pid', async (req, res) => {
    try {
        switch(req.method) {
            case 'GET': {
                const obj = (await Proposal.find({_id: req.params.pid, author: req.params.uid}, 'proposals').exec())[0];
                return res.status(200).json(obj);
            } break;
            case 'DELETE': {
                let user = await User.findById(req.params.uid).exec();
                if (!user)
                    return res.status(404).json({message: 'Object does not exist'});

                await Proposal.findOneAndDelete({_id: req.params.pid, author: req.params.uid}).exec();
                
                user.proposals = user.proposals.filter(el => el != req.params.pid)
                user.save()

                return res.status(200).json(req.params.pid);
            } break;
            default:
                return res.status(405).json({message: 'Unsupported method'});
        }
    } catch(err) {
        console.log('Error: ', err);
        return res.status(400).send(err);
    }
});

mkcrud(app, User, '/api/users');
mkcrud(app, Diff, '/api/diffs');
mkcrud(app, Proposal, '/api/proposals');
mkcrud(app, Diff, '/api/standards');


app.use('/api/*', (req, res) => {
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
    console.error(err.stack);
    let err_res = {
        'message': err.message,
        'error': {}
    };
    if(env === 'development')
        err_res['error'] = err;
    res.status(err.status || 500);
    res.json(err_res);
});

app.listen(port, err =>  {
    if(err)
        throw err;
    console.log(`Express server listening on port ${port}, in ${env} mode`);
    console.log(`Backend: http://localhost:${port}/api/`);
    console.log(`Frontend (production): http://localhost:${port}/`);
});

module.exports = app;
