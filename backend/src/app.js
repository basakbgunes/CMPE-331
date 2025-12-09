const express = require("express");
const app = express();

app.use(express.json());

// ... your other imports / routes
const crewSelectionRoutes = require("./api/crewSelectionRoutes");

// prefix with /api or whatever you're using
app.use("/api", crewSelectionRoutes);

// export / listen as usual
module.exports = app;
