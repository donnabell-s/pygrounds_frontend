import Box from "@mui/material/Box";

import { AppRoutes } from "./routes";

const App = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <AppRoutes />
    </Box>
  );
};

export default App;