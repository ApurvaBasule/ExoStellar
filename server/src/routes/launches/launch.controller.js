const {
  isLaunchWithId,
  getAllLaunches,
  addNewLaunch,
  abortLaunchWithId,
} = require('../../models/launches.model');
const { getPagination } = require('../../services/query');


async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  return res.status(200).json(await getAllLaunches(skip, limit));
}

async function httpGetLaunchWithId(req, res) {
  const launchId = Number(req.params.id);

  const launch = await isLaunchWithId(launchId);
  if (!launch) {
    return res.status(404).json({ error: 'Launch not found' });
  }
  return res.status(200).json(launch);

}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;
  //error check 1
  if (!launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target) {
    return res.status(400).json({
      error: "Missing launch info",
    });
  }
  //error check 2
  launch.launchDate = new Date(launch.launchDate);
  if (launch.launchDate.toString() === 'Invalid Date') {
    return res.status(400).json({
      error: "Invalid launch date",
    });
  }
  //no errors add the launch!
  await addNewLaunch(launch);
  return res.status(201).json(launch);
}


async function httpAbortLaunch(req, res) {
  const launchId = Number(req.params.id);
  const is_exist = await isLaunchWithId(launchId);
  if (!is_exist) {
    return res.status(404).json({
      error: 'Launch not found',
    });
  }
  const aborted = await abortLaunchWithId(launchId);
  if (aborted) {
    return res.status(200).json({
      success: 'Launch aborted',
      ok: true,
    });
  } else {
    return res.status(400).json({
      error: 'Launch not aborted',
      ok: false,
    })
  }
}



module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
  httpGetLaunchWithId,
};