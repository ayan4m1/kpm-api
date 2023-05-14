import { Express, Request, Response } from 'express';
import { Strategy as GithubStrategy, Profile } from 'passport-github2';
import { Passport } from 'passport';
import { VerifyCallback } from 'passport-oauth2';

import { github as githubConfig, auth as authConfig } from '../modules/config';
import {
  getUser,
  createUser,
  updateUser,
  getAccessToken,
  createAccessToken,
  checkAccessToken
} from '../modules/database';
import { User } from '@prisma/client';
import { formatISO, parseISO } from 'date-fns';
import { getLogger } from '../modules/logging';

export type SerializedUser = {
  id: string;
  githubId: string;
  username: string;
  email: string;
  createdAt: string;
};

const log = getLogger('auth');
export const passport = new Passport();

passport.serializeUser((user: User, done: CallableFunction) =>
  done(null, {
    ...user,
    createdAt: formatISO(user.createdAt)
  })
);

passport.deserializeUser((user: SerializedUser, done: CallableFunction) =>
  done(null, {
    ...user,
    createdAt: parseISO(user.createdAt)
  })
);

passport.use(
  new GithubStrategy(
    {
      clientID: githubConfig.clientId,
      clientSecret: githubConfig.clientSecret,
      callbackURL: githubConfig.callbackUrl,
      scope: ['profile', 'user:email']
    },
    async (
      accessToken: string,
      __: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        const { id, username, emails } = profile;

        if (!username || !username.length) {
          log.error('User is missing a username');
          return done(new Error('You must have a GitHub username.'));
        }

        if (!emails || !emails?.length) {
          log.error('User is missing an email address');
          return done(
            new Error('You must have a public GitHub email address.')
          );
        }

        const email =
          emails.find((email) => email.type === 'primary')?.value ??
          emails[0].value;

        let user = await getUser(id);

        if (!user) {
          log.info(`Creating new user ${username} with email ${email}`);
          user = await createUser(id, username, email);
        } else {
          log.info(`Syncing existing user ${username} with email ${email}`);
          await updateUser(id, username, email);
          user = await getUser(id);
        }

        if (!(await checkAccessToken(accessToken))) {
          log.info(`Creating access token for ${username}`);
          await createAccessToken(user.id, accessToken, 3600);
        }

        done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

export function registerAuthRoutes(app: Express) {
  app.get('/auth', passport.authenticate('github', { failWithError: true }));
  app.get(
    '/auth/callback',
    passport.authenticate('github', { failureRedirect: '/auth' }),
    async (req: Request, res: Response) => {
      const user = req.user as User;
      if (!user) {
        log.error('Auth callback called with no user!');
        return res.sendStatus(500);
      }

      const result = await getAccessToken(user.id);

      if (!result) {
        log.warn('User had no access token!');
        res.sendStatus(403);
      } else {
        log.info(`Redirecting user to ${authConfig.uiUrl}`);
        res.redirect(
          302,
          `${authConfig.uiUrl}?token=${result.token}&expiresAt=${formatISO(
            result.expiresAt
          )}`
        );
      }
    }
  );
}
