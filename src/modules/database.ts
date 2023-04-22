import { Prisma, PrismaClient } from '@prisma/client';

import { getLogger } from './logging';
import { omit, omitEach } from './utils';

const log = getLogger('db');
const prisma = new PrismaClient();

export const getPackages = async (name?: string, author?: string) => {
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
      user: omit(pkg.user, [
        'password',
        'email',
        'verified',
        'verifyHash',
        'createdAt'
      ]),
      releases: omitEach(pkg.releases, ['hash'])
    }));
  } catch (error) {
    log.error(error.message);
    log.error(error.stack);
  }
};

export const getPackage = async (name: string, allReleases = false) => {
  try {
    const pkg = await prisma.package.findUnique({
      include: {
        user: true,
        releases: true
      },
      where: {
        name
      }
    });

    if (!pkg) {
      return null;
    }

    return {
      ...omit(pkg, ['userId']),
      user: omit(pkg.user, [
        'password',
        'email',
        'verified',
        'verifyHash',
        'createdAt'
      ]),
      releases: omitEach(pkg.releases, ['hash'])
    };
  } catch (error) {
    log.error(error.message);
    log.error(error.stack);
  }
};
