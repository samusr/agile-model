var path = require("path");
var http = require("http");
var logger = require("morgan");
var express = require("express");
var createError = require("http-errors");
var cookieParser = require("cookie-parser");
var debug = require("debug")("my-awesome-app");
var app = express();
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
require("./routes")(app);
app.use(function (req, res, next) { return next(createError(404)); });
app.use(function (err, req, res, next) { return res.json({ error: err.status || 500, message: err.message }); }); // eslint-disable-line no-unused-vars
/************************/
/****                ****/
/***                  ***/
/**    SERVER SETUP    **/
/***                  ***/
/****                ****/
/************************/
var port = normalizePort(process.env.PORT || "3000");
app.set("port", port);
var server = http.createServer(app);
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);
var normalizePort = function (val) {
    var port = parseInt(val, 10);
    // named pipe
    if (isNaN(port))
        return val;
    // port number
    if (port >= 0)
        return port;
    return false;
};
/**
 * Event listener for HTTP server "error" event.
 */
var onError = function (error) {
    if (error.syscall !== "listen")
        throw error;
    var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
};
/**
 * Event listener for HTTP server "listening" event.
 */
var onListening = function () {
    var addr = server.address();
    var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    debug("Listening on " + bind);
};
