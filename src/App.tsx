import Box from "@mui/material/Box";

import { AppRoutes } from "./routes/routes";

const App = () => {
  return (
    <Box sx={{ display: "flex" }} className="bg-[#F9FAFB] text-[#2D2D2D]">
      <AppRoutes />
    </Box>
  );
};

export default App;

// className="font-nationalpark"