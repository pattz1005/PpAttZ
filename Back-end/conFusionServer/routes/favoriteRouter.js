const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');
const Favorites = require('../models/favorite');
var authenticate = require('../authenticate');
const f = require('session-file-store');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.find({})
            .populate('user')
            .populate('dishes')
            .then((Favorites) => {
                console.log(Favorites);
                res.statusCode = 200;
                res.setHeader('Content-type', 'application/json');
                res.json(Favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then((favorite) => {
                if (favorite == null) {
                    Favorites.create({ user: req.user._id })
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            for (const i in req.body) {
                                console.log(req.body[i]);
                                favorite.dishes.push(req.body[i]);
                            }
                            favorite.save()
                            res.json(favorite);
                        }, (err) => next(err));
                } else {
                    for (const i in req.body) {
                        console.log(req.body[i]);
                        Favorites.findOne({ user: req.user._id })
                            .then((oldFavorite) => {
                                if (oldFavorite == null) {
                                    console.log(req.body[i]);
                                    favorite.dishes.push(req.body[i]);
                                }
                            });
                    }
                    favorite.save();
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json')
                    res.json(favorite);
                }
            })
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /dishes');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });


favoriteRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.cors, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then((farovites) => {
                if (!favorites) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({ "exists": false, "favorites": favorites });
                }
                else {
                    if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({ "exists": false, "favorites": favorites });
                    }
                    else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({ "exists": true, "favorites": favorites });
                    }
                }
            }, (err) => {
                next(err)
            })
            .catch((err) => next(err))
    })
    .post(cors.corsWithOptions, (req, res, next) => {
        Favorites.findById(req.user._id)
            .then((favorite) => {
                if (favorite != null) {
                    favorite.dishes.push(req.params.dishId);
                    favorite.save()
                        .then((favorite) => {
                            Favorites.findById(favorite._id)
                                .populate('user')
                                .populate('dishes')
                                .then((favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-type', 'application/json');
                                    res.json(favorite);
                                })
                        })
                } else {
                    Favorites.create({ user: req.user._id, dishes: req.params.dishId })
                        .then((favorite) => {
                            console.log('favorite created ', favorite);
                            res.statusCode = 200;
                            res.setHeader('Content-type', 'application/json');
                            res.json(favorite);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }
            })
    })
    .put(cors.corsWithOptions, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites/' + req.params.dishId);
    })
    .delete(cors.corsWithOptions, (req, res, next) => {
        Favorites.findOneAndUpdate({ user: req.user._id }, { $pull: { dishes: req.params.dishId } }, function (err, data) {
            if (err) {
                return res.status(500).json({ 'Error': "error in deleting favorite" })
            }
            res.json(data)
        })
    });


module.exports = favoriteRouter;