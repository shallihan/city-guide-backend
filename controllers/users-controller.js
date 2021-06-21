const { text } = require("body-parser");

const HttpError = require("../models/http-error");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const User = require("../models/user");

const USERS = [
  {
    id: "u1",
    name: "Max Schwarz",
    email: "max@text.com",
    password: "password",
  },
];

const getUsers = (req, res, next) => {
  res.json({ users: USERS });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  const identifiedUser = USERS.find((user) => user.email === email);
  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError("Could not find account with that email", 401);
  }
  res.json({ message: "Logged In" });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs passed, please check your data", 422));
  }
  const { name, email, password, places } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Sign up failed.", 500);
    return next(error);
  }

  if (existingUser) {
    return next(
      new HttpError("User already exists, please login instead.", 422)
    );
  }

  const createdUser = new User({
    name,
    email,
    image:
      "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1639&q=80",
    password,
    places,
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Sign up failed", 500);
    return next(err);
  }
  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

exports.getUsers = getUsers;
exports.login = login;
exports.signup = signup;
