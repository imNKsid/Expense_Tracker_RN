import { expenseCategories, transactionTypes } from "@/src/constants/data";
import { COLORS, radius, spacingX, spacingY } from "@/src/constants/theme";
import { useAuth } from "@/src/contexts/authContext";
import { useFetchData } from "@/src/core/domain/hooks/useFetchData";
import {
  createOrUpdateTransaction,
  deleteTransaction,
} from "@/src/core/domain/services/TransactionService";
import { isIOS } from "@/src/utils/safe-data-utils";
import { scale, verticalScale } from "@/src/utils/styling";
import { TransactionType, WalletType } from "@/types";
import DateTimePicker, {
  DateTimePickerChangeEvent,
} from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { orderBy, where } from "firebase/firestore";
import * as Icons from "phosphor-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import BackButton from "../BackButton";
import CustomButton from "../CustomButton";
import Header from "../Header";
import ImageUpload from "../ImageUpload";
import Input from "../Input";
import ModalWrapper from "../ModalWrapper";
import Typography from "../Typography";

type TransactionParamType = {
  id: string;
  type: string;
  amount: string;
  category?: string;
  date: string;
  description?: string;
  image?: any;
  uid?: string;
  walletId: string;
};

const TransactionModal = () => {
  const router = useRouter();
  const { user } = useAuth();

  const isIosDevice = isIOS();

  const [transaction, setTransaction] = useState<TransactionType>({
    type: "expense",
    amount: 0,
    description: "",
    category: "",
    date: new Date(),
    walletId: "",
    image: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDatePickerVisible, setIsDatePickerVisible] =
    useState<boolean>(false);

  const oldTransaction: TransactionParamType = useLocalSearchParams();

  const {
    data: walletList,
    error: isWalletError,
    isLoading: isWalletLoading,
  } = useFetchData<WalletType>("wallets", [
    where("uid", "==", user?.uid),
    orderBy("created", "desc"),
  ]);

  useEffect(() => {
    if (oldTransaction?.id) {
      console.log("oldTransaction =>", oldTransaction);

      setTransaction({
        type: oldTransaction.type,
        amount: Number(oldTransaction.amount),
        description: oldTransaction.description || "",
        category: oldTransaction.category,
        date: new Date(oldTransaction.date),
        walletId: oldTransaction.walletId,
        image: oldTransaction?.image,
      });
    }
  }, [oldTransaction?.id]);

  const _handleDelete = async () => {
    if (!oldTransaction?.id) {
      return;
    }
    setIsLoading(true);
    const res = await deleteTransaction(
      oldTransaction.id,
      oldTransaction.walletId,
    );
    setIsLoading(false);

    if (res.success) {
      router.back();
    } else {
      Alert.alert("Transaction", res.msg);
    }
  };

  const _showDeleteAlert = () => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to delete this transaction?",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => _handleDelete(),
          style: "destructive",
        },
      ],
    );
  };

  const _handleDateSelection = (
    event: DateTimePickerChangeEvent,
    date: Date,
  ) => {
    setTransaction({ ...transaction, date: date });
    setIsDatePickerVisible(isIosDevice ?? false);
  };

  const _handleSubmit = async () => {
    setIsLoading(true);
    const { type, amount, description, category, date, walletId, image } =
      transaction;

    if (!walletId || !date || !amount || (type === "expense" && !category)) {
      Alert.alert("Transaction", "Please fill all the fields!");
      setIsLoading(false);
      return;
    }
    const data: TransactionType = {
      type,
      amount,
      description,
      category,
      date,
      walletId,
      image: image || null,
      uid: user?.uid,
    };

    // For updating the wallet, setting Wallet ID
    if (oldTransaction?.id) {
      data.id = oldTransaction.id;
      // If the updated type is income, then remove the category
      if (data.type === "income") {
        data.category = "";
      }
    }
    const res = await createOrUpdateTransaction(data);
    setIsLoading(false);
    if (res.success) {
      router.back();
    } else {
      Alert.alert("Transaction", res.msg);
    }
  };

  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header
          title={oldTransaction?.id ? "Update Transaction" : "New Transaction"}
          leftIcon={<BackButton />}
          style={styles.header}
        />

        {/* Form */}
        <ScrollView contentContainerStyle={styles.form}>
          {/* Transaction Type */}
          <View style={styles.inputContainer}>
            <Typography color={COLORS.neutral200} size={16}>
              Transaction Type
            </Typography>
            <Dropdown
              style={styles.dropdownContainer}
              activeColor={COLORS.neutral700}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedItemText}
              iconStyle={styles.dropdownIcon}
              data={transactionTypes}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={"Select item"}
              itemTextStyle={styles.dropdownItemText}
              itemContainerStyle={styles.dropdownItemContainer}
              containerStyle={styles.dropdownListContainer}
              value={transaction.type}
              onChange={(item) => {
                setTransaction({ ...transaction, type: item.value });
              }}
            />
          </View>

          {/* Wallet */}
          <View style={styles.inputContainer}>
            <Typography color={COLORS.neutral200} size={16}>
              Wallet
            </Typography>
            <Dropdown
              style={styles.dropdownContainer}
              activeColor={COLORS.neutral700}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedItemText}
              iconStyle={styles.dropdownIcon}
              data={walletList.map((wallet) => ({
                label: `${wallet?.name} ($${wallet.amount})`,
                value: wallet.id,
              }))}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={"Select wallet"}
              itemTextStyle={styles.dropdownItemText}
              itemContainerStyle={styles.dropdownItemContainer}
              containerStyle={styles.dropdownListContainer}
              value={transaction.walletId}
              onChange={(item) => {
                setTransaction({ ...transaction, walletId: item.value });
              }}
            />
          </View>

          {/* Expense Categories */}
          {transaction.type === "expense" && (
            <View style={styles.inputContainer}>
              <Typography color={COLORS.neutral200} size={16}>
                Expense Category
              </Typography>
              <Dropdown
                style={styles.dropdownContainer}
                activeColor={COLORS.neutral700}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelectedItemText}
                iconStyle={styles.dropdownIcon}
                data={Object.values(expenseCategories)}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={"Select category"}
                itemTextStyle={styles.dropdownItemText}
                itemContainerStyle={styles.dropdownItemContainer}
                containerStyle={styles.dropdownListContainer}
                value={transaction.category}
                onChange={(item) => {
                  setTransaction({ ...transaction, category: item.value });
                }}
              />
            </View>
          )}

          {/* Date picker */}
          <View style={styles.inputContainer}>
            <Typography color={COLORS.neutral200} size={16}>
              Date
            </Typography>
            {!isDatePickerVisible && (
              <Pressable
                style={styles.dateInput}
                onPress={() => setIsDatePickerVisible(true)}
              >
                <Typography size={14}>
                  {(transaction.date as Date).toLocaleDateString()}
                </Typography>
              </Pressable>
            )}
            {isDatePickerVisible && (
              <View>
                <DateTimePicker
                  themeVariant={"dark"}
                  value={transaction.date as Date}
                  textColor={COLORS.white}
                  mode={"date"}
                  display={isIosDevice ? "spinner" : "default"}
                  onValueChange={_handleDateSelection}
                />
                {isIosDevice && (
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setIsDatePickerVisible(false)}
                  >
                    <Typography size={15} fontWeight={"500"}>
                      OK
                    </Typography>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Amount */}
          <View style={styles.inputContainer}>
            <Typography color={COLORS.neutral200} size={16}>
              Amount
            </Typography>
            <Input
              placeholder="Enter the amount"
              keyboardType={"numeric"}
              value={`${transaction.amount}`}
              onChangeText={(val) =>
                setTransaction({
                  ...transaction,
                  amount: Number(val.replace(/[^0-9]/g, "")),
                })
              }
            />
          </View>

          {/* Description */}
          <View style={styles.inputContainer}>
            <View style={styles.flexRow}>
              <Typography color={COLORS.neutral200} size={16}>
                Description
              </Typography>
              <Typography color={COLORS.neutral500} size={14}>
                (optional)
              </Typography>
            </View>
            <Input
              placeholder="Enter the description"
              multiline
              value={transaction.description}
              containerStyle={styles.descriptionInput}
              onChangeText={(val) =>
                setTransaction({
                  ...transaction,
                  description: val,
                })
              }
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.flexRow}>
              <Typography color={COLORS.neutral200} size={16}>
                Receipt Image
              </Typography>
              <Typography color={COLORS.neutral500} size={14}>
                (optional)
              </Typography>
            </View>
            <ImageUpload
              file={transaction.image}
              placeholder="Upload Image"
              onSelect={(file) =>
                setTransaction({ ...transaction, image: file })
              }
              onClear={() => setTransaction({ ...transaction, image: null })}
            />
          </View>
        </ScrollView>
      </View>

      <View style={styles.footer}>
        {oldTransaction?.id && !isLoading && (
          <CustomButton style={styles.deleteButton} onPress={_showDeleteAlert}>
            <Icons.TrashIcon
              color={COLORS.white}
              size={verticalScale(24)}
              weight={"bold"}
            />
          </CustomButton>
        )}
        <CustomButton
          onPress={_handleSubmit}
          style={styles.buttonContainer}
          loading={isLoading}
        >
          <Typography color={COLORS.black} fontWeight={"700"}>
            {oldTransaction?.id ? "Update" : "Submit"}
          </Typography>
        </CustomButton>
      </View>
    </ModalWrapper>
  );
};

export default TransactionModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingY._20,
  },
  header: {
    marginBottom: spacingY._10,
  },
  form: {
    paddingVertical: spacingY._15,
    gap: spacingY._30,
    paddingBottom: spacingY._40,
  },
  inputContainer: {
    gap: spacingY._10,
  },
  dropdownContainer: {
    height: verticalScale(54),
    borderWidth: 1,
    borderColor: COLORS.neutral300,
    paddingHorizontal: spacingX._15,
    borderRadius: radius._15,
    borderCurve: "continuous",
  },
  dropdownPlaceholder: {
    color: COLORS.white,
  },
  dropdownIcon: {
    height: verticalScale(30),
    tintColor: COLORS.neutral300,
  },
  dropdownItemContainer: {
    borderRadius: radius._15,
    marginHorizontal: spacingX._7,
  },
  dropdownItemText: {
    color: COLORS.white,
  },
  dropdownSelectedItemText: {
    color: COLORS.white,
    fontSize: verticalScale(14),
  },
  dropdownListContainer: {
    backgroundColor: COLORS.neutral900,
    borderRadius: radius._15,
    borderCurve: "continuous",
    paddingVertical: spacingY._7,
    top: 5,
    borderColor: COLORS.neutral500,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 5,
  },
  datePickerButton: {
    backgroundColor: COLORS.neutral700,
    alignSelf: "flex-end",
    padding: spacingY._7,
    marginRight: spacingX._7,
    paddingHorizontal: spacingY._15,
    borderRadius: radius._10,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacingX._20,
    gap: scale(12),
    paddingTop: spacingY._15,
    borderTopColor: COLORS.neutral700,
    marginBottom: spacingY._5,
    borderTopWidth: 1,
  },
  deleteButton: {
    backgroundColor: COLORS.rose,
    paddingHorizontal: spacingX._15,
  },
  buttonContainer: {
    flex: 1,
  },
  androidDropdown: {
    justifyContent: "center",
    borderWidth: 1,
    fontSize: verticalScale(14),
    color: COLORS.white,
    borderColor: COLORS.neutral300,
    borderRadius: radius._17,
    borderCurve: "continuous",
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._5,
  },
  descriptionInput: {
    height: verticalScale(100),
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 15,
  },
  dateInput: {
    flexDirection: "row",
    height: verticalScale(54),
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.neutral300,
    borderRadius: radius._17,
    borderCurve: "continuous",
    paddingHorizontal: spacingX._15,
  },
});
