const dotenv = require('dotenv');
dotenv.config(); 
const app = require('./app');
const http = require('http');
const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchData } = require('./models/launches.model');
const {mongoConnect} = require('./services/mongo');

const server = http.createServer(app);

const PORT = process.env.PORT || 7000;

async function startServer() {
  try {
    // Connect to MongoDB first
    await mongoConnect();
    // planets data loads after the connection is established 
    await loadPlanetsData();
   // launches data is loaded from SpaceX api 
    await loadLaunchData();
    // Start the server
    server.listen(PORT, () => {
      console.log(`Listening on PORT ${PORT}....`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
}

startServer();

