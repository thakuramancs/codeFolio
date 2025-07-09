import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
const PracticeLayout = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', p: { xs: 1, sm: 3 }, boxSizing: 'border-box' }}>
      <Outlet />
    </Box>
  );
};

export default PracticeLayout;