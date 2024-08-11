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
    // Load planets data after the connection is established 
    await loadPlanetsData();
   //load launches data from SpaceX api after the connection is estamblished
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

