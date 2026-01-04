/*
  Warnings:

  - Added the required column `Favouriteid` to the `FavouriteTrack` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FavouriteTrack" ADD COLUMN     "Favouriteid" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Favourite" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Favourite_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Favourite" ADD CONSTRAINT "Favourite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteTrack" ADD CONSTRAINT "FavouriteTrack_Favouriteid_fkey" FOREIGN KEY ("Favouriteid") REFERENCES "Favourite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
