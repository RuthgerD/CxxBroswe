import getGhPatch from '../controllers/gh_patch.mjs'
import express from 'express';

const router = express.Router();
router.get('/:id', getGhPatch)

export default router