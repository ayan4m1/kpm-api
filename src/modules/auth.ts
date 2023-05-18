import { formatISO, parseISO } from 'date-fns';
import { Strategy as GithubStrategy, Profile } from 'passport-github2';
import { Passport, AuthenticateCallback, AuthenticateOptions } from 'passport';
import { VerifyCallback } from 'passport-oauth2';
import { User } from '@prisma/client';

import { github as githubConfig } from '../modules/config';
import {
  getUserInternal,
  createUser,
  updateUser,
  createAccessToken,
  checkAccessToken
} from '../modules/database';
import { getLogger } from '../modules/logging';

export type SerializedUser = {
  id: string;
  githubId: string;
  username: string;
  email: string;
  createdAt: string;
};

type SerializeCallback = (error: Error, user: SerializedUser) => void;
type DeserializeCallback = (error: Error, user: User) => void;

const log = getLogger('auth');
const passport = new Passport();

export const authenticate = (
  options?: AuthenticateOptions,
  callback?: AuthenticateCallback
) => passport.authenticate('github', options, callback);

passport.serializeUser((user: User, done: SerializeCallback) =>
  done(null, {
    ...user,
    createdAt: formatISO(user.createdAt)
  })
);

passport.deserializeUser((user: SerializedUser, done: DeserializeCallback) =>
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
      _: string,
      profile: Profile,
      done: VerifyCallback
    ): Promise<void> => {
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

        if (!email) {
          log.error('User is missing an email address');
          return done(new Error('Could not find your GitHub email address.'));
        }

        log.debug(`Looking up user ${id}`);
        let user = await getUserInternal(id);

        if (!user) {
          log.info(`Creating new user ${username} with email ${email}`);
          user = await createUser(id, username, email);
        } else {
          log.info(`Syncing existing user ${username} with email ${email}`);
          await updateUser(id, username, email);
          user = await getUserInternal(id);
        }

        if (!(await checkAccessToken(accessToken))) {
          log.info(`Creating access token for ${username}`);
          await createAccessToken(user.id, accessToken, 8);
        }

        done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);
