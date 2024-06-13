import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormHelperText,
  Grid,
  TextField,
} from "@mui/material";
import { ChangeEventHandler, FC } from "react";
import { Loader } from "../loader";
import { TUserData } from "@/utils/types";

type TProps = {
  isModalOpen: boolean;
  userData: TUserData | null;
  error: string;
  isRequestLoading: boolean;
  handleModalClose: () => void;
  handleSave: () => void;
  handleChange: ChangeEventHandler<HTMLInputElement>;
};

export const Modal: FC<TProps> = ({
  isModalOpen,
  userData,
  error,
  isRequestLoading,
  handleModalClose,
  handleChange,
  handleSave,
}) => {
  return (
    <Dialog
      open={isModalOpen}
      onClose={handleModalClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <form>
        <DialogContent sx={{ minWidth: "600px" }}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <FormHelperText sx={{ fontSize: "18px" }}>Имя</FormHelperText>
            </Grid>
            <Grid item xs={8}>
              <TextField
                id="name"
                placeholder="Будет отображаться на карте"
                onChange={handleChange}
                value={userData?.name ?? ""}
                sx={{ width: "100%" }}
                disabled={isRequestLoading}
              />
            </Grid>

            <Grid item xs={4}>
              <FormHelperText sx={{ fontSize: "18px" }}>
                Логин в Телеграм
              </FormHelperText>
            </Grid>

            <Grid item xs={8}>
              <TextField
                id="usernameTG"
                placeholder="Введите логин без @"
                onChange={handleChange}
                value={userData?.usernameTG ?? ""}
                sx={{ width: "100%" }}
                disabled={isRequestLoading}
              />
            </Grid>
            <Grid item xs={4}>
              <FormHelperText sx={{ fontSize: "18px" }}>Аватар</FormHelperText>
            </Grid>
            <Grid item xs={8}>
              <TextField
                id="avatar"
                placeholder="Введите ссылку на изображение"
                onChange={handleChange}
                value={userData?.avatar ?? ""}
                sx={{ width: "100%" }}
                disabled={isRequestLoading}
              />
            </Grid>
          </Grid>
          {error && (
            <FormHelperText sx={{ fontSize: "18px", color: "#f00" }}>
              {error}
            </FormHelperText>
          )}
          <DialogActions>
            <Button
              onClick={handleModalClose}
              variant="outlined"
              disabled={isRequestLoading}
            >
              Отмена
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !userData?.name ||
                !userData?.usernameTG ||
                !userData?.avatar ||
                isRequestLoading
              }
              variant="contained"
            >
              {isRequestLoading ? (
                <Loader size={24} />
              ) : false ? (
                "Update"
              ) : (
                "Сохранить"
              )}
            </Button>
          </DialogActions>
        </DialogContent>
      </form>
    </Dialog>
  );
};
