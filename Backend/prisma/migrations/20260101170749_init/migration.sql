/*
  Warnings:

  - You are about to drop the column `FavouriteId` on the `FavouriteTrack` table. All the data in the column will be lost.
  - You are about to drop the `Favourites` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userid` to the `FavouriteTrack` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FavouriteTrack" DROP CONSTRAINT "FavouriteTrack_FavouriteId_fkey";

-- DropForeignKey
ALTER TABLE "Favourites" DROP CONSTRAINT "Favourites_userId_fkey";

-- AlterTable
ALTER TABLE "FavouriteTrack" DROP COLUMN "FavouriteId",
ADD COLUMN     "userid" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Favourites";

-- AddForeignKey
ALTER TABLE "FavouriteTrack" ADD CONSTRAINT "FavouriteTrack_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
