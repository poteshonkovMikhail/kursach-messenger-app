// src/components/common/LoadingSpinner.tsx
import { Box, CircularProgress } from '@mui/material';

export const LoadingSpinner = () => (
  <Box display="flex" height="100%" alignItems="center" justifyContent="center">
    <CircularProgress />
  </Box>
);