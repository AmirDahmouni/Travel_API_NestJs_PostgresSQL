/*
  Warnings:

  - You are about to drop the `_ApplicationDocuments` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `applicationId` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_ApplicationDocuments" DROP CONSTRAINT "_ApplicationDocuments_A_fkey";

-- DropForeignKey
ALTER TABLE "_ApplicationDocuments" DROP CONSTRAINT "_ApplicationDocuments_B_fkey";

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "applicationId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_ApplicationDocuments";

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
