"use strict";
import * as PageService from '../services/page.mjs';

export const listPages = async (req, res) => {
    const std = req.query.std;
    const diffs = JSON.parse(req.query.diffs);
    const pages = await PageService.listPages(std, diffs);
    if(!pages)
        return res.status(202).json({message: 'Pending build completion'});
    res.status(200).json(pages);
};

export const getPage = async (req, res) => {
    const std = req.query.std;
    const diffs = JSON.parse(req.query.diffs);
    const page = req.params.page;

    res.status(200).json(await PageService.getPage(page, std, diffs));
};
