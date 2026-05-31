-- Add mediaItems column
ALTER TABLE "Product" ADD COLUMN "mediaItems" JSONB NOT NULL DEFAULT '[]';

-- Migrate existing images array to mediaItems format
UPDATE "Product"
SET "mediaItems" = COALESCE(
  (SELECT jsonb_agg(jsonb_build_object('url', url, 'type', 'image'))
   FROM unnest(images) AS url),
  '[]'::jsonb
);

-- Drop old columns
ALTER TABLE "Product" DROP COLUMN "images";
ALTER TABLE "Product" DROP COLUMN "videoUrl";
