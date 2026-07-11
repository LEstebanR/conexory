/*
  Warnings:

  - You are about to drop the `property_events` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "property_events" DROP CONSTRAINT "property_events_propertyId_fkey";

-- DropTable
DROP TABLE "property_events";
