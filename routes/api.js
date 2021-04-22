var express = require('express');
var router = express.Router();

const redis = require('redis');
const redisClient = redis.createClient();

const VOTED_KEY = "VOTED";
const UPVOTE_KEY = "UV";
const DOWNVOTE_KEY = "DV";

/* GET votes */
router.post('/vote', function(req, res, next) {

  let votedResultKey = `${VOTED_KEY}:${req.body.result_id}`; 
  let member = req.clientIp.toString();

  redisClient.SISMEMBER(votedResultKey, member, (err, res) => {
  
    // If member has never voted for this result, consider it
    if (res === 0) {

      let voteKey = req.body.direction === 'up'? UPVOTE_KEY: DOWNVOTE_KEY;
      let timestamp = Math.round((new Date()).getTime() / 1000);

      let voteField = `${req.body.result_id}:${timestamp}`;

      // Add vote to the vote key
      redisClient.LPUSH(voteKey, voteField);

      // Add member to voted key
      redisClient.SADD(votedResultKey, member);
      
    } else {
      console.log("Duplicate vote: ", req.body.result_id, req.clientIp);
    }

  });

  res.json({
    message: "OK"
  });

});

module.exports = router;
