import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../services/auth';
import { AuthenticatedRequest, PermissionLevel, RoutePermission, AuthenticationError, AuthorizationError } from '../types';

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Try to get token from cookies first, then from Authorization header
    let token = req.cookies?.accessToken;

    if (!token) {
      // Fallback to Authorization header if cookie not found
      const authHeader = req.headers.authorization;
      token = JWTService.extractTokenFromHeader(authHeader);
    }

    if (!token) {
      throw new AuthenticationError('Access token is required');
    }

    const userPayload = JWTService.verifyAccessToken(token);

    (req as AuthenticatedRequest).user = userPayload;

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (requiredPermission: PermissionLevel, allowSameUser: boolean = false) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      next(new AuthenticationError('Authentication required'));
      return;
    }

    const userLevel = getUserPermissionLevel(authReq.user.userType);

    if (userLevel < requiredPermission) {
      if (allowSameUser && isAccessingOwnResource(authReq)) {
        next();
        return;
      }

      next(new AuthorizationError('Insufficient permissions'));
      return;
    }

    next();
  };
};

export const requireAuth = authenticateToken;

export const requireAdmin = authorize(PermissionLevel.ADMIN);

export const requireOwner = authorize(PermissionLevel.OWNER);

export const requireTenant = authorize(PermissionLevel.TENANT);

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Try to get token from cookies first, then from Authorization header
    let token = req.cookies?.accessToken;

    if (!token) {
      // Fallback to Authorization header if cookie not found
      const authHeader = req.headers.authorization;
      token = JWTService.extractTokenFromHeader(authHeader);
    }

    if (token) {
      const userPayload = JWTService.verifyAccessToken(token);
      (req as AuthenticatedRequest).user = userPayload;
    }

    next();
  } catch (error) {
    // For optional auth, we don't throw errors, just continue without user
    next();
  }
};

function getUserPermissionLevel(userType: string): PermissionLevel {
  switch (userType) {
    case 'admin':
      return PermissionLevel.ADMIN;
    case 'proprietaire':
      return PermissionLevel.OWNER;
    case 'locataire':
      return PermissionLevel.TENANT;
    default:
      return PermissionLevel.PUBLIC;
  }
}

function isAccessingOwnResource(req: AuthenticatedRequest): boolean {
  const userId = req.user?.id;
  const resourceUserId = req.params.userId || req.params.id;

  return userId === resourceUserId;
}

/**
 * Middleware to check if user is NOT already authenticated
 * Used for login/register routes to prevent double authentication
 */
export const checkNotAlreadyAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check for token in cookies first, then Authorization header
    let token = req.cookies?.accessToken;

    if (!token) {
      // Fallback to Authorization header if cookie not found
      const authHeader = req.headers.authorization;
      token = JWTService.extractTokenFromHeader(authHeader);
    }

    if (token) {
      try {
        // Try to verify the token
        JWTService.verifyAccessToken(token);

        // If token is valid, user is already authenticated
        res.status(400).json({
          success: false,
          message: 'User is already authenticated. Please logout first.',
          type: 'already_authenticated',
        });
        return;
      } catch (error) {
        // Token is invalid/expired, continue to login
        // This is expected behavior - invalid tokens should allow login
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const createRouteGuard = (permission: RoutePermission) => {
  return [
    authenticateToken,
    authorize(permission.requiredLevel, permission.allowSameUser || false),
  ];
};

