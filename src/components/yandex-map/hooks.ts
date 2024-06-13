import {
  getIsUserAmbassadorFront,
  getTGUpdatesFront,
  getUsersDataFront,
  postUserDataFront,
} from "@/utils/api-front";
import { TUserData } from "@/utils/types";
import { ChangeEventHandler, useEffect, useState } from "react";

type TPlacemarkData = {
  coords: number[];
  info: string;
};

export const useYandexMap = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState<TUserData | null>(null);
  const [allUsersData, setAllUsersData] = useState<TUserData[]>([]);
  // const [placemarks, setPlacemarks] = useState<TPlacemarkData[]>([]);
  const [loading, setLoading] = useState(true);
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

  const handlePlacemarkClick = (placemark: TPlacemarkData) => {
    console.log(placemark);
  };

  const handleModalOpen = () => setIsModalOpen(true);

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
      const userId = await getTGUpdatesFront(userData?.usernameTG ?? "");

      const isAmbassador = await getIsUserAmbassadorFront(userId);

      if (isAmbassador) {
        // setPlacemarks([{ coords: userData?.coords!, info: userData?.name! }]);
        const { data } = await postUserDataFront(userData!);
        setAllUsersData(data);
        handleModalClose();
      } else {
        setError(
          "Оставлять геометки могут только амбассадоры. Обратитесь к @maxxnikitin"
        );
      }
    } catch (e) {
      console.log(e);
      setError(
        "Оставлять геометки могут только амбассадоры. Обратитесь к @maxxnikitin"
      );
    } finally {
      setIsRequestLoading(false);
    }
  };

  useEffect(() => {
    getUsersDataFront()
      .then(({ data }) => {
        setAllUsersData(data);
        // setPlacemarks(
        //   data.map((item) => ({ coords: item.coords!, info: item.name! }))
        // );
      })
      .catch((err) => console.log(err));
  }, []);

  return {
    // placemarks,
    loading,
    isModalOpen,
    userData,
    allUsersData,
    error,
    isRequestLoading,
    handleMapClick,
    handleLoad,
    handlePlacemarkClick,
    handleModalOpen,
    handleModalClose,
    handleChange,
    handleSave,
  };
};
