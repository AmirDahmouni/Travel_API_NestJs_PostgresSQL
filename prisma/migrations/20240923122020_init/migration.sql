-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('SOS', 'VISITOR', 'TRAVELER', 'ADMIN_TRAV', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('pending', 'accepted', 'refused');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('pending', 'validated', 'accepted');

-- CreateEnum
CREATE TYPE "DocumentExtension" AS ENUM ('PDF', 'JPG', 'PNG');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('pending', 'denied', 'approved');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firstname" VARCHAR(255) NOT NULL,
    "lastname" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "type" "UserType" NOT NULL DEFAULT 'ADMIN',
    "status" "UserStatus" NOT NULL DEFAULT 'pending',
    "telephone" VARCHAR(255) NOT NULL,
    "avatar" VARCHAR(255) NOT NULL DEFAULT 'default_pdp.png',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "destinationId" INTEGER NOT NULL,
    "travelerId" INTEGER NOT NULL,
    "directory" TEXT NOT NULL,
    "validated" "ApplicationStatus" NOT NULL DEFAULT 'pending',
    "dateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "typeId" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "applicationId" INTEGER NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypeDocument" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "extension" "DocumentExtension" NOT NULL,
    "removed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TypeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Destination" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "directory" VARCHAR(255) NOT NULL,
    "pictures" TEXT[],
    "removed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "adminTravelerId" INTEGER NOT NULL,
    "travelerId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seen" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Request" (
    "id" SERIAL NOT NULL,
    "visitorId" INTEGER NOT NULL,
    "visit_to" VARCHAR(255) NOT NULL,
    "LTN" SMALLINT NOT NULL,
    "date_visit" TIMESTAMP(3) NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TypeDocumentDestinations" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_TypeDocumentDestinations_AB_unique" ON "_TypeDocumentDestinations"("A", "B");

-- CreateIndex
CREATE INDEX "_TypeDocumentDestinations_B_index" ON "_TypeDocumentDestinations"("B");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_travelerId_fkey" FOREIGN KEY ("travelerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "TypeDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_adminTravelerId_fkey" FOREIGN KEY ("adminTravelerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_travelerId_fkey" FOREIGN KEY ("travelerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TypeDocumentDestinations" ADD CONSTRAINT "_TypeDocumentDestinations_A_fkey" FOREIGN KEY ("A") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TypeDocumentDestinations" ADD CONSTRAINT "_TypeDocumentDestinations_B_fkey" FOREIGN KEY ("B") REFERENCES "TypeDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
