import express from "express";
import path from "path";
import helmet from "helmet";
import bodyParser from "body-parser";
import routes from "./js/routes.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "./client", "public")));

// - prevent denial of cross origin requests
// TODO: REMOVE IF UNNECESSARY
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  //res.header("Access-Control-Request-Headers", "X-Requested-With,Access-Control-Request-Method,Access-Control-Request-Headers, accept, Content-Type");
  next();
});

// - REST server
app.use("/", routes);

// - catch 404 and forward to error handler
app.use(function (err, req, res, next) {
  //var err = new Error('Not Found');
  //err.status = 404;
  //next(err);
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: {},
  });
});

export default app;
