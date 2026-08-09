CREATE TYPE "MarketplacePlatform" AS ENUM ('TRENDYOL', 'HEPSIBURADA');
CREATE TYPE "MarketplaceStatus" AS ENUM ('CONNECTED', 'ERROR');

CREATE TABLE "marketplace_connections" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "platform" "MarketplacePlatform" NOT NULL,
    "merchantId" TEXT NOT NULL,
    "apiKeyEncrypted" TEXT NOT NULL,
    "apiSecretEncrypted" TEXT NOT NULL,
    "status" "MarketplaceStatus" NOT NULL DEFAULT 'CONNECTED',
    "lastCheckedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "marketplace_connections_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "marketplace_connections_companyId_platform_key" ON "marketplace_connections"("companyId", "platform");
CREATE INDEX "marketplace_connections_companyId_idx" ON "marketplace_connections"("companyId");

ALTER TABLE "marketplace_connections"
ADD CONSTRAINT "marketplace_connections_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
