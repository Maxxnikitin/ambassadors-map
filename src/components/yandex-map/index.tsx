"use client";
import React, { FC, useState } from "react";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";
import { Loader } from "../loader";
import { Stack } from "@mui/material";
import { TUserData } from "@/utils/types";
import { useYandexMap } from "./hooks";
import { Modal } from "../modal";

const apikey = process.env.NEXT_PUBLIC_YANDEX_MAP_API_KEY;

export const MyMap: FC = () => {
  const {
    loading,
    usersLoading,
    isModalOpen,
    userData,
    allUsersData,
    error,
    isRequestLoading,
    handleMapClick,
    handleLoad,
    handleModalClose,
    handleChange,
    handleSave,
  } = useYandexMap();

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      sx={{ width: "100%", height: "100%" }}
    >
      <YMaps
        query={{
          apikey,
        }}
      >
        {(loading || usersLoading) && <Loader />}
        <Map
          defaultState={{
            center: [55.030199, 82.92043],
            zoom: 4,
            controls: ["zoomControl"],
          }}
          modules={["control.ZoomControl"]}
          width="100%"
          height={"100dvh"}
          onContextMenu={handleMapClick}
          onLoad={handleLoad}
        >
          {allUsersData.map((user, index) => (
            <Placemark
              modules={["geoObject.addon.balloon"]}
              key={index}
              geometry={user.coords}
              properties={{
                // balloonContent: user.name,
                // hintContent: user.name,
                // iconContent: `<img src="${user.avatar}" alt="Аватар." style="width:100px;height:100px;"/></div>`,
                balloonContentBody: `${user.name}<br />${user.description}`,
              }}
              options={{
                iconLayout: "default#image",
                iconImageHref: user.avatar,
                iconImageSize: [40, 40],
                hideIconOnBalloonOpen: false,
                iconImageOffset: [-20, -20],
              }}
            />
          ))}
        </Map>
      </YMaps>
      <Modal
        isModalOpen={isModalOpen}
        userData={userData}
        error={error}
        isRequestLoading={isRequestLoading}
        handleModalClose={handleModalClose}
        handleChange={handleChange}
        handleSave={handleSave}
      />
    </Stack>
  );
};
