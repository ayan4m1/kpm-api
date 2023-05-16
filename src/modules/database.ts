import { AccessToken, Prisma, PrismaClient, User } from '@prisma/client';
import { addSeconds, isAfter } from 'date-fns';

import { getLogger } from './logging';
import { omit, omitEach } from './utils';

const log = getLogger('db');
const prisma = new PrismaClient();

export function getAccessToken(userId: string) {
  return prisma.accessToken.findFirst({
    where: {
      expiresAt: {
        lte: new Date()
      },
      userId
    },
    orderBy: {
      expiresAt: 'desc'
    }
  });
}

export async function checkAccessToken(token: string): Promise<boolean> {
  const accessToken = await prisma.accessToken.findUnique({
    where: {
      token
    }
  });

  if (Boolean(accessToken) && isAfter(Date.now(), accessToken.expiresAt)) {
    await prisma.accessToken.delete({
      where: {
        token
      }
    });
    return false;
  }

  return Boolean(accessToken);
}

export function createAccessToken(
  userId: string,
  token: string,
  expiresIn: number
): Promise<AccessToken> {
  return prisma.accessToken.create({
    data: {
      token,
      userId,
      generator: 'GitHub',
      expiresAt: addSeconds(Date.now(), expiresIn)
    }
  });
}

export function createUser(
  githubId: string,
  username: string,
  email: string
): Promise<User> {
  return prisma.user.create({
    data: {
      githubId,
      username,
      email
    }
  });
}

export function updateUser(
  githubId: string,
  username: string,
  email: string
): Promise<User> {
  return prisma.user.update({
    where: {
      githubId
    },
    data: {
      username,
      email
    }
  });
}

export function getUser(githubId: string): Promise<User> {
  try {
    return prisma.user.findUnique({
      select: {
        id: true,
        githubId: true,
        email: true,
        username: true,
        createdAt: true
      },
      where: {
        githubId
      }
    });
  } catch (error) {
    log.error(error.message);
    log.error(error.stack);
  }
}

export async function getPackages(name?: string, author?: string) {
  try {
    const where: Prisma.PackageWhereInput = {};

    if (name) {
      where.name = {
        contains: name
      };
    }

    if (author) {
      where.user = {
        username: { contains: author }
      };
    }

    const packages = await prisma.package.findMany({
      include: {
        user: true,
        releases: true
      },
      where
    });

    return packages.map((pkg) => ({
      ...omit(pkg, ['userId']),
      user: omit(pkg.user, ['email', 'createdAt']),
      releases: omitEach(pkg.releases, ['hash'])
    }));
  } catch (error) {
    log.error(error.message);
    log.error(error.stack);
  }
}

export async function getPackage(
  name?: string,
  uuid?: string,
  allReleases = false
) {
  try {
    const pkg = await prisma.package.findUnique({
      include: {
        user: true,
        releases: true
      },
      where: {
        name: name ? name : undefined,
        id: uuid ? uuid : undefined
      }
    });

    if (!pkg) {
      return null;
    }

    return {
      ...omit(pkg, ['userId']),
      user: omit(pkg.user, ['email', 'createdAt']),
      releases: omitEach(pkg.releases, ['hash'])
    };
  } catch (error) {
    log.error(error.message);
    log.error(error.stack);
  }
}
