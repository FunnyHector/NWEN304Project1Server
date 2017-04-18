/**
 * Created by Hector on 2017/4/18.
 */


// =================================================================
// =================== examples from slides ========================
// =================================================================

// handle a basic case route
app.get("/", function (request, respond, next) {
  respond.send("Select a collection, e.g. /collections/messages");
});

// handle GET request for a collection of items
app.get("/collections/:collectionName", function (request, respond, next) {
  request.collection.find({}, {
    limit: 10,
    sort: [["_id", -1]]
  }).toArray(function (error, results) {
    if (error) {
      return next(error);
    }

    respond.send(results);
  });
});

app.param("collectionName", function (request, respond, next, collectionName) {
  request.collection = db.collection(collectionName);
  return next();
});

// handle POST request for an item
app.post("/collections/:collectionName", function (request, respond, next) {
  request.collection.insert(request.body, {}, function (error, results) {
    if (error) {
      return next(error);
    }

    respond.send(results);
  });
});

// handle GET request for individual item
app.get("/collections/:collectionName/:id", function (request, respond, next) {
  request.collection.findOne({
    _id: id(request.params.id)
  }, function (error, result) {
    if (error) {
      return next(error);
    }

    respond.send(result);
  });
});

// handle PUT request for item
app.put("/collections/:collectionName/:id", function (request, respond, next) {
  request.collection.update({
    _id: id(request.params.id)
  }, {
    $set: request.body
  }, {
    safe: true,
    multi: false
  }, function (error, result) {
    if (error) {
      return next(error);
    }

    respond.send((result === 1) ? { msg: "success" } : { msg: "error" });
  });
});

// Handle DELETE request
app.delete("/collections/:collectionName/:id", function (request, respond, next) {
  request.collection.remove({
    _id: id(request.params.id)
  }, function (error, result) {
    if (error) {
      return next(error);
    }

    respond.send((result === 1) ? { msg: "success" } : { msg: "error" });
  });
});

// =================================================================
