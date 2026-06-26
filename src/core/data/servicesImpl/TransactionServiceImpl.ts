import { firestore } from "@/src/config/firebase";
import { ResponseType, TransactionType, WalletType } from "@/types";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { uploadFileToCloudinary } from "./UserServiceImpl";
import { createOrUpdateWalletData } from "./WalletServiceImpl";

export const createOrUpdateTransactionData = async (
  transactionData: Partial<TransactionType>,
): Promise<ResponseType> => {
  try {
    const { id, type, walletId, amount, image } = transactionData;

    if (!amount || amount <= 0 || !walletId || !type) {
      return { success: false, msg: "Invalid transaction data!" };
    }

    if (id) {
      // Update existing transaction
      const oldTransactionSnapshot = await getDoc(
        doc(firestore, "transactions", id),
      );
      const oldTransaction = oldTransactionSnapshot.data() as TransactionType;

      // If the type or amount or wallet doesn't matches then we need to revert the previous transaction
      const shouldRevertOriginal =
        oldTransaction.type !== type ||
        oldTransaction.amount !== amount ||
        oldTransaction.walletId !== walletId;

      if (shouldRevertOriginal) {
        // Reverting the transactions & updating wallet balance
        const res = await revertAndUpdateWallets(
          oldTransaction,
          Number(amount),
          type,
          walletId,
        );

        if (!res.success) return res;
      }
    } else {
      // Update wallet for new transaction
      const res = await updateWalletForNewTransaction(
        walletId,
        Number(amount),
        type,
      );

      if (!res.success) return res;
    }

    if (image && image?.uri) {
      const imageUploadRes = await uploadFileToCloudinary(
        image,
        "transactions",
      );

      if (!imageUploadRes.success) {
        return {
          success: false,
          msg: imageUploadRes.msg || "Failed to upload receipt image",
        };
      }
      transactionData.image = imageUploadRes.data;
    }

    const transactionRef = id
      ? doc(firestore, "transactions", id)
      : doc(collection(firestore, "transactions"));

    await setDoc(transactionRef, transactionData, { merge: true });

    return {
      success: true,
      data: { ...transactionData, id: transactionRef.id },
    };
  } catch (error: any) {
    console.log("Error update user =>", error);
    return { success: false, msg: error?.message };
  }
};

const revertAndUpdateWallets = async (
  oldTransaction: TransactionType,
  newTransactionAmount: number,
  newTransactionType: string,
  newWalletId: string,
) => {
  try {
    // Fetching the original wallet
    const walletRef = doc(firestore, "wallets", oldTransaction.walletId);
    const originalWalletSnapshot = await getDoc(walletRef);
    const originalWallet = originalWalletSnapshot.data() as WalletType;

    // Fetching the new wallet to update later
    let newWalletSnapshot = await getDoc(
      doc(firestore, "wallets", newWalletId),
    );
    let newWallet = newWalletSnapshot.data() as WalletType;

    // Taking old transaction's revert type
    const revertType =
      oldTransaction.type === "income" ? "totalIncome" : "totalExpenses";

    // Taking old transaction's revert income/expense value
    const revertIncomeExpense: number =
      oldTransaction.type === "income"
        ? -Number(oldTransaction.amount)
        : Number(oldTransaction.amount);

    // Reverted wallet's amount
    const revertedWalletAmount =
      Number(originalWallet.amount) + revertIncomeExpense;

    // Taking old transaction's revert income/expense amount
    const revertedIncomeExpenseAmount =
      Number(originalWallet[revertType]) - Number(oldTransaction.amount);

    // If the user tries the increase the expense amount but sufficient balance is not there,
    // then user shouldn't be able to do that
    if (newTransactionType === "expense") {
      if (
        oldTransaction.walletId === newWalletId &&
        revertedWalletAmount < newTransactionAmount
      ) {
        return {
          success: false,
          msg: "The selected wallet don't have enough balance",
        };
      }

      // If user tries to add expense from a new wallet but the wallet don't have enough balance
      // then user shouldn't be able to do that
      if (newWallet.amount! < newTransactionAmount) {
        return {
          success: false,
          msg: "The selected new wallet don't have enough balance",
        };
      }
    }

    // Finally, reverting the wallet's amount
    await createOrUpdateWalletData({
      id: oldTransaction.walletId,
      amount: revertedWalletAmount,
      [revertType]: revertedIncomeExpenseAmount,
    });

    // ----------------------------------------------------------------
    // Now refetching the new wallet because we have just updated it
    newWalletSnapshot = await getDoc(doc(firestore, "wallets", newWalletId));
    newWallet = newWalletSnapshot.data() as WalletType;

    const updateType =
      newTransactionType === "income" ? "totalIncome" : "totalExpenses";

    const updatedTransactionAmount: number =
      newTransactionType === "income"
        ? Number(newTransactionAmount)
        : -Number(newTransactionAmount);

    const newWalletAmount = Number(newWallet.amount) + updatedTransactionAmount;

    const newIncomeExpenseAmount =
      Number(newWallet[updateType]) + Number(newTransactionAmount);

    // Finally updating the wallet's balance
    await createOrUpdateWalletData({
      id: newWalletId,
      amount: newWalletAmount,
      [updateType]: newIncomeExpenseAmount,
    });

    return { success: true };
  } catch (error: any) {
    console.log("Error update user =>", error);
    return { success: false, msg: error?.message };
  }
};

const updateWalletForNewTransaction = async (
  walletId: string,
  amount: number,
  type: string,
) => {
  try {
    const walletRef = doc(firestore, "wallets", walletId);
    const walletSnapshot = await getDoc(walletRef);
    if (!walletSnapshot.exists()) {
      console.log("Error updating wallet for new transaction");
      return { success: false, msg: "Wallet not found!" };
    }

    const walletData = walletSnapshot.data() as WalletType;

    if (type === "expense" && walletData.amount! - amount < 0) {
      return {
        success: false,
        msg: "Selected wallet don't have enough balance!",
      };
    }

    const updateType = type === "income" ? "totalIncome" : "totalExpenses";
    const updatedWalletAmount =
      type === "income"
        ? Number(walletData.amount) + amount
        : Number(walletData.amount) - amount;

    const updatedTotals =
      type === "income"
        ? Number(walletData.totalIncome) + amount
        : Number(walletData.totalExpenses) + amount;

    await updateDoc(walletRef, {
      amount: updatedWalletAmount,
      [updateType]: updatedTotals,
    });

    return { success: true };
  } catch (error: any) {
    console.log("Error update wallet for new transaction =>", error);
    return { success: false, msg: error?.message };
  }
};

export const deleteTransactionData = async (
  transactionId: string,
  walletId: string,
) => {
  try {
    const transactionRef = doc(firestore, "transactions", transactionId);
    const transactionSnapshot = await getDoc(transactionRef);

    if (!transactionSnapshot.exists()) {
      return { success: false, msg: "Transaction not found" };
    }

    const transactionData = transactionSnapshot.data() as TransactionType;

    const transactionType = transactionData.type;
    const transactionAmount = transactionData.amount;

    // Fetch wallet to update amount, totalIncome or totalExpenses values
    const walletSnapshot = await getDoc(doc(firestore, "wallets", walletId));
    const walletData = walletSnapshot.data() as WalletType;

    // Check fields to be updated based on transaction type
    const updateType =
      transactionType === "income" ? "totalIncome" : "totalExpenses";

    // If the transactionType was income, then subtract the transactionAmount from the wallet amount
    // Or else, if the transactionType was expense, then add the transactionAmount to the wallet amount
    const newWalletAmount =
      walletData.amount! -
      (transactionType === "income" ? transactionAmount : -transactionAmount);

    const newIncomeExpenseAmount = walletData[updateType]! - transactionAmount;

    // If the transactionType was expense and the wallet amount goes below zero
    if (transactionType === "expense" && newWalletAmount < 0) {
      return {
        success: false,
        msg: "You cannot delete this transaction!",
      };
    }

    await createOrUpdateWalletData({
      id: walletId,
      amount: newWalletAmount,
      [updateType]: newIncomeExpenseAmount,
    });

    await deleteDoc(transactionRef);

    return { success: true };
  } catch (error: any) {
    console.log("Error deleting transaction =>", error);
    return { success: false, msg: error?.message };
  }
};
