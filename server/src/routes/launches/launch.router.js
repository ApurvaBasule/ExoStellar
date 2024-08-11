const express = require('express');
const { httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch,
    httpGetLaunchWithId, } = require('./launch.controller');

const launchesRouter = express.Router();

launchesRouter.get('/', httpGetAllLaunches);

launchesRouter.get('/:id', httpGetLaunchWithId);

launchesRouter.post('/', httpAddNewLaunch);

launchesRouter.delete('/:id', httpAbortLaunch);

module.exports = {
    launchesRouter,
};