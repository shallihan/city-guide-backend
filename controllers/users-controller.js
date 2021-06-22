const { text } = require("body-parser");
const { validationResult } = require("express-validator");
const bcrypt = require('bcrypt');
const HttpError = require("../models/http-error");
const User = require("../models/user");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    return next(new HttpError("Fetching users failed", 500));
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Login failed.", 500);
    return next(error);
  }

  if (!existingUser) {
    return next(
      new HttpError("Invalid credentials, could not log you in", 401)
    );
  }

  let isValidPassword = false;
  try {
  isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new Error('Could not log you in, please check your credentials.', 500);
    return next(err);
  }

  if(!isValidPassword) {
    return next(
      new HttpError("Invalid credentials, could not log you in", 401)
    );
  }

  res.json({
    message: "Logged In",
    user: existingUser.toObject({ getters: true }),
  });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }
  const { name, email, password } = req.body;

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

  let hashedPassword;
  try {
  hashedPassword = await bcrypt.hash(password, 12);
  } catch(err) {
    const error = new Error('Could not create user, please try again', 500);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: [],
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
