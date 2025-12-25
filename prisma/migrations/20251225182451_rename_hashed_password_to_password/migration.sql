-- RenameColumn: Rename hashedPassword to password
ALTER TABLE "User" RENAME COLUMN "hashedPassword" TO "password";
