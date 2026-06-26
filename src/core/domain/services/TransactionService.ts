import { ResponseType, TransactionType } from "@/types";
import {
  createOrUpdateTransactionData,
  deleteTransactionData,
} from "../../data/servicesImpl/TransactionServiceImpl";

export const createOrUpdateTransaction = async (
  transactionData: Partial<TransactionType>,
): Promise<ResponseType> => {
  return await createOrUpdateTransactionData(transactionData);
};

export const deleteTransaction = async (
  transactionId: string,
  walletId: string,
): Promise<ResponseType> => {
  return await deleteTransactionData(transactionId, walletId);
};
