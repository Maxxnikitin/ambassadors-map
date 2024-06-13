import {
  getIsUserAmbassadorFront,
  getTGUpdatesFront,
  getUsersDataFront,
  postUserDataFront,
} from "@/utils/api-front";
import { TUserData } from "@/utils/types";
import { ChangeEventHandler, useCallback, useEffect, useState } from "react";

export const useYandexMap = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState<TUserData | null>(null);
  const [allUsersData, setAllUsersData] = useState<TUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [isRequestLoading, setIsRequestLoading] = useState(false);
  const [error, setError] = useState("");

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
        avatar: data.avatar,
      }));
    }
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setUserData(null);
    setIsModalOpen(false);
    setError("");
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    setUserData((prev) => ({ ...prev, [target.id]: target.value }));
  };

  const handleSave = async () => {
    setError("");
    setIsRequestLoading(true);

    try {
      const isImg = await isImageUrl(userData?.avatar!);

      if (!isImg) {
        setError("Пожалуйста, введите корректную ссылку на изображение");
        return;
      }

      const isUserExist = !!allUsersData.find(
        ({ usernameTG }) =>
          usernameTG?.toLowerCase() === userData?.usernameTG?.toLowerCase()
      );

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
      const { data } = await postUserDataFront(updatedData);
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

  const isImageUrl = async (url: string) => {
    try {
      const response = await fetch(url, { method: "HEAD" });
      const contentType = response.headers.get("content-type");
      return !!(contentType && contentType.startsWith("image/"));
    } catch (error) {
      return false;
    }
  };

  const updatesAllUsersData = useCallback(async (data: TUserData[]) => {
    const res: TUserData[] = [];

    for (let item of data) {
      const isImage = await isImageUrl(item.avatar!);

      res.push({ ...item, avatar: isImage ? item.avatar! : "" });
    }

    setAllUsersData(res);
    setUsersLoading(false);
  }, []);

  useEffect(() => {
    setUsersLoading(true);
    getUsersDataFront()
      .then(({ data }) => {
        // updatesAllUsersData(data);
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
    allUsersData,
    error,
    isRequestLoading,
    handleMapClick,
    handleLoad,
    handleModalOpen,
    handleModalClose,
    handleChange,
    handleSave,
  };
};
