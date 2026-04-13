import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'campus-trade-secret-key';

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const [user] = await db.select().from(users).where(eq(users.id, payload.userId));
        if (!user) return done(null, false);
        return done(null, { id: user.id, email: user.email, role: user.role });
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

export default passport;
