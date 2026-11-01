import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      groupeId: string;
      fraterniteId: string | null;
    };
  }

  interface User {
    role?: string;
    groupeId?: string;
    fraterniteId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    groupeId?: string;
    fraterniteId?: string | null;
  }
}
