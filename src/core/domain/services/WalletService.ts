import { ResponseType, WalletType } from "@/types";
import {
  createOrUpdateWalletData,
  deleteWalletData,
} from "../../data/servicesImpl/WalletServiceImpl";

export const createOrUpdateWallet = async (
  walletData: Partial<WalletType>,
): Promise<ResponseType> => {
  return await createOrUpdateWalletData(walletData);
};

export const deleteWallet = async (walletId: string): Promise<ResponseType> => {
  return await deleteWalletData(walletId);
};
