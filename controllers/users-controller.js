const { text } = require("body-parser");
const HttpError = require("../models/http-error");
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const USERS = [
    {
        id: 'u1',
        name: 'Max Schwarz',
        email: 'max@text.com',
        password: 'password',
    }
];
 
const getUsers = (req, res, next) => {
    res.json({ users: USERS});
};

const login = (req, res, next) => {
    const { email, password } = req.body;
    const identifiedUser = USERS.find(user => user.email === email);
    if (!identifiedUser || identifiedUser.password !== password) {
        throw new HttpError('Could not find account with that email', 401);
    } 
    res.json({ message: 'Logged In'});
};

const signup = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
     throw new HttpError('Invalid inputs passed, please check your data', 422);
    }
    const { name, email, password } = req.body;
    const alreadyUser = USERS.find(user => user.email === email);
    if (alreadyUser) {
        throw new HttpError('Account already exists with this email', 422);
    }
    const createdUser = {
        id: uuidv4(),
        name,
        email,
        password,
    }
    USERS.push(createdUser);
    res.status(201).json({ user: createdUser});
};


exports.getUsers = getUsers;
exports.login = login;
exports.signup = signup;