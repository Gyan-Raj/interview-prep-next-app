-- DropForeignKey
ALTER TABLE "UserInvite" DROP CONSTRAINT "UserInvite_userId_fkey";

-- AddForeignKey
ALTER TABLE "UserInvite" ADD CONSTRAINT "UserInvite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
