const { parse } = require('csv-parse'); //third party modules
const fs = require('fs');// built in modules
const path = require('path');

const planets = require('./planets.mongo') //planets collection

//const habitablePlanets = [];

function isHabitablePlanet(planet) {
  return planet['koi_disposition'] === 'CONFIRMED'
    && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
    && planet['koi_prad'] < 1.6;
}

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    const savedPlanets=[];
    fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv'))
      .pipe(parse({
        comment: '#',
        columns: true,
      }))
      .on('data', (data) => {
        if (isHabitablePlanet(data)) {
          savedPlanets.push(savePlanet(data));
          //habitablePlanets.push(data);
        }
      })
      .on('error', (err) => {
        console.log(err);
        reject(err);
      })
      .on('end', async() => {
        try {
          await Promise.all(savedPlanets);
          const countPlanetsFound = (await getAllPlanets()).length;
          console.log(`${countPlanetsFound} habitable planets found!!!`);
          resolve(); // Resolve is called after successful async operations
        } catch (error) {
          reject(error); // Reject in case of any error
        }
      });
  })}

  async function getAllPlanets(){
    return await planets.find({},{ _id: 0, __v: 0 });
  }

  async function savePlanet(planet) {
    try {
      await planets.updateOne(
        { keplerName: planet.keplerName },
        { keplerName: planet.keplerName },
        { upsert: true }
      );
    } catch (err) {
      console.error(`Could not save planet ${err}`);
    }
  }

module.exports = {
loadPlanetsData,
getAllPlanets,
}