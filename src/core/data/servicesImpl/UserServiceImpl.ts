import { firestore } from "@/src/config/firebase";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from "@/src/constants";
import { ResponseType, UserDataType } from "@/types";
import axios from "axios";
import { doc, updateDoc } from "firebase/firestore";

const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export const uploadFileToCloudinary = async (
  file: string | { uri: string },
  folderName: string,
): Promise<ResponseType> => {
  try {
    if (typeof file === "string") {
      return { success: true, data: file };
    }
    if (file && file?.uri) {
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        type: "image/jpeg",
        name: file?.uri?.split("/").pop() || "file.jpg",
      } as any);

      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", folderName);

      const response = await axios.post(CLOUDINARY_API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return { success: true, data: response.data.secure_url };
    }
    return { success: true };
  } catch (error: any) {
    console.log("Error uploading file =>", error);
    return { success: false, msg: error?.message || "Could not upload file" };
  }
};

export const updateUserData = async (
  uid: string,
  updatedData: UserDataType,
): Promise<ResponseType> => {
  try {
    if (updatedData.image && updatedData?.image?.uri) {
      const imageUploadRes = await uploadFileToCloudinary(
        updatedData.image,
        "users",
      );

      if (!imageUploadRes.success) {
        return {
          success: false,
          msg: imageUploadRes.msg || "Failed to upload image",
        };
      }
      updatedData.image = imageUploadRes.data;
    }

    const userRef = doc(firestore, "users", uid);
    await updateDoc(userRef, updatedData);

    return { success: true, msg: "Profile Updated Successfuly" };
  } catch (error: any) {
    console.log("Error update user =>", error);
    return { success: false, msg: error?.message };
  }
};
