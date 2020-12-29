require("dotenv").config({ path: ".env" });

const apiKey = process.env.API_KEY;

const config = {
    apiKey
};

module.exports = config;
