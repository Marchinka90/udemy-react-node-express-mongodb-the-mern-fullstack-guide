const axios = require('axios');
const HttpError = require('../models/http-error');

const API_KEY = require('../../src/keys.json').googleMapKey;

async function getCoordsForAddress(address) {
    const resposne = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`);

    const data = resposne.data;

    if (!data || data.status === 'ZERO_RESULTS') {
        const error = new HttpError('Could not find location fot the spesific address.', 422);
        throw error;
    }

    const coordinates = data.results[0].geometry.location;

    return coordinates;
}   

module.exports = getCoordsForAddress;
