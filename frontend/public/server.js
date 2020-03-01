"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var path_1 = __importDefault(require("path"));
var app = express_1["default"]();
app.use(express_1["default"].static("public"));
app.get("/slowServer", function (req, res) {
    sleep(1000);
    res.sendFile(path_1["default"].resolve("public/index.html"));
});
app.listen(3000, function () { return "listen on port 3000"; });
var sleep = function (time) {
    var now = new Date().getTime();
    while (new Date().getTime() < now + time) {
        /* do nothing; this will exit once it reached the time limit */
        /* if you want you could do something and exit*/
        /* mostly I prefer to use this */
    }
};
