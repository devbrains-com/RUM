import express from "express";
import path from "path";

const app = express();

app.use(express.static("public"));

app.get("/slowServer", (req, res) => {
  sleep(1000);

  res.sendFile(path.resolve("public/index.html"));
});

app.listen(3000, () => "listen on port 3000");

const sleep = time => {
  var now = new Date().getTime();

  while (new Date().getTime() < now + time) {
    /* do nothing; this will exit once it reached the time limit */
    /* if you want you could do something and exit*/
    /* mostly I prefer to use this */
  }
};
