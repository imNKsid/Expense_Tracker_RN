import { ResponseType, UserDataType } from "@/types";
import { updateUserData } from "../../data/servicesImpl/UserServiceImpl";

export const updateUser = async (
  uid: string,
  updatedData: UserDataType,
): Promise<ResponseType> => {
  return await updateUserData(uid, updatedData);
};
