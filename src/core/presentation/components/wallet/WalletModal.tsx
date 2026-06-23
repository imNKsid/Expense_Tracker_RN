import { COLORS, spacingX, spacingY } from "@/src/constants/theme";
import { useAuth } from "@/src/contexts/authContext";
import {
  createOrUpdateWallet,
  deleteWallet,
} from "@/src/core/domain/services/WalletService";
import { scale, verticalScale } from "@/src/utils/styling";
import { WalletType } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import BackButton from "../BackButton";
import CustomButton from "../CustomButton";
import Header from "../Header";
import ImageUpload from "../ImageUpload";
import Input from "../Input";
import ModalWrapper from "../ModalWrapper";
import Typography from "../Typography";

const WalletModal = () => {
  const router = useRouter();

  const { user, updateUserData } = useAuth();

  const [wallet, setWallet] = useState<WalletType>({
    name: "",
    image: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const oldWalletData: {
    id?: string;
    name: string;
    image: string;
  } = useLocalSearchParams();

  useEffect(() => {
    if (oldWalletData?.id) {
      setWallet({
        name: oldWalletData.name,
        image: JSON.parse(oldWalletData?.image),
      });
    }
  }, [oldWalletData?.id]);

  const _handleDelete = async () => {
    if (!oldWalletData?.id) {
      return;
    }
    setIsLoading(true);
    const res = await deleteWallet(oldWalletData.id!);
    setIsLoading(false);

    if (res.success) {
      router.back();
    }
    Alert.alert("Wallet", res.msg);
  };

  const _showDeleteAlert = () => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to do this? \nThis action will remove all the transactions related to this wallet.",
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

  const _handleSubmit = async () => {
    setIsLoading(true);
    const { name, image } = wallet;

    if (!name.trim() || !image) {
      Alert.alert("User", "Please fill all the fields!");
      setIsLoading(false);
      return;
    }

    const data: WalletType = {
      name,
      image,
      uid: user?.uid,
    };

    // For updating the wallet, setting Wallet ID
    if (oldWalletData?.id) {
      data.id = oldWalletData.id;
    }
    const res = await createOrUpdateWallet(data);
    setIsLoading(false);

    if (res.success) {
      router.back();
    } else {
      Alert.alert("Wallet", res.msg);
    }
  };

  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header
          title={oldWalletData?.id ? "Update Wallet" : "New Wallet"}
          leftIcon={<BackButton />}
          style={styles.header}
        />

        {/* Form */}
        <ScrollView contentContainerStyle={styles.form}>
          {/* Name */}
          <View style={styles.inputContainer}>
            <Typography color={COLORS.neutral200}>Wallet Name</Typography>
            <Input
              placeholder="Enter your wallet name (Eg: Salary)"
              value={wallet.name}
              onChangeText={(val) => setWallet({ ...wallet, name: val })}
            />
          </View>
          <View style={styles.inputContainer}>
            <Typography color={COLORS.neutral200}>Wallet Icon</Typography>
            <ImageUpload
              file={wallet.image}
              placeholder="Upload Image"
              onSelect={(file) => setWallet({ ...wallet, image: file })}
              onClear={() => setWallet({ ...wallet, image: null })}
            />
          </View>
        </ScrollView>
      </View>

      <View style={styles.footer}>
        {oldWalletData?.id && !isLoading && (
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
            {oldWalletData?.id ? "Update Wallet" : "Add Wallet"}
          </Typography>
        </CustomButton>
      </View>
    </ModalWrapper>
  );
};

export default WalletModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacingX._20,
  },
  header: {
    marginBottom: spacingY._10,
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
  form: {
    marginTop: spacingY._15,
    gap: spacingY._30,
  },
  inputContainer: {
    gap: spacingY._10,
  },
});
