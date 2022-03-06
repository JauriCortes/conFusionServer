const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const promos = require('../models/promotions');

const PromoRouter = express.Router();

PromoRouter.use(bodyParser.json());

PromoRouter.route('/')
.get((req, res, next) => {
    promos.find({})
    .then((promos) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promos);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req, res, next) => {
    promos.create(req.body)
    .then((Promo) => {
        console.log('Promo created', Promo);
        
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(Promo);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /promos');
})
.delete((req, res, next) => {
    promos.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

PromoRouter.route('/:PromoId')
.get((req, res, next) => {
    promos.findById(req.params.PromoId)
    .then((Promo) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(Promo);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /promos/'
    + req.params.PromoId);  
})
.put((req, res, next) => {
    promos.findByIdAndUpdate(req.params.PromoId, {
        $set: req.body
    }, { new: true})
    .then((Promo) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(Promo);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete((req, res, next) => {
    promos.findByIdAndRemove(req.params.PromoId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


PromoRouter.route('/:PromoId/comments')
.get((req, res, next) => {
    promos.findById(req.params.PromoId)
    .then((Promo) => {
        if (Promo != null){
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(Promo.comments);
        }
        else {
            err = new Error('Promo ' + req.params.PromoId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req, res, next) => {
    promos.findById(req.params.PromoId)
    .then((Promo) => {
        if (Promo != null){
            Promo.comments.push(req.body);
            Promo.save()
            .then((Promo) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(Promo.comments);
            })
        }
        else {
            err = new Error('Promo ' + req.params.PromoId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /promos/'
    + req.params.PromoId + '/comments');
})
.delete((req, res, next) => {
    promos.findById(req.params.PromoId)
    .then((Promo) => {
        if (Promo != null){
            for (var i = (Promo.comments.length - 1); i >= 0; i--) {
                Promo.comments.id(Promo.comments[i]._id).remove();
            }
        Promo.save()
        .then((Promo) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(Promo);
        }, (err) => next(err));
        }
        else {
            err = new Error('Promo ' + req.params.PromoId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

PromoRouter.route('/:PromoId/comments/:commentId')
.get((req, res, next) => {
    promos.findById(req.params.PromoId)
    .then((Promo) => {
        if (Promo != null && Promo.comments.id(req.params.commentId) != null){
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(Promo.comments.id(req.params.commentId));
        }
        else if (Promo == null) {
            err = new Error('Promo ' + req.params.PromoId + ' not found');
            err.status = 404;
            return next(err);
        }
        else { 
            err = new Error('Comment ' + req.params.PromoId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /promos/'
    + req.params.PromoId + '/comments/' + req.params.commentId);  
})
.put((req, res, next) => {
    promos.findById(req.params.PromoId)
    .then((Promo) => {
        if (Promo != null && Promo.comments.id(req.params.commentId) != null) {
            if (req.body.rating) {
                Promo.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if (req.body.comment) {
                Promo.comments.id(req.params.commentId).comment = req.body.comment;
            }
            Promo.save()
            .then((Promo) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(Promo);
            }, (err) => next(err));
        }
        else if (Promo == null) {
            err = new Error('Promo ' + req.params.PromoId + ' not found');
            err.status = 404;
            return next(err);
        }
        else { 
            err = new Error('Comment ' + req.params.PromoId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete((req, res, next) => {
    promos.findById(req.params.PromoId)
    .then((Promo) => {
        if (Promo != null && Promo.comments.id(req.params.commentId) != null) {
        Promo.comments.id(req.params.commentId).remove();
        Promo.save()
        .then((Promo) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(Promo);
        }, (err) => next(err));
        }
        else if (Promo == null) {
            err = new Error('Promo ' + req.params.PromoId + ' not found');
            err.status = 404;
            return next(err);
        }
        else { 
            err = new Error('Comment ' + req.params.PromoId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = PromoRouter;
