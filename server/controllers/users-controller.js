const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const getUsers = async (req, res, next) => {
    let users; 
    try {
        users = await User.find({}, '-password');
    } catch {
        return next(new HttpError('Fetching users failed, please try again later.', 500)); 
    }

    res.json({users: users.map(user => user.toObject({ getters: true }) )});
}

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }
    
    const { name, email, password } = req.body; 

    let existingUser; 
    try {
        existingUser = await User.findOne({ email: email });
    } catch {
        return next(new HttpError('Signing up faild, please try again later.', 500)); 
    }
        
    if (existingUser) {
        return next(new HttpError('User exists alreday, please login instead.', 422)); 
    }
    
    const createdUser = new User({
        name,
        email,
        password,
        image: 'https://live.staticflickr.com/7631/26849088292_36fc52ee90_b.jpg',
        places: []
    });

    try {
        await createdUser.save();
    } catch {
        return next(new HttpError('Signing up faild, please try again later.', 500));
    }

    res.status(201).json({user: createdUser.toObject( {getters: true} )});
}

const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser; 
    try {
        existingUser = await User.findOne({ email: email });
    } catch {
        return next(new HttpError('Logging in faild, please try again later.', 500)); 
    }

    if (!existingUser || existingUser.password !== password) {
        return next(new HttpError('Could not identify a user, credentials seem to be wrong.', 401));
    }

    res.status(201).json({message: 'Logged in!', user: existingUser.toObject( {getters: true} )});
}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;