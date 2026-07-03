import { v2 as cloudinary } from "cloudinary";

// 🔥 OPTIMIZED HELPER: Uses Bulk Delete API
export const deleteCloudinaryImages = async (images = []) => {
  const publicIds = images
    .map((img) => img?.public_id)
    .filter(Boolean);

  if (!publicIds.length) return 0;

  // Single API call to Cloudinary instead of multiple concurrent calls
  await cloudinary.api.delete_resources(publicIds);

  return publicIds.length;
};
