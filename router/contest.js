const express = require('express');
const router = express.Router();

router.get("/:id", (req, res) => {
  res.send(req.params.id);
});

router.post("/")

module.exports = router;