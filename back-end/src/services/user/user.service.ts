import prisma from '../../prisma/client';
import { UserPayload } from '../../types';

export class UserService {
  /**
   * Get user by ID with full profile data
   */
  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        userType: true,
        emailVerified: true,
        phoneVerified: true,
        profilePhoto: true,
        preferences: true,
        status: true,
        registrationDate: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(id: string, updateData: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    profilePhoto: string;
    preferences: any;
  }>) {
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        userType: true,
        emailVerified: true,
        phoneVerified: true,
        profilePhoto: true,
        preferences: true,
        status: true,
        registrationDate: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Get users list (admin only)
   */
  static async getUsers(filters: {
    userType?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const { userType, status, limit = 20, offset = 0 } = filters;

    const where: any = {};
    if (userType) where.userType = userType;
    if (status) where.status = status;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          userType: true,
          status: true,
          registrationDate: true,
          lastLogin: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, limit, offset };
  }

  /**
   * Update user status (admin only)
   */
  static async updateUserStatus(id: string, status: 'actif' | 'suspendu' | 'inactif') {
    const user = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        updatedAt: true,
      },
    });

    return user;
  }
}

