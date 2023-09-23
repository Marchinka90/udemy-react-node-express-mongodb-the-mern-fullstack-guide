const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (error) {
        return next(new HttpError('Signing up faild, please try again later.', 500));
    }
    
    const createdUser = new User({
        name,
        email,
        password: hashedPassword,
        image: req.file.path,
        places: []
    });

    try {
        await createdUser.save();
    } catch {
        return next(new HttpError('Signing up faild, please try again later.', 500));
    }

    let token;
    try {
        token = jwt.sign(
            { userId: createdUser.id, email: createdUser.email}, 
            process.env.JWT_KEY, 
            {expiresIn: '1h'}
        );
    } catch {
        return next(new HttpError('Signing up faild, please try again later.', 500));
    }

    res.status(201).json({userId: createdUser.id, email: createdUser.email, token: token});
}

const login = async (req, res, next) => {
    console.log(req.body)
    const { email, password } = req.body;

    let existingUser; 
    try {
        existingUser = await User.findOne({ email: email });
    } catch {
        return next(new HttpError('Logging in faild, please try again later.', 500)); 
    }

    if (!existingUser) {
        return next(new HttpError('Could not identify a user, credentials seem to be wrong.', 401));
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (error) {
        return next(new HttpError('Logging in faild, please check your credentials and try again.', 500));
    }

    if (!isValidPassword) {
        return next(new HttpError('Invalid credentials, could not log you in.', 401));
    }

    let token;
    try {
        console.log(process.env.DB_NAME);
        console.log(process.env.JWT_KEY);
        console.log(process.env.GOOGLE_API_KEY);
        token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email}, 
            process.env.JWT_KEY, 
            {expiresIn: '1h'}
        );
    } catch {
        return next(new HttpError('Logged in faild, please try again later.', 500));
    }

    res.status(201).json({userId: existingUser.id, email: existingUser.email, token: token});
}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;