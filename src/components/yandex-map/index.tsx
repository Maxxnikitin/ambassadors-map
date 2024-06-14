"use client";
import React, { FC } from "react";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";
import { Loader } from "../loader";
import { Stack } from "@mui/material";
import { useYandexMap } from "./hooks";
import { Modal } from "../modal";

const apikey = process.env.NEXT_PUBLIC_YANDEX_MAP_API_KEY;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const MyMap: FC = () => {
  const {
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
    handleModalClose,
    handleChange,
    handleFileChange,
    handleSave,
  } = useYandexMap();

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      sx={{ width: "100%", height: "100dvh" }}
    >
      <YMaps
        query={{
          apikey,
        }}
      >
        {(loading || usersLoading) && <Loader />}
        <Map
          defaultState={{
            center: [43.222, 76.8512],
            zoom: 4,
            controls: ["zoomControl"],
          }}
          modules={["control.ZoomControl"]}
          width="100%"
          height="100%"
          onContextMenu={handleMapClick}
          onLoad={handleLoad}
        >
          {allUsersData.map((user, index) => (
            <Placemark
              modules={["geoObject.addon.balloon"]}
              key={index}
              geometry={user.coords}
              properties={{
                balloonContentBody: `${user.name}<br />${
                  user.description ?? ""
                }`,
              }}
              options={
                user.avatar
                  ? {
                      iconLayout: "default#image",
                      iconImageHref: user.avatar.startsWith("/")
                        ? `${baseUrl}/${user.avatar}`
                        : user.avatar,
                      iconImageSize: [40, 40],
                      hideIconOnBalloonOpen: false,
                      iconImageOffset: [-20, -20],
                    }
                  : {}
              }
            />
          ))}
        </Map>
      </YMaps>
      <Modal
        isModalOpen={isModalOpen}
        userData={userData}
        avatarFile={avatarFile}
        error={error}
        tgError={tgError}
        isRequestLoading={isRequestLoading}
        handleModalClose={handleModalClose}
        handleChange={handleChange}
        handleFileChange={handleFileChange}
        handleSave={handleSave}
      />
    </Stack>
  );
};
