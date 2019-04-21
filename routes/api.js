'use strict';

var expect = require('chai').expect;
var ObjectId = require('mongodb').ObjectID;
const getDB = require('../db.js').getDB;


module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      const db = getDB();
      var project = req.params.project;
      if (Object.keys(req.query).length == 0) {
        db.collection(project).find().toArray((err, arr) => {         
          if (err) {return res.status(500).type('text').send('an error occured')}
          res.json(arr);
        })
      } else {
        let filterObj = req.query;
        if (req.query.open) {
          if (req.query.open == 'true') {
            filterObj.open = true;
          } else if (req.query.open == 'false') {
            filterObj.open = false;
          }
        }
        
        
        db.collection(project).find(filterObj).toArray((err, arr) => {
          if (err) {return res.status(500).type('text').send('an error occured')}
          res.json(arr);
        })
      }
      
    })
    
    .post(function (req, res){
      const db = getDB();
      var project = req.params.project;
      if (!req.body.issue_title) {
        return res.status(400).type('text').send('title is required');
      } else if (!req.body.issue_text) {
        return res.status(400).type('text').send('issue text is required');
      } else if (!req.body.created_by) {
        return res.status(400).type('text').send('created by is required');
      }
    
      db.collection(project).insertOne({
        _id: ObjectId(), 
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString(),
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || '',
        open: true,
        status_text: req.body.status_text || ''
      }, (err, doc) => {
        if (err) {
          console.log(err.message)
          return res.status(500).type('text').send(err.message);
        }
        res.json(doc.ops[0]);
      })
      
    })
    
    .put(function (req, res){
      const db = getDB();
      var project = req.params.project;
      if (!req.body._id) {
        return res.status(400).type('text').send('_id field is required');
      } else if (!req.body.issue_title && !req.body.issue_text && !req.body.created_by && !req.body.assigned_to && !req.body.status_text && !req.body.open) {
        return res.send('no update fields sent');
      } else {
        let updateFields = {"updated_on": new Date().toISOString()};
        if (req.body.issue_title) {updateFields["issue_title"] = req.body.issue_title}
        if (req.body.issue_text) {updateFields["issue_text"] = req.body.issue_text}
        if (req.body.created_by) {updateFields["created_by"] = req.body.created_by}
        if (req.body.assigned_to) {updateFields["assigned_to"] = req.body.assigned_to}
        if (req.body.status_text) {updateFields["status_text"] = req.body.status_text}
        if (req.body.open) {updateFields["open"] = false}
        db.collection(project).findOneAndUpdate({_id: ObjectId(req.body._id)}, {$set: updateFields}, {returnNewDocument: true}, (err, doc) => {
          if (err) {
            return res.status(500).type('text').send('an error occured');
          } else if (!doc) {
            return res.send('could not update ' + req.body._id);
          } else {
            return res.send('sucessfully updated');
          }
        })
      }
      
    })
    
    .delete(function (req, res){
      const db = getDB();
      var project = req.params.project;
      if (!req.body._id) {
        return res.send('_id error');
      } else {
        db.collection(project).findOneAndDelete({_id: req.body._id}, (err, doc) => {
          if (err) {
            return res.status(500).type('text').send('an error occured');
          }
          if (!doc) {
            return res.send('could not delete ' + req.body._id);
          }
          res.send('deleted ' + req.body._id);
        })
      }
    });
    
};
