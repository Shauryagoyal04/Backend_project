import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const uploadToCloudinary = async (filePath) => {
        try {
            if(!filePath) {
                console.log("Invalid file path");
                return null;
            }
            const response = await cloudinary.uploader.upload(filePath, { 
                resource_type: 'auto' 
            });

            //console.log("File uploaded successfully on cloudinary",response.url);
            fs.unlinkSync(filePath); // Delete the locally saved temporary file after upload
            //console.log("CLoudinary Respinse",response)
            return response;
        }catch (error) {
            fs.unlinkSync(filePath); // Delete the locally saved temporary file if upload fails
            console.error("Error uploading file to Cloudinary:", error);
            return null;
        }
    }


    const getPublicIdFromUrl = (url) => {
        try {
            const parts = url.split('/');
            const fileWithExtension = parts.pop(); // "my_image.jpg"
            const publicId = fileWithExtension.split('.')[0]; // "my_image"
            
            return `${publicId}`; 
        } catch (err) {
            console.error("Error extracting public_id:", err);
            return null;
        }
    };

    const deletefromCloudinary = async (url) => {
       
        const publicId = getPublicIdFromUrl(url);
        if (!publicId) return null;

       // console.log("Public ID to delete:", publicId);

        try {
            const result = await cloudinary.uploader.destroy(publicId,{
                resource_type: 'image'
            }); 
            
            //console.log("Deleted:", result);
            return result;
        } catch (err) {
            console.error("Error deleting:", err);
            return null;
        }
    }

    export {uploadToCloudinary,deletefromCloudinary}