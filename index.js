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
      description: "description_2",
      isFinished: false
    },
    {
      id: 3,
      title: "item_with_no_description",
      isFinished: false
    },
    {
      id: 4,
      title: "item_done",
      description: "description_4",
      isFinished: true
    },
    {
      id: 5,
      title: "title_done_no_description",
      isFinished: true
    },
    {
      id: 900,
      title: "title with id 900",
      description: "description 900",
      isFinished: false
    }],

  _maxId: function () {
    let ids = this._fakeTable.map(function (row) {
      return row.id;
    });

    return Math.max.apply(null, ids);
  },

  create: function (data) {
    let id = this._maxId() + 1;

    this._fakeTable.push({
      id: id,
      title: data.title,
      description: data.description,
      isFinished: data.isFinished
    });

    return id;
  },

  update: function (id, data) {
    let updated = false;
    let wantedIndex = -1;

    for (let i = 0; i < this._fakeTable.length; i++) {
      if (this._fakeTable[i].id == id) {
        wantedIndex = i;
        break;
      }
    }

    if (wantedIndex >= 0) {
      this._fakeTable[wantedIndex] = {
        id: id,
        title: data.title,
        description: data.description,
        isFinished: data.isFinished
      };

      updated = true;
    }

    return updated;
  },

  updateIsFinished: function (id, isFinished) {
    let updated = false;
    let wantedIndex = -1;

    for (let i = 0; i < this._fakeTable.length; i++) {
      if (this._fakeTable[i].id == id) {
        wantedIndex = i;
        break;
      }
    }

    if (wantedIndex >= 0) {
      this._fakeTable[wantedIndex].isfinished = isFinished;
      updated = true;
    }

    return updated;
  },

  find: function (id) {
    for (let row of this._fakeTable) {
      if (row.id == id) {
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
      if (this._fakeTable[i].id == id) {
        wantedIndex = i;
        break;
      }
    }

    if (wantedIndex >= 0) {
      this._fakeTable.splice(wantedIndex, 1);
      deleted = true;
    }

    return deleted;
  },

  size: function () {
    return this._fakeTable.length;
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
  console.log("received a GET '/', displaying the index");

  respond.redirect("/index.html");
});

// the list of all to-do items
app.get("/todos/", function (request, respond) {
  console.log("received a GET '/todos/', sending all to-do items to the client");
  // query the database to get all items, and send it back
  respond.send(fakeDatabase.findAll());
});

// get the specified to-do item
app.get("/todos/:id", function (request, respond) {
  let id = request.params.id;

  console.log(`received a GET '/todos/${id}', sending the specified to-do items to the client`);

  // query the database to get the item
  respond.send(fakeDatabase.find(id));
});

// create a new to-do item
app.post("/todos/", function (request, respond) {
  console.log("received a POST '/todos/', creating a new to-do item.");

  // query the database to create the item
  let id = fakeDatabase.create({
    title: request.body.title,
    description: request.body.description,
    isFinished: false
  });

  // tell the client the id of the newly created to-do item
  respond.status(200).json({ id: id });
});

// update a specified to-do item
app.post("/todos/:id", function (request, respond) {
  let id = request.params.id;
  let updated;

  // query the database to update the item, if it doesn't exist, create one
  if (request.body.title) {
    // update all fields
    updated = fakeDatabase.update(id, {
      title: request.body.title,
      description: request.body.description,
      isFinished: request.body.isFinished
    });

    console.log(`received a POST '/todos/${id}', updating all fields.`);
  } else {

    // only update isFinished field
    updated = fakeDatabase.updateIsFinished(id, request.body.isFinished);

    console.log(`received a POST '/todos/${id}', updating the 'isFinished' field.`);
  }

  if (updated) {
    respond.sendStatus(200);
  } else {
    respond.sendStatus(404);
  }
});

// delete a specified to-do item
app.delete("/todos/:id", function (request, respond) {
  let id = request.params.id;

  // query the database to delete the item
  let deleted = fakeDatabase.delete(id);

  console.log(`received a DELETE '/todos/${id}', deleting the specified to-do item.`);

  if (deleted) {
    respond.sendStatus(200);
  } else {
    respond.sendStatus(404);
  }
});

// =================== SERVER START ========================

let server = app.listen(port, function () {
  let host = server.address().address;
  let port = server.address().port;

  console.log("Hector's AWESOME To-do List is listening at http://%s:%s", host, port);
});
