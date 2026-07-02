import { COLORS, spacingX, spacingY } from "@/src/constants/theme";
import { useAuth } from "@/src/contexts/authContext";
import { useFetchData } from "@/src/core/domain/hooks/useFetchData";
import { TransactionType } from "@/types";
import { useRouter } from "expo-router";
import { orderBy, where } from "firebase/firestore";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import BackButton from "../BackButton";
import Header from "../Header";
import Input from "../Input";
import ModalWrapper from "../ModalWrapper";
import TransactionList from "../home/TransactionList";

const SearchModal = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [searchText, setSearchText] = useState<string>("");

  const constraints = [where("uid", "==", user?.uid), orderBy("date", "desc")];

  const {
    data: allTransactionList,
    error,
    isLoading,
  } = useFetchData<TransactionType>("transactions", constraints);

  const searchedTransactionList = allTransactionList.filter((item) => {
    if (searchText.length > 1) {
      if (
        item.category?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.type?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchText.toLowerCase())
      ) {
        return true;
      }
      return false;
    }
    return true;
  });

  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header
          title={"Search"}
          leftIcon={<BackButton />}
          style={styles.header}
        />

        {/* Form */}
        <ScrollView contentContainerStyle={styles.form}>
          {/* Name */}
          <View style={styles.inputContainer}>
            <Input
              placeholder="Enter your search text"
              placeholderTextColor={COLORS.neutral400}
              value={searchText}
              onChangeText={(val) => setSearchText(val)}
              containerStyle={styles.inputFieldStyle}
            />
          </View>

          <TransactionList
            title={"Transactions"}
            data={searchedTransactionList}
            loading={isLoading}
            emptyListMessage={"No transactions matched!"}
          />
        </ScrollView>
      </View>
    </ModalWrapper>
  );
};

export default SearchModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacingX._20,
  },
  header: {
    marginBottom: spacingY._10,
  },
  form: {
    marginTop: spacingY._15,
    gap: spacingY._30,
  },
  inputContainer: {
    gap: spacingY._10,
  },
  inputFieldStyle: {
    backgroundColor: COLORS.neutral800,
  },
});
