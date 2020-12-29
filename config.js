require("dotenv").config({ path: ".env" });

const apiKey = process.env.API_KEY;
const port = process.env.PORT;

const config = {
    apiKey,
    port
};

module.exports = config;
