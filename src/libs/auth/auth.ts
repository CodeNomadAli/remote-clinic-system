import { cookies } from "next/headers";

import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

import prisma from '@/db';

import type { JWTPayload, SafeUser } from "@/libs/db/types";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "clinic-management-secret-key-change-in-production"
);

const JWT_EXPIRY = "7d";
const SALT_ROUNDS = 12;

// ============================================
// PASSWORD UTILITIES
// ============================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// ============================================
// JWT UTILITIES
// ============================================

export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    
return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// ============================================
// SESSION MANAGEMENT
// ============================================

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      sessionToken: token,   // ← fixed
      userId,
      expiresAt,
    },
  });

  return token;
}

export async function validateSession(token: string) {
  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: {
      user: {
        include: {
          roles: {
            include: {
              role: {                    // ← fixed: UserRole has "role" relation
                include: {
                  permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }

    
return null;
  }

  return session;
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.session.deleteMany({ 
    where: { sessionToken: token }   // ← fixed
  });
}

// ============================================
// AUTH HELPERS
// ============================================

export async function getCurrentUser(): Promise<SafeUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) return null;

  const session = await validateSession(token);

  if (!session) return null;

  const { password: _, ...safeUser } = session.user as any;

  
return safeUser;
}

export async function getUserPermissions(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: {                    // ← fixed
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) return [];

  return user.roles.flatMap(ur =>
    ur.role.permissions.map(rp => 
      `${rp.permission.module}:${rp.permission.action}`  // Note: adjust if your Permission model doesn't have module/action
    )
  );
}

export function hasPermission(
  userPermissions: string[],
  module: string,
  action: string
): boolean {
  const required = `${module}:${action}`;

  
return (
    userPermissions.includes(required) ||
    userPermissions.includes(`${module}:*`) ||
    userPermissions.includes("*:*")
  );
}

export async function requireAuth(requiredPermissions?: { module: string; action: string }[]) {
  const user = await getCurrentUser();

  if (!user) return { error: "Unauthorized", status: 401 };

  if (requiredPermissions?.length) {
    const permissions = await getUserPermissions(user.id);

    for (const req of requiredPermissions) {
      if (!hasPermission(permissions, req.module, req.action)) {
        return { error: "Forbidden", status: 403 };
      }
    }
  }

  return { user };
}

// ============================================
// ACTIVITY LOGGING
// ============================================

export async function logActivity(
  userId: string | null,
  action: string,
  module: string,
  entityId?: string,
  entityType?: string,
  oldData?: unknown,
  newData?: unknown,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        module,
        entityId,
        entityType,
        oldData: oldData ? JSON.stringify(oldData) : null,
        newData: newData ? JSON.stringify(newData) : null,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
