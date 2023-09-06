const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;
    try {
        place = await Place.findById(placeId);
    } catch {
        return next(new HttpError('Something went wrong, could not find a place.', 500));
    }

    if (!place) {
        return next(new HttpError('Could not find a place for the provided place id.', 404));
    } 

    res.json({place: place.toObject( { getters: true } ) });
}

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    let places;

    try {
        places = await Place.find({ creator: userId });
    } catch {
        return next(new HttpError('Fetching places failed, pleace try again', 500));
    }

    if (!places || places.length === 0) {
        return next(new HttpError('Could not find a place for the provided user id.', 404));
    } 

    res.json({places: places.map(place => place.toObject({ getters: true }) )} );
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
    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: 'https://lh3.googleusercontent.com/p/AF1QipOBBZgukGcL1DRhiwcJhYG_2o-1pPv5Wvs2M29B=s680-w680-h510',
        creator
    });

    try {
        await createdPlace.save();
    } catch {
        return next(new HttpError('Creating place failed, pleace try again.', 500));
    }

    res.status(201).json({ place: createdPlace.toObject( {getters: true} )});
}

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }
    
    const { title, description } = req.body;
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch {
        return next(new HttpError('Something went wrong, could not update place.', 500));
    }
    
    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch {
        return next(new HttpError('Something went wrong, could not update place.', 500));
    }

    res.status(200).json({ place: place.toObject( {getters: true} )});
};

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch {
        return next(new HttpError('Something went wrong, could not delete place.', 500));
    }
    console.log(place)
    try {
        await place.deleteOne();
    } catch {
        return next(new HttpError('Something went wrong, could not delete place.', 500));
    }

    res.status(200).json({ message: 'Deleted place'});
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;