import { Box } from "@mui/material";

function Layout({ children }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {children}
    </Box>
  );
}

export default Layout;