const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => {
    // console.log(req.headers);
    // res.send({ test: 'hi~' });
});

module.exports = router;