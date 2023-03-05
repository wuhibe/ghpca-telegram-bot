const express = require("express");
const app = require("../app");

let router = express.Router();

router.get("/", (req, res) => {
    return res.send(app(1, "John", "john", 1));
});

module.exports = router;