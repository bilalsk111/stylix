// import ImageKit,{toFile} from '@imagekit/nodejs';
// import { config } from '../config/config.js';

// const client = new ImageKit({
//   publicKey: config.IMAGEKIT_PUBLIC_KEY,
//   privateKey: config.IMAGEKIT_PRIVATE_KEY,  
//   urlEndpoint: config.IMAGEKIT_URL_ENDPOINT
// });

// // const client = new ImageKit({
// //     privateKey: process.env.IMAGEKIT_PRIVATE_KEY
// // })

// export async function uploadFile({ buffer, fileName, folder = "" }) {
//     if (!buffer) {
//         throw new Error("File buffer is missing");
//     }

//     const response = await client.files.upload({
//         file: buffer,          // ✅ raw buffer
//         fileName: fileName,    // ✅ required
//         folder
//     });

//     return response;
// }
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/config.js';

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

export async function uploadFile({ buffer, fileName, folder = "stylix" }) {
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });

  return result.secure_url;
}