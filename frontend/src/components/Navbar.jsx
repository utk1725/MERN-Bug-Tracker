import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          Bug Tracker
        </Typography>
        {user ? (
          <Box>
            <Button
              color="inherit"
              component={RouterLink}
              to="/bugs"
            >
              Bugs
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/bugs/create"
            >
              Create Bug
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/profile"
            >
              Profile
            </Button>
            <Button
              color="inherit"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        ) : (
          <Box>
            <Button
              color="inherit"
              component={RouterLink}
              to="/login"
            >
              Login
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/register"
            >
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 