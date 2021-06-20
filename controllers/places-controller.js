const HttpError = require('../models/http-error');

const PLACES = [
    {
        id: 'p1',
        title: 'SQITL Cafe',
        description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Reiciendis, vitae?',
        location : {
            lat: 34.0844664,
            lng: -118.2866903,
        },
        address: '720 N Virgil Ave, Los Angeles, CA 90029, United States',
        creator: 'u1'
    }
];

const getPlaceById = (req, res, next) => {
    const placeId = req.params.pid;
    const place = PLACES.find(place => {
        return place.id === placeId;
    });
    if(!place) {
        throw new HttpError("Could not find a place with the provided place ID.", 404);
    }
    res.json({place});
};

const getPlaceByUserId = (req, res, next) => {
    const userId = req.params.uid;
    const place = PLACES.find(place => {
        return place.creator === userId;
    });
    if(!place) {
        return next(new HttpError("Could not find a place for the provided user ID.", 404));
    }
    res.json({place});
};


exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;