-- CreateTable
CREATE TABLE "Favourites" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Favourites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavouriteTrack" (
    "id" SERIAL NOT NULL,
    "FavouriteId" INTEGER NOT NULL,
    "trackId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "FavouriteTrack_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Favourites" ADD CONSTRAINT "Favourites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteTrack" ADD CONSTRAINT "FavouriteTrack_FavouriteId_fkey" FOREIGN KEY ("FavouriteId") REFERENCES "Favourites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteTrack" ADD CONSTRAINT "FavouriteTrack_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
