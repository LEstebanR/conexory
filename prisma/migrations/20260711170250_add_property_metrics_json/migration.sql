-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "metrics" JSONB NOT NULL DEFAULT '{"whatsapp":0,"social":{"instagram":0,"facebook":0,"tiktok":0,"linkedin":0,"youtube":0},"contact":{"phone":0,"email":0,"whatsapp":0}}';
