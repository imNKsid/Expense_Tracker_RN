import { ResponseType, TransactionType } from "@/types";
import {
  createOrUpdateTransactionData,
  deleteTransactionData,
  fetchMonthlyStatsData,
  fetchWeeklyStatsData,
  fetchYearlyStatsData,
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

export const fetchWeeklyStats = async (uid: string): Promise<ResponseType> => {
  return await fetchWeeklyStatsData(uid);
};

export const fetchMonthlyStats = async (uid: string): Promise<ResponseType> => {
  return await fetchMonthlyStatsData(uid);
};

export const fetchYearlyStats = async (uid: string): Promise<ResponseType> => {
  return await fetchYearlyStatsData(uid);
};
