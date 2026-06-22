import { firestore } from "@/src/config/firebase";
import { ResponseType, WalletType } from "@/types";
import { collection, deleteDoc, doc, setDoc } from "firebase/firestore";
import { uploadFileToCloudinary } from "./UserServiceImpl";

export const createOrUpdateWalletData = async (
  walletData: Partial<WalletType>,
): Promise<ResponseType> => {
  try {
    let walletToSave = { ...walletData };

    if (walletData.image && walletData?.image?.uri) {
      const imageUploadRes = await uploadFileToCloudinary(
        walletData.image,
        "wallets",
      );

      if (!imageUploadRes.success) {
        return {
          success: false,
          msg: imageUploadRes.msg || "Failed to upload the wallet icon",
        };
      }
      walletData.image = imageUploadRes.data;
    }

    if (!walletData?.id) {
      // New Wallet
      walletToSave.amount = 0;
      walletToSave.totalIncome = 0;
      walletToSave.totalExpenses = 0;
      walletToSave.created = new Date();
    }

    const walletRef = walletData?.id
      ? doc(firestore, "wallets", walletData?.id)
      : doc(collection(firestore, "wallets"));

    await setDoc(walletRef, walletToSave, { merge: true }); // Updates only the data provided

    return { success: true, data: { ...walletToSave, id: walletRef.id } };
  } catch (error: any) {
    console.log("Error creating or updating wallet =>", error);
    return {
      success: false,
      msg: error?.message || "Could not create or update wallet",
    };
  }
};

export const deleteWalletData = async (
  walletId: string,
): Promise<ResponseType> => {
  try {
    const walletRef = doc(firestore, "wallets", walletId);
    await deleteDoc(walletRef);

    return { success: true, msg: "Wallet deleted successfully!" };
  } catch (error: any) {
    console.log("Error deleting wallet =>", error);
    return {
      success: false,
      msg: error?.message || "Could not delete wallet",
    };
  }
};
