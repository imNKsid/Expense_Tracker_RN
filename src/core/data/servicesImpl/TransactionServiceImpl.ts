import { firestore } from "@/src/config/firebase";
import { COLORS } from "@/src/constants/theme";
import {
  getLast12Months,
  getLast7Days,
  getYearsRange,
} from "@/src/utils/date-time-utils";
import { scale } from "@/src/utils/styling";
import { ResponseType, TransactionType, WalletType } from "@/types";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
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
): Promise<ResponseType> => {
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

    // If the transactionType was income and the wallet amount goes below zero
    if (transactionType === "income" && newWalletAmount < 0) {
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

export const fetchWeeklyStatsData = async (
  uid: string,
): Promise<ResponseType> => {
  try {
    const db = firestore;

    // Taking two dates, today & 7 days ago's date
    const today = new Date();

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    // Query to fetch all transactions for the last 7 days
    const transactionQuery = query(
      collection(db, "transactions"),
      where("date", ">=", Timestamp.fromDate(sevenDaysAgo)),
      where("date", "<=", Timestamp.fromDate(today)),
      orderBy("date", "desc"),
      where("uid", "==", uid),
    );

    // Executing query
    const querySnapshot = await getDocs(transactionQuery);

    // Taking a blank 7 days data having income & expense set to 0 with day & date set
    const weeklyData = getLast7Days();

    const transactionList: TransactionType[] = [];

    // Processing each transaction to calculate income & expense for each month
    querySnapshot.forEach((doc) => {
      const transaction = doc.data() as TransactionType;
      transaction.id = doc.id;
      transactionList.push(transaction);

      const transactionDate = (transaction.date as Timestamp)
        .toDate()
        .toISOString()
        .split("T")[0]; // as specific date DD-MM-YYYY

      const dayData = weeklyData.find((day) => day.date === transactionDate);

      // For every day's data, adding the income or expense amount
      if (dayData) {
        if (transaction.type === "income") {
          dayData.income += transaction.amount;
        } else if (transaction.type === "expense") {
          dayData.expense += transaction.amount;
        }
      }
    });

    // Creating an stats array by taking each day from weeklyData
    // and creating two entries in an array - one for income & another for expense
    const stats = weeklyData.flatMap((dayItem) => [
      {
        value: dayItem.income,
        // label: dayItem.date.split("-").reverse().join("-"),
        label: dayItem.day,
        spacing: scale(4),
        labelWidth: scale(30),
        frontColor: COLORS.primary, // Income bar color
      },
      {
        value: dayItem.expense,
        frontColor: COLORS.rose, // Expense bar color
      },
    ]);

    return { success: true, data: { stats, transactionList } };
  } catch (error: any) {
    console.log("Error deleting transaction =>", error);
    return { success: false, msg: error?.message };
  }
};

export const fetchMonthlyStatsData = async (
  uid: string,
): Promise<ResponseType> => {
  try {
    const db = firestore;

    // Taking two dates, today & 7 days ago's date
    const today = new Date();

    const twelveMonthsAgo = new Date(today);
    twelveMonthsAgo.setDate(today.getMonth() - 12);

    // Query to fetch all transactions for the last 12 months
    const transactionQuery = query(
      collection(db, "transactions"),
      where("date", ">=", Timestamp.fromDate(twelveMonthsAgo)),
      where("date", "<=", Timestamp.fromDate(today)),
      orderBy("date", "desc"),
      where("uid", "==", uid),
    );

    // Executing query
    const querySnapshot = await getDocs(transactionQuery);

    // Taking a blank 12 months data having income & expense set to 0 with day & date set
    const monthlyData = getLast12Months();

    const transactionList: TransactionType[] = [];

    // Mapping each transaction in a day
    querySnapshot.forEach((doc) => {
      const transaction = doc.data() as TransactionType;
      transaction.id = doc.id;
      transactionList.push(transaction);

      const transactionDate = (transaction.date as Timestamp).toDate();

      const monthName = transactionDate.toLocaleString("default", {
        month: "short",
      });

      const shortYear = transactionDate.getFullYear().toString().slice(-2);

      const monthData = monthlyData.find(
        (monthItem) => monthItem.month === `${monthName} ${shortYear}`,
      );

      // For every day's data, adding the income or expense amount
      if (monthData) {
        if (transaction.type === "income") {
          monthData.income += transaction.amount;
        } else if (transaction.type === "expense") {
          monthData.expense += transaction.amount;
        }
      }
    });

    // Creating an stats array by taking each day from weeklyData
    // and creating two entries in an array - one for income & another for expense
    const stats = monthlyData.flatMap((monthItem) => [
      {
        value: monthItem.income,
        label: monthItem.month,
        spacing: scale(4),
        labelWidth: scale(46),
        frontColor: COLORS.primary, // Income bar color
      },
      {
        value: monthItem.expense,
        frontColor: COLORS.rose, // Expense bar color
      },
    ]);

    return { success: true, data: { stats, transactionList } };
  } catch (error: any) {
    console.log("Error deleting transaction =>", error);
    return { success: false, msg: error?.message };
  }
};

export const fetchYearlyStatsData = async (
  uid: string,
): Promise<ResponseType> => {
  try {
    const db = firestore;

    // Query to fetch all transactions for the last 12 months
    const transactionQuery = query(
      collection(db, "transactions"),
      orderBy("date", "desc"),
      where("uid", "==", uid),
    );

    // Executing query
    const querySnapshot = await getDocs(transactionQuery);

    const transactionList: TransactionType[] = [];

    // Fetching the 1st transaction date
    const firstTransaction = querySnapshot.docs.reduce((earliest, doc) => {
      const transactionDate = doc.data().date.toDate();
      return transactionDate < earliest ? transactionDate : earliest;
    }, new Date());

    // Now using the 1st transaction date, obtaining the year of the 1st transaction
    const firstYear = firstTransaction.getFullYear();
    // Taking current year
    const currentYear = new Date().getFullYear();

    // Now taking a blank yearly data having income & expense set to 0
    const yearlyData = getYearsRange(firstYear, currentYear);

    // Processing each transaction to calculate income & expense for each year
    querySnapshot.forEach((doc) => {
      const transaction = doc.data() as TransactionType;
      transaction.id = doc.id;
      transactionList.push(transaction);

      const transactionYear = (transaction.date as Timestamp)
        .toDate()
        .getFullYear();

      const yearData = yearlyData.find(
        (yearItem) => yearItem.year === `${transactionYear}`,
      );

      // For every year's data, adding the income or expense amount
      if (yearData) {
        if (transaction.type === "income") {
          yearData.income += transaction.amount;
        } else if (transaction.type === "expense") {
          yearData.expense += transaction.amount;
        }
      }
    });

    // Creating an stats array by taking each day from weeklyData
    // and creating two entries in an array - one for income & another for expense
    const stats = yearlyData.flatMap((yearItem) => [
      {
        value: yearItem.income,
        label: yearItem.year,
        spacing: scale(4),
        labelWidth: scale(35),
        frontColor: COLORS.primary, // Income bar color
      },
      {
        value: yearItem.expense,
        frontColor: COLORS.rose, // Expense bar color
      },
    ]);

    return { success: true, data: { stats, transactionList } };
  } catch (error: any) {
    console.log("Error deleting transaction =>", error);
    return { success: false, msg: error?.message };
  }
};
