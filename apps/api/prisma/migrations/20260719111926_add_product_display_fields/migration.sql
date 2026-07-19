-- AlterTable
ALTER TABLE "products" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Genel',
ADD COLUMN     "criticalStock" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "emoji" TEXT NOT NULL DEFAULT '📦';
