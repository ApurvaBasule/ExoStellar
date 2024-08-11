const axios = require('axios');
const launches = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 0;
const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

// Helper function to handle errors
function handleError(message, error) {
  throw new Error(`${message}: ${error.message}`);
}

// Populates the database with SpaceX launch data
async function populateLaunches() {
  try {
    const { status, data } = await axios.post(SPACEX_API_URL, {
      query: {},
      options: {
        pagination: false,
        populate: [
          { path: 'rocket', select: { name: 1 } },
          { path: 'payloads', select: { customers: 1 } }
        ]
      }
    });

    if (status !== 200) {
      return handleError('Launch data download failed');
    }

    const launchDocs = data.docs;
    for (const launchDoc of launchDocs) {
      const customers = launchDoc.payloads.flatMap(payload => payload.customers);

      const launch = {
        flightNumber: launchDoc.flight_number,
        mission: launchDoc.name,
        rocket: launchDoc.rocket.name,
        launchDate: launchDoc.date_local,
        upcoming: launchDoc.upcoming,
        success: launchDoc.success,
        customers,
      };

      await saveLaunch(launch);
    }
  } catch (error) {
    handleError('Problem downloading launch data', error);
  }
}

// Loads SpaceX launch data if not already loaded
async function loadLaunchData() {
  const firstLaunch = await findLaunch({ flightNumber: 1, rocket: 'Falcon 1', mission: 'FalconSat' });

  if (!firstLaunch) {
    await populateLaunches();
  }
}

// Finds a specific launch based on a filter
async function findLaunch(filter) {
  return launches.findOne(filter);
}

// Checks if a launch with a specific ID exists
async function isLaunchWithId(launchId) {
  return findLaunch({ flightNumber: launchId });
}

// Gets the latest flight number
async function getLatestFlightNumber() {
  const latestLaunch = await launches.findOne().sort('-flightNumber');
  return latestLaunch ? latestLaunch.flightNumber : DEFAULT_FLIGHT_NUMBER;
}

// Retrieves all launches with pagination
async function getAllLaunches(skip, limit) {
  return launches.find({}, { _id: 0, __v: 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

// Adds a new launch to the database
async function addNewLaunch(launch) {
  try {
    const planet = await planets.findOne({
      keplerName: new RegExp(`^${launch.target}$`, 'i'),
    });

    if (!planet) {
      throw new Error(`Target planet "${launch.target}" does not exist`);
    }

    const newLaunch = {
      ...launch,
      success: true,
      upcoming: true,
      customers: ['Zero to Mastery', 'NASA'],
      flightNumber: await getLatestFlightNumber() + 1,
    };

    await saveLaunch(newLaunch);
  } catch (error) {
    handleError('Error adding new launch', error);
  }
}

// Saves a launch to the database
async function saveLaunch(launch) {
  try {
    const result = await launches.findOneAndUpdate(
      { flightNumber: launch.flightNumber },
      { $set: launch },
      { upsert: true, returnDocument: 'after' }
    );

    if (!result) {
      throw new Error('Failed to save launch');
    }
  } catch (error) {
    handleError('Failed to save launch', error);
  }
}

// Aborts a specific launch by ID
async function abortLaunchWithId(launchId) {
  const result = await launches.updateOne(
    { flightNumber: launchId },
    { $set: { upcoming: false, success: false } }
  );

  return result.modifiedCount === 1;
}

module.exports = {
  loadLaunchData,
  isLaunchWithId,
  getAllLaunches,
  addNewLaunch,
  abortLaunchWithId,
};
