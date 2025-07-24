const express = require("express");
const router = express.Router();
const { getRewardLeaderboard } = require("../controllers/rewardController");

router.get("/", getRewardLeaderboard);

module.exports = router;
