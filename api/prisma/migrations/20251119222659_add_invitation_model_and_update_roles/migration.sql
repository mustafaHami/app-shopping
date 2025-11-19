/*
  Warnings:

  - The values [EDITOR] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('OWNER', 'WRITER', 'READER');
ALTER TABLE "public"."ListMember" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "ListMember" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "ListMember" ALTER COLUMN "role" SET DEFAULT 'WRITER';
COMMIT;

-- AlterTable
ALTER TABLE "ListMember" ALTER COLUMN "role" SET DEFAULT 'WRITER';

-- CreateTable
CREATE TABLE "Invitation" (
    "id" UUID NOT NULL,
    "listId" UUID NOT NULL,
    "inviterId" UUID NOT NULL,
    "inviteeId" UUID NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'READER',
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_listId_inviteeId_key" ON "Invitation"("listId", "inviteeId");

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE CASCADE ON UPDATE CASCADE;
