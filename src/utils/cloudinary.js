import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type:"auto"
    
      
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};



const deleteFileOnCloudinary = async (publicid) => {
  try {
    if (!publicid) return "Public id not found";
    const deletresponse = await cloudinary.uploader.destroy(publicid, {
      resource_type: "video",
    });
    return deletresponse;
  } catch (e) {
    return e.message;
  }
};


export { uploadOnCloudinary, deleteFileOnCloudinary };
