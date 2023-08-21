const { v4: uuid } = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');

let DUMMY_PLACES = [
    {
        id: 'p1',
        title: 'Empire State Bulding',
        description: 'One of the most famous scy scrapers in the world!',
        imageURL: 'https://lh3.googleusercontent.com/p/AF1QipOBBZgukGcL1DRhiwcJhYG_2o-1pPv5Wvs2M29B=s680-w680-h510',
        address: '20 W 34th St., New York, NY 10001',
        creator: 'u1',
        location: {
            lat: 40.748351,
            lng: -73.985885
        }
    },
    {
        id: 'p2',
        title: 'Emp Stateeeeee Buldingggggg',
        description: 'One of the most famous scy scrapers in the world!',
        imageURL: 'https://lh3.googleusercontent.com/p/AF1QipOBBZgukGcL1DRhiwcJhYG_2o-1pPv5Wvs2M29B=s680-w680-h510',
        address: '20 W 34th St., New York, NY 10001',
        creator: 'u1',
        location: {
            lat: 40.748351,
            lng: -73.985885
        }
    }
]

const getPlaceById = (req, res, next) => {
    const placeId = req.params.pid;
    const place = DUMMY_PLACES.find(p => p.id === placeId);

    if (!place) {
        throw new HttpError('Could not find a place for the provided place id.', 404);
    } 

    res.json({place: place});
}

const getPlacesByUserId = (req, res, next) => {
    const userId = req.params.uid;
    const place = DUMMY_PLACES.filter(p => p.creator === userId);

    if (!place || place.length === 0) {
        return next(new HttpError('Could not find a place for the provided user id.', 404));
    } 

    res.json({place: place});
}

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }

    const { title, description, address, creator } = req.body;

    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(error);
    }

    const createdPlace = {
        id: uuid(),
        title,
        description,
        location: coordinates,
        address,
        creator
    }

    DUMMY_PLACES.push(createdPlace);

    res.status(201).json({ place: createdPlace});
}

const updatePlace =  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;

    const updatePlace = {...DUMMY_PLACES.find(p => p.id === placeId) };
    const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);
    updatePlace.title = title;
    updatePlace.description = description;

    DUMMY_PLACES[placeIndex] = updatePlace

    res.status(200).json({ place: updatePlace});
};

const deletePlace =  (req, res, next) => {
    const placeId = req.params.pid;
    if (!DUMMY_PLACES.find(p => p.id == placeId)) {
        return next(new HttpError('Could not find a place for that id', 404));
    }
    DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);
    res.status(200).json({ message: 'Deleted place'});
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;