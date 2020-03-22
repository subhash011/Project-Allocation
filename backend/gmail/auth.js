const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const axios = require("axios");
class ValidationError extends Error {
    constructor(message) {
        super(message); // (1)
        this.name = "InvalidEmailId"; // (2)
    }
}
module.exports = passport => {
    passport.serializeUser((user, done) => {
        done(null, user);
    });
    passport.deserializeUser((user, done) => {
        done(null, user);
    });
    passport.use(
        new GoogleStrategy({
                clientID: "1027643503922-k31j2ap8mgiomq0dda5vmhf8hbprv8ve.apps.googleusercontent.com",
                clientSecret: "yyrSdMIymskkU2xCeRF5OJGp",
                callbackURL: "http://localhost:8080/auth/google/callback"
            },
            (token, refreshToken, profile, done) => {
                var endid = profile["_json"]["hd"];
                if (endid != "smail.iitpkd.ac.in") {
                    return done(new ValidationError("Invalid Email Id"), {
                        profile: profile,
                        token: token
                    });
                }
                return done(null, {
                    profile: profile,
                    token: token
                });
            }
        )
    );
};