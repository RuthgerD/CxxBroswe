import express from 'express';
import * as PageController from '../controllers/page.mjs';

const router = express.Router();
router.get('/', PageController.listPages);
router.get('/:page', PageController.getPage);

export default router;
