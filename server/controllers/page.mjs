"use strict";
import * as PageService from '../services/page.mjs';

export const listPages = async (req, res) => {
    const std = req.query.std;
    const diffs = req.query.diffs ? JSON.parse(req.query.diffs) : [];
    const pages = await PageService.listPages(std, diffs);
    if(!pages)
        return res.status(202).json({message: 'Pending build completion'});
    res.status(200).json(pages);
};

export const getPage = async (req, res) => {
    const std = req.query.std;
    const diffs = req.query.diffs ? JSON.parse(req.query.diffs) : [];
    const page = req.params.page;
    PageService.getPage(page, std, diffs)
    .then(ret => res.status(200).json(ret))
    .catch(err => res.status(404).json(err));
};
