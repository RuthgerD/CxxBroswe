'use strict';
import * as AuthService from '../services/auth.mjs';
import express from 'express';

const authRouter = express.Router();
authRouter.post('/github', AuthService.loginGithub);

export default authRouter;