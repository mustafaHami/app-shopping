/*
  Warnings:

  - Added the required column `inviteePseudonym` to the `Invitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userPseudonym` to the `ListMember` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add the new columns as nullable
ALTER TABLE "Invitation" ADD COLUMN "inviteePseudonym" TEXT;
ALTER TABLE "ListMember" ADD COLUMN "userPseudonym" TEXT;

-- Step 2: Set default values for existing rows (using email as pseudonym)
UPDATE "Invitation" SET "inviteePseudonym" = "inviteeEmail" WHERE "inviteePseudonym" IS NULL;
UPDATE "ListMember" SET "userPseudonym" = COALESCE("userEmail", 'user_' || "userId") WHERE "userPseudonym" IS NULL;

-- Step 3: Make the columns required
ALTER TABLE "Invitation" ALTER COLUMN "inviteePseudonym" SET NOT NULL;
ALTER TABLE "ListMember" ALTER COLUMN "userPseudonym" SET NOT NULL;

-- Step 4: Make inviteeEmail optional
ALTER TABLE "Invitation" ALTER COLUMN "inviteeEmail" DROP NOT NULL;
