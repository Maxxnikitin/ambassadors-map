import {
  getIsUserAmbassadorFront,
  getTGUpdatesFront,
  getUsersDataFront,
  postUserDataFront,
} from "@/utils/api-front";
import { TUserData } from "@/utils/types";
import { ChangeEvent, ChangeEventHandler, useEffect, useState } from "react";

export const useYandexMap = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState<TUserData | null>(null);
  const [allUsersData, setAllUsersData] = useState<TUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [isRequestLoading, setIsRequestLoading] = useState(false);
  const [error, setError] = useState("");
  const [tgError, setTgError] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleFileChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
    if (target.files && target.files[0]) {
      setAvatarFile(target.files![0]);
    }
  };

  const handleMapClick = (e: any) => {
    const coords = e.get("coords");
    setUserData((prev) => ({ ...prev, coords }));
    handleModalOpen();
  };

  const handleLoad = () => {
    setLoading(false);
  };

  const handleModalOpen = () => {
    const prevData = localStorage.getItem("currUser");

    if (prevData) {
      const data = JSON.parse(prevData);
      setUserData((prev) => ({
        ...prev,
        name: data.name,
        usernameTG: data.usernameTG,
        description: data.description,
      }));
    }
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setUserData(null);
    setIsModalOpen(false);
    setError("");
    setTgError("");
    setAvatarFile(null);
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    const { id, value } = target;
    setUserData((prev) => ({ ...prev, [id]: value }));
    if (id === "usernameTG") {
      if (value.startsWith("@")) {
        setTgError('Введите логин без "@"');
      } else if (value.startsWith("http")) {
        setTgError("Введите логин, а не ссылку");
      } else {
        setTgError("");
      }
    }
  };

  const handleSave = async () => {
    setError("");
    setIsRequestLoading(true);
    const isUserExist = !!allUsersData.find(
      ({ usernameTG }) =>
        usernameTG?.toLowerCase() === userData?.usernameTG?.toLowerCase()
    );

    try {
      if (!isUserExist) {
        const userId = await getTGUpdatesFront(
          userData?.usernameTG?.toLowerCase() ?? ""
        );

        await getIsUserAmbassadorFront(userId);
      }

      const updatedData = {
        ...userData,
        usernameTG: userData?.usernameTG?.toLowerCase(),
      };

      const formData = new FormData();
      formData.append("file", avatarFile ?? "");
      formData.append("name", updatedData.name!);
      formData.append("usernameTG", updatedData.usernameTG!);
      formData.append("description", updatedData.description ?? "");
      formData.append("coords", JSON.stringify(updatedData.coords));

      const { data } = await postUserDataFront(formData);
      setAllUsersData(data);
      localStorage.setItem("currUser", JSON.stringify(userData));
      handleModalClose();
    } catch (e) {
      console.log(e);
      setError(
        "Оставлять геометки могут только амбассадоры. Обратитесь в TG к @maxxnikitin"
      );
    } finally {
      setIsRequestLoading(false);
    }
  };

  useEffect(() => {
    setUsersLoading(true);
    getUsersDataFront()
      .then(({ data }) => {
        setAllUsersData(data);
        setUsersLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setUsersLoading(false);
      });
  }, []);

  return {
    loading,
    usersLoading,
    isModalOpen,
    userData,
    avatarFile,
    allUsersData,
    error,
    tgError,
    isRequestLoading,
    handleMapClick,
    handleLoad,
    handleModalOpen,
    handleModalClose,
    handleChange,
    handleFileChange,
    handleSave,
  };
};
