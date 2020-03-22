const express = require("express");
router = express.Router();
passport = require("passport");
auth = require("./passport");
auth(passport);
router.use(passport.initialize());
// router.get("/", (req, res) => {
//     res.json({
//         status: "session cookie not set"
//     });
// });

router.get(
  "/google",
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email"
    ]
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google"), // complete the authenticate using the google strategy
  (err, req, res, next) => {
    // custom error handler to catch any errors, such as TokenError
    if (err.name === "TokenError") {
      res.redirect("/auth/google"); // redirect them back to the login page
    } else {
      req.flash("login_error", "Use the Institute mail ID");
      res.redirect("/");
      // res.json({ message: "Use the Institute mail ID" }); //invalid mail id
    }
  },
  (req, res) => {
    // On success, redirect back to '/'
    res.redirect("/");
  }
);
router.get("/", (req, res) => {
  res.send("authenticated successfully");
});
module.exports = router;
