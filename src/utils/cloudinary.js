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
            console.log("CLoudinary Respinse",response)
            return response;
        }catch (error) {
            fs.unlinkSync(filePath); // Delete the locally saved temporary file if upload fails
            console.error("Error uploading file to Cloudinary:", error);
            return null;
        }
    }

    export {uploadToCloudinary}