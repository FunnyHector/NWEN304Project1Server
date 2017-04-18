/**
 * Created by Hector on 2017/4/17.
 */

"use strict";

// =================== imports ===================
let util = require("util");
let express = require("express");
let app = express();
let bodyParser = require("body-parser");

// =================== top-level variables ===================
let port = process.env.PORT || 8080;

// =================== fake table ===================
let fakeDatabase = {
  _fakeTable: [
    {
      id: 0,
      title: "title_0",
      description: "description_0",
      isFinished: false
    },
    {
      id: 1,
      title: "title_1",
      description: "description_1",
      isFinished: false
    },
    {
      id: 2,
      title: "title_2",
      description: "description_3",
      isFinished: false
    },
    {
      id: 3,
      title: "title_3",
      description: "description_3",
      isFinished: false
    },
    {
      id: 4,
      title: "title_4",
      description: "description_4",
      isFinished: false
    },
    {
      id: 5,
      title: "title_5",
      description: "description_5",
      isFinished: false
    },
    {
      id: 6,
      title: "title_6",
      description: "description_6",
      isFinished: false
    }],

  _maxId: function () {
    let ids = this._fakeTable.map(function (row) {
      return row.id;
    });

    return Math.max.apply(null, ids);
  },

  create: function (data) {
    let maxId = this._maxId();

    this._fakeTable.push({
      id: maxId + 1,
      title: data.title,
      description: data.description,
      isFinished: data.isFinished
    });
  },

  update: function (id, data) {
    let updated = false;
    let wantedIndex = -1;

    for (let i = 0; i < this._fakeTable.length; i++) {
      if (this._fakeTable[i].id === id) {
        wantedIndex = i;
        break;
      }
    }

    if (wantedIndex >= 0) {
      this._fakeTable[wantedIndex] = {
        title: data.title,
        description: data.description,
        isFinished: data.isFinished
      };

      updated = true;
    }

    return updated;
  },

  find: function (id) {
    for (let row of this._fakeTable) {
      if (row.id === id) {
        return this._fakeTable[id];
      }
    }

    return undefined;
  },

  findAll: function () {
    return this._fakeTable;
  },

  delete: function (id) {
    let deleted = false;
    let wantedIndex = -1;

    for (let i = 0; i < this._fakeTable.length; i++) {
      if (this._fakeTable[i].id === id) {
        wantedIndex = i;
        break;
      }
    }

    if (wantedIndex >= 0) {
      this._fakeTable.splice(wantedIndex, 1);
      deleted = true;
    }

    return deleted;
  }
};

// =================== middle-ware ===================
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// static files
app.use(express.static('public'));

// TODO: might need some middle-ware, see lecture slides 26.03.17 page 3

// TODO: might be good to make a general error-handling function to redirect erroneous request to index

// =================== ROUTES ========================

// the index page
app.get("/", function (request, respond) {
  respond.redirect("/index.html");
});

// the list of all to-do items
app.get("/todos/", function (request, respond) {

  // query the database to get all items, and send it back

});

// get the specified to-do item
app.get("/todos/:id", function (request, respond) {
  let id = request.params.id;

  // query the database to get the item

});

// create a new to-do item
app.post("/todos/", function (request, respond) {
  let title = request.body.title;
  let description = request.body.description;
  let isFinished = false;

  // query the database to create the item

});

// update a specified to-do item
app.put("/todos/:id", function (request, respond) {
  let id = request.params.id;

  let title = request.body.title;
  let description = request.body.description;
  let isFinished = request.body["is-finished"];  // TODO need to add a hidden field "is-finished" in html

  // query the database to update the item, if it doesn't exist, create one

});

// delete a specified to-do item
app.delete("/todos/:id", function (request, respond) {
  let id = request.params.id;

  // query the database to delete the item

});


// =================== SERVER START ========================

let server = app.listen(port, function () {
  let host = server.address().address;
  let port = server.address().port;

  console.log('Host: ' + host);
  console.log('Port: ' + port);

  console.log('Example app listening at http://%s:%s', host, port);
});
