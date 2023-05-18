import { Prisma, PrismaClient } from '@prisma/client';
import { addHours, isAfter } from 'date-fns';

import { omit, omitEach } from './utils';

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

export async function checkAccessToken(token: string) {
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
  expiresInHours: number
) {
  return prisma.accessToken.create({
    data: {
      token,
      userId,
      generator: 'GitHub',
      expiresAt: addHours(Date.now(), expiresInHours)
    }
  });
}

export function createUser(githubId: string, username: string, email: string) {
  return prisma.user.create({
    data: {
      githubId,
      username,
      email
    }
  });
}

export function updateUser(githubId: string, username: string, email: string) {
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

export async function getUsers(name?: string, skip?: number) {
  const where: Prisma.UserWhereInput = {};

  if (name) {
    where.username = { contains: name };
  }

  const users = await prisma.user.findMany({
    include: {
      packages: true
    },
    skip: skip ?? undefined,
    take: 10,
    where
  });

  return omitEach(users, ['email', 'githubId', 'createdAt']);
}

export function getUserInternal(githubId: string) {
  return prisma.user.findUnique({
    where: {
      githubId
    }
  });
}

export function getUser(githubId?: string, uuid?: string) {
  const where: Prisma.UserWhereUniqueInput = {};

  if (githubId) {
    where.githubId = githubId;
  }

  if (uuid) {
    where.id = uuid;
  }

  return prisma.user.findUnique({
    include: {
      packages: true
    },
    where
  });
}

export async function getPackages(
  name?: string,
  author?: string,
  skip?: number
) {
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
    skip: skip ?? undefined,
    take: 25,
    where
  });

  return packages.map((pkg) => ({
    ...omit(pkg, ['userId']),
    user: omit(pkg.user, ['email', 'githubId', 'createdAt'])
  }));
}

export async function getPackage(
  name?: string,
  uuid?: string,
  allReleases = false
) {
  if (!name && !uuid) {
    throw new Error('Called with neither name nor UUID!');
  }

  const pkg = await prisma.package.findUnique({
    include: {
      user: true,
      releases: allReleases
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
    user: omit(pkg.user, ['email', 'createdAt'])
  };
}

export function getReleases(packageUuid?: string, skip?: number) {
  const where: Prisma.ReleaseWhereInput = {};

  if (packageUuid) {
    where.packageId = packageUuid;
  }

  return prisma.release.findMany({
    include: {
      package: true
    },
    skip: skip ?? undefined,
    take: 100,
    where
  });
}

export function getRelease(uuid: string) {
  return prisma.release.findUnique({
    include: {
      package: true
    },
    where: {
      id: uuid
    }
  });
}
