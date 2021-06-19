const express = require('express');


const router = express.Router();

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
]

router.get('/:pid', (req, res, next) => {
    const placeId = req.params.pid;
    const place = PLACES.find(place => {
        return place.id === placeId;
    });
    res.json({place});
});

router.get('/user/:uid', (req, res, next) => {
    const userId = req.params.uid;
    const place = PLACES.find(place => {
        return place.creator === userId;
    });
    res.json({place});
});

module.exports = router;