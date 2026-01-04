/*
  Warnings:

  - A unique constraint covering the columns `[trackId]` on the table `FavouriteTrack` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FavouriteTrack_trackId_key" ON "FavouriteTrack"("trackId");
