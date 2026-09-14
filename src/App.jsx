import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import Layout from "./components/Layout/Layout";
import Dashboard from "./pages/Dashboard";
import CreateCertificate from "./pages/CreateCertificate";

const theme = createTheme({
  typography: { fontFamily: 'Arial, Helvetica, sans-serif' },
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create-certificate" element={<CreateCertificate />} />
            <Route path="/create-certificate/:id" element={<CreateCertificate />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;