
// const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
// const axios = require("axios");
// =======
// class ValidationError extends Error {
//     constructor(message) {
//         super(message); // (1)
//         this.name = "InvalidEmailId"; // (2)
//     }
// }
// module.exports = passport => {
//     passport.serializeUser((user, done) => {
//         done(null, user);
//     });
//     passport.deserializeUser((user, done) => {
//         done(null, user);
//     });
//     passport.use(
//         new GoogleStrategy({
//                 clientID: CLIENT_ID,
//                 clientSecret: CLIENT_SECRET,
//                 callbackURL: CALLBACK_URL
//             },
//             (token, refreshToken, profile, done) => {
//                 //profile contains all the infor of the user
//                 var info = profile["_json"]["email"].split("@");
//                 var emailid = profile["_json"]["email"];
//                 var endid = profile["_json"]["hd"];
//                 if (endid != "smail.iitpkd.ac.in" || "iitpkd.ac.in") {
//                     return done(new ValidationError("Invalid Email Id"), {
//                         profile: profile,
//                         token: token
//                     });
//                 } else {
//                     var isStudent = false;
//                     //if this is true the he is a student
//                     if (!isNaN(info[0])) {
//                         isStudent = true;
//                     }
//                     return done(null, {
//                         profile: profile,
//                         token: token,
//                         isStudent: isStudent,
//                         mail: emailid
//                     });
//                 }
//             }
//         )
//     );
// };


