const mongoose = require("mongoose");
const HttpError = require("../models/http-error");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const getCoordinatesForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");


const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place with the provided place ID.",
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      "Could not find a place with the provided place ID.",
      404
    );
    return next(error);
  }
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let places;
  try {
  places = await Place.find({ creator: userId });
  } catch (err) {
    const error = new HttpError("Could not find any places for the provided user ID.", 500);
    return next(error);
  }
  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find any places for the provided user ID.", 404)
    );
  }
  res.json({ places: places.map(place => place.toObject({ getters: true})) });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }
  const { title, description, address, creator } = req.body;
  let coordinates;
  try {
    coordinates = await getCoordinatesForAddress(address);
  } catch (error) {
    return next(error);
  }
  const createdPlace = new Place({
    title,
    description,
    image:
      "https://images.unsplash.com/photo-1445865272827-4894eb9d48de?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1650&q=80",
    address,
    location: coordinates,
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    return next(new HttpError('Creating a place failed', 500));
  }

  if(!user) {
    return next(new HttpError('Could not find user for provided id', 404));
  }

  console.log(user);

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await createdPlace.save({ session: session });
    user.places.push(createdPlace);
    await user.save({ session: session });
    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError("Creating place, failed", 500);
    return next(err);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs passed, please check your data", 422));
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place with the provided place ID.",
      500
    );
    return next(error);
  }
  place.title = title;
  place.description = description;
  try {
    await place.save();
  } catch (err) {
    const error = new HttpError('Something went wrong, could not update place', 500);
    return next(error);
  }
  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError('Something went wrong, could not delete place', 500);
    return next(error);
  }

  try {
    await place.remove();
  } catch (err) {
    const error = new HttpError('Something went wrong, could not delete place', 500);
    return next(error);
  }

  res.status(200).json({ message: "Deleted" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
