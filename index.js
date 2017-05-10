"use strict";

// =================== imports ===================
const url = require('url');
const bodyParser = require("body-parser");
const Pool = require('pg-pool');

const express = require("express");
const app = express();

// =================== top-level variables ===================
const port = process.env.PORT || 8080;
const databaseUrl = process.env.DATABASE_URL || "postgresql://fangzhao:457866@localhost:5432/nwen304";

// =================== middle-ware ===================
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// static files
app.use(express.static("public"));

// =================== PostgreSQL stuff ======================
const params = url.parse(databaseUrl);
const auth = params.auth.split(':');
const sslBoolean = !!process.env.DATABASE_URL;

const config = {
  user: auth[0],
  password: auth[1],
  host: params.hostname,
  port: params.port,
  database: params.pathname.split('/')[1],
  ssl: sslBoolean
};

const pool = new Pool(config);

// =================== ROUTES ========================

// 1. the index page
app.get("/", function (request, respond) {
  console.log("[Log] Received a GET '/', displaying the index");

  respond.redirect("/index.html");
});

// 2. the list of all to-do items
app.get("/todos/", function (request, respond) {
  console.log("[Log] Received a GET '/todos/'");

  pool.connect()
      .then(client => {
        client.query("SELECT * FROM todo_items;")
            .then(result => {
              client.release();
              respond.send(result.rows);
              console.log(`[Log] Sending all ${result.rowCount} to-do items to the client`);
            })
            .catch(e => {
              client.release();
              respond.status(500).send("Database error occurred, please refresh or contact hectorcaesar@hotmail.com.");
              console.error('[ERROR] Query error', e.message, e.stack);
            });
      })
      .catch(error => {
        respond.status(503).send("Database unavailable, please try again.");
        console.error('[ERROR] Unable to connect to database', error.message, error.stack);
      });
});

// 3. get the specified to-do item (NOT USED)
app.get("/todos/:id", function (request, respond) {
  let id = request.params.id;

  console.log(`[Log] Received a GET '/todos/${id}'`);

  // query the database to get the item
  pool.connect()
      .then(client => {
        client.query(`SELECT * FROM todo_items WHERE id = ${id};`)
            .then(result => {
              client.release();
              respond.send(result.rows[0]);
              console.log(`[Log] Sending the to-do items (id: ${id}) to the client`);
            })
            .catch(e => {
              client.release();
              respond.status(500).send("Database error occurred, please refresh or contact hectorcaesar@hotmail.com.");
              console.error('[ERROR] Query error', e.message, e.stack);
            });
      })
      .catch(error => {
        respond.status(503).send("Database unavailable, please try again.");
        console.error('[ERROR] Unable to connect to database', error.message, error.stack);
      });
});

// 4. create a new to-do item
app.post("/todos/", function (request, respond) {
  console.log("[Log] Received a POST '/todos/'");

  pool.connect()
      .then(client => {
        client.query("INSERT INTO todo_items (title, description, is_finished) VALUES ($1, $2, FALSE) RETURNING id;", [request.body.title, request.body.description])
            .then(result => {
              client.release();

              // tell the client the id of the newly created to-do item
              let id = result.rows[0].id;
              respond.status(200).json({ id: id });
              console.log(`[Log] Created a new to-do item (id: ${id})`);
            })
            .catch(e => {
              client.release();
              respond.status(500).send("Database error occurred, please refresh or contact hectorcaesar@hotmail.com.");
              console.error('[ERROR] Query error', e.message, e.stack);
            });
      })
      .catch(error => {
        respond.status(503).send("Database unavailable, please try again.");
        console.error('[ERROR] Unable to connect to database', error.message, error.stack);
      });
});

// 5. update a specified to-do item
app.post("/todos/:id", function (request, respond) {
  let id = request.params.id;
  let title = request.body.title;
  let is_finished = request.body.is_finished;

  pool.connect()
      .then(client => {
        // 5.1 updating all fields (title, description, is_finished)
        if (title) {
          console.log(`[Log] Received a POST '/todos/${id}' for updating all fields`);

          let description = request.body.description;

          client.query("UPDATE todo_items SET title = $1, description = $2, is_finished = $3 WHERE id = $4;", [title, description, is_finished, id])
              .then(result => {
                client.release();

                if (result.rowCount !== 0) {
                  respond.sendStatus(200);
                  console.log(`[Log] Updated item (id: ${id})`);
                } else {
                  respond.status(404).send("Cannot find item, please try again.");
                  console.error(`[ERROR] Failed to updated a new to-do item (id: ${id})`);
                }

              })
              .catch(e => {
                client.release();
                respond.status(500).send("Database error occurred, please refresh or contact hectorcaesar@hotmail.com.");
                console.error('[ERROR] Query error', e.message, e.stack);
              });

        // 5.2 updating only the is_finished field
        } else {
          console.log(`[Log] Received a POST '/todos/${id}' for updating the 'is_finished' field`);

          client.query("UPDATE todo_items SET is_finished = $1 WHERE id = $2;", [is_finished, id])
              .then(result => {
                client.release();

                if (result.rowCount !== 0) {
                  respond.sendStatus(200);
                  console.log(`[Log] Updated item (id: ${id})`);
                } else {
                  respond.status(404).send("Cannot find item, please try again.");
                  console.error(`[ERROR] Failed to updated a new to-do item (id: ${id})`);
                }

              })
              .catch(e => {
                client.release();
                respond.status(500).send("Database error occurred, please refresh or contact hectorcaesar@hotmail.com.");
                console.error('[ERROR] Query error', e.message, e.stack);
              });
        }
      })
      .catch(error => {
        respond.status(503).send("Database unavailable, please try again.");
        console.error('[ERROR] Unable to connect to database', error.message, error.stack);
      });
});

// 6. delete a specified to-do item
app.delete("/todos/:id", function (request, respond) {
  let id = request.params.id;

  console.log(`[Log] Received a DELETE '/todos/${id}'`);

  pool.connect()
      .then(client => {
        client.query("DELETE from todo_items WHERE id = $1;", [id])
            .then(result => {
              client.release();

              if (result.rowCount !== 0) {
                respond.sendStatus(200);
                console.log(`[Log] Deleted the row (id: ${id})`);
              } else {
                respond.status(404).send("Cannot find item, please try again.");
                console.error(`[ERROR] Failed to delete the row (id: ${id})`);
              }
            })
            .catch(e => {
              client.release();
              respond.status(500).send("Database error occurred, please refresh or contact hectorcaesar@hotmail.com.");
              console.error('[ERROR] Query error', e.message, e.stack);
            });
      })
      .catch(error => {
        respond.status(503).send("Database unavailable, please try again.");
        console.error('[ERROR] Unable to connect to database', error.message, error.stack);
      });
});

// 7. 404 page
app.get('*', function(request, respond){
  console.log("[Log] Someone is poking around.");
  respond.redirect("/404.html");
});

// =================== SERVER START ========================

const server = app.listen(port, function () {
  let host = server.address().address;
  let port = server.address().port;

  console.log("[Log] Hector's AWESOME To-do List is listening at http://%s:%s", host, port);
});
