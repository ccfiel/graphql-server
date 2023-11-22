/* eslint-disable */
import type { Prisma, User, Session, Key } from "/Users/chrisianfiel/graphql-server/node_modules/.pnpm/@prisma+client@5.6.0_prisma@5.6.0/node_modules/@prisma/client";
export default interface PrismaTypes {
    User: {
        Name: "User";
        Shape: User;
        Include: Prisma.UserInclude;
        Select: Prisma.UserSelect;
        OrderBy: Prisma.UserOrderByWithRelationInput;
        WhereUnique: Prisma.UserWhereUniqueInput;
        Where: Prisma.UserWhereInput;
        Create: Prisma.UserCreateInput;
        Update: Prisma.UserUpdateInput;
        RelationName: "auth_session" | "key";
        ListRelations: "auth_session" | "key";
        Relations: {
            auth_session: {
                Shape: Session[];
                Name: "Session";
            };
            key: {
                Shape: Key[];
                Name: "Key";
            };
        };
    };
    Session: {
        Name: "Session";
        Shape: Session;
        Include: Prisma.SessionInclude;
        Select: Prisma.SessionSelect;
        OrderBy: Prisma.SessionOrderByWithRelationInput;
        WhereUnique: Prisma.SessionWhereUniqueInput;
        Where: Prisma.SessionWhereInput;
        Create: Prisma.SessionCreateInput;
        Update: Prisma.SessionUpdateInput;
        RelationName: "user";
        ListRelations: never;
        Relations: {
            user: {
                Shape: User;
                Name: "User";
            };
        };
    };
    Key: {
        Name: "Key";
        Shape: Key;
        Include: Prisma.KeyInclude;
        Select: Prisma.KeySelect;
        OrderBy: Prisma.KeyOrderByWithRelationInput;
        WhereUnique: Prisma.KeyWhereUniqueInput;
        Where: Prisma.KeyWhereInput;
        Create: Prisma.KeyCreateInput;
        Update: Prisma.KeyUpdateInput;
        RelationName: "user";
        ListRelations: never;
        Relations: {
            user: {
                Shape: User;
                Name: "User";
            };
        };
    };
}