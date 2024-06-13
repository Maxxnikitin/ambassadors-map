import { CircularProgress, Stack } from "@mui/material";

type Props = {
  size?: number;
  isInline?: boolean;
  className?: string;
};

export const Loader = ({ size = 40, isInline = false, className }: Props) => (
  <Stack
    justifyContent="center"
    alignItems="center"
    sx={{ width: isInline ? "fit-content" : "100%", height: "100%" }}
    className={className}
  >
    <CircularProgress size={size} />
  </Stack>
);
