const HttpError = require("../models/http-error");
const { v4: uuidv4 } = require('uuid');

let PLACES = [
  {
    id: "p1",
    title: "SQIRL Cafe",
    description:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Reiciendis, vitae?",
    location: {
      lat: 34.0844664,
      lng: -118.2866903,
    },
    address: "720 N Virgil Ave, Los Angeles, CA 90029, United States",
    creator: "u1",
  },
];

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = PLACES.find((place) => {
    return place.id === placeId;
  });
  if (!place) {
    throw new HttpError(
      "Could not find a place with the provided place ID.",
      404
    );
  }
  res.json({ place });
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = PLACES.filter((place) => {
    return place.creator === userId;
  });
  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find any places for the provided user ID.", 404)
    );
  }
  res.json({ places });
};

const createPlace = (req, res, next) => {
  const { title, description, coordinates, address, creator } = req.body;
  const createdPlace = {
    id: uuidv4(),
    title,
    description,
    location: coordinates,
    address,
    creator,
  };
  PLACES.push(createdPlace);

  res.status(201).json({ place: createdPlace});
};

const updatePlace = (req, res, next) => {
  const { title, description } = req.body;
  const placeId = req.params.pid;
  const updatedPlace = {...PLACES.find(place => place.id === placeId)};
  const placeIndex = PLACES.findIndex(place => place.id === placeId);
  updatedPlace.title = title;
  updatedPlace.description = description;
  PLACES[placeIndex] = updatedPlace;
  res.status(200).json({ place: updatedPlace});
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;
  PLACES = PLACES.filter(place => place.id !== placeId);
  res.status(200).json({ message: "Deleted"});
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
