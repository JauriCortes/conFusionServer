const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate')

const leaders = require('../models/leaders');

const LeaderRouter = express.Router();

LeaderRouter.use(bodyParser.json());

LeaderRouter.route('/')
.get((req, res, next) => {
    leaders.find({})
    .then((leaders) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leaders);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser,(req, res, next) => {
    leaders.create(req.body)
    .then((Leader) => {
        console.log('Leader created', Leader);
        
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(Leader);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /leaders');
})
.delete(authenticate.verifyUser,(req, res, next) => {
    leaders.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

LeaderRouter.route('/:LeaderId')
.get((req, res, next) => {
    leaders.findById(req.params.LeaderId)
    .then((Leader) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(Leader);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /leaders/'
    + req.params.LeaderId);  
})
.put(authenticate.verifyUser,(req, res, next) => {
    leaders.findByIdAndUpdate(req.params.LeaderId, {
        $set: req.body
    }, { new: true})
    .then((Leader) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(Leader);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(authenticate.verifyUser,(req, res, next) => {
    leaders.findByIdAndRemove(req.params.LeaderId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


LeaderRouter.route('/:LeaderId/comments')
.get((req, res, next) => {
    leaders.findById(req.params.LeaderId)
    .then((Leader) => {
        if (Leader != null){
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(Leader.comments);
        }
        else {
            err = new Error('Leader ' + req.params.LeaderId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser,(req, res, next) => {
    leaders.findById(req.params.LeaderId)
    .then((Leader) => {
        if (Leader != null){
            Leader.comments.push(req.body);
            Leader.save()
            .then((Leader) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(Leader.comments);
            })
        }
        else {
            err = new Error('Leader ' + req.params.LeaderId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /leaders/'
    + req.params.LeaderId + '/comments');
})
.delete(authenticate.verifyUser,(req, res, next) => {
    leaders.findById(req.params.LeaderId)
    .then((Leader) => {
        if (Leader != null){
            for (var i = (Leader.comments.length - 1); i >= 0; i--) {
                Leader.comments.id(Leader.comments[i]._id).remove();
            }
        Leader.save()
        .then((Leader) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(Leader);
        }, (err) => next(err));
        }
        else {
            err = new Error('Leader ' + req.params.LeaderId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

LeaderRouter.route('/:LeaderId/comments/:commentId')
.get((req, res, next) => {
    leaders.findById(req.params.LeaderId)
    .then((Leader) => {
        if (Leader != null && Leader.comments.id(req.params.commentId) != null){
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(Leader.comments.id(req.params.commentId));
        }
        else if (Leader == null) {
            err = new Error('Leader ' + req.params.LeaderId + ' not found');
            err.status = 404;
            return next(err);
        }
        else { 
            err = new Error('Comment ' + req.params.LeaderId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /leaders/'
    + req.params.LeaderId + '/comments/' + req.params.commentId);  
})
.put(authenticate.verifyUser,(req, res, next) => {
    leaders.findById(req.params.LeaderId)
    .then((Leader) => {
        if (Leader != null && Leader.comments.id(req.params.commentId) != null) {
            if (req.body.rating) {
                Leader.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if (req.body.comment) {
                Leader.comments.id(req.params.commentId).comment = req.body.comment;
            }
            Leader.save()
            .then((Leader) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(Leader);
            }, (err) => next(err));
        }
        else if (Leader == null) {
            err = new Error('Leader ' + req.params.LeaderId + ' not found');
            err.status = 404;
            return next(err);
        }
        else { 
            err = new Error('Comment ' + req.params.LeaderId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(authenticate.verifyUser,(req, res, next) => {
    leaders.findById(req.params.LeaderId)
    .then((Leader) => {
        if (Leader != null && Leader.comments.id(req.params.commentId) != null) {
        Leader.comments.id(req.params.commentId).remove();
        Leader.save()
        .then((Leader) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(Leader);
        }, (err) => next(err));
        }
        else if (Leader == null) {
            err = new Error('Leader ' + req.params.LeaderId + ' not found');
            err.status = 404;
            return next(err);
        }
        else { 
            err = new Error('Comment ' + req.params.LeaderId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = LeaderRouter;
