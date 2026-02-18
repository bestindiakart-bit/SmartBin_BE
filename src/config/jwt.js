import { Strategy, ExtractJwt } from "passport-jwt";
import passport from "passport";
import { config } from "dotenv";

config();

export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "some-secret-key";
export const JWT_ALGORITHM = process.env.JWT_ALGORITHM || "HS256";
export const JWT_ACCESS_TOKEN_EXPIRES =
  process.env.JWT_ACCESS_TOKEN_EXPIRES || "1d";
export const JWT_REFRESH_TOKEN_EXPIRES =
  process.env.JWT_REFRESH_TOKEN_EXPIRES || "7d";

function cookieExtractor(req) {
  if (req && req.cookies) {
    return req.path.indexOf("refresh") > -1
      ? req.cookies["refreshToken"]
      : req.cookies["accessToken"];
  }
}

const options = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    cookieExtractor,
    ExtractJwt.fromAuthHeaderAsBearerToken(),
  ]),
  secretOrKey: JWT_SECRET_KEY,
  algorithms: [JWT_ALGORITHM],
};

const strategy = new Strategy(options, (payload, done) => {
  return done(null, payload);
});

passport.use(strategy);
