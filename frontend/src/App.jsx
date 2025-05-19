import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BugList from './pages/BugList';
import BugDetail from './pages/BugDetail';
import CreateBug from './pages/CreateBug';
import Profile from './pages/Profile';

// Components
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/bugs"
              element={
                <PrivateRoute>
                  <BugList />
                </PrivateRoute>
              }
            />
            <Route
              path="/bugs/:id"
              element={
                <PrivateRoute>
                  <BugDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/bugs/create"
              element={
                <PrivateRoute>
                  <CreateBug />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
