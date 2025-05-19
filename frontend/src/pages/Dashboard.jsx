import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBugs: 0,
    openBugs: 0,
    inProgressBugs: 0,
    resolvedBugs: 0,
    assignedToMe: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_API_URL}/api/bugs/stats`);
      setStats(response.data);
    } catch (err) {
      setError('Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user.name}!
      </Typography>

      <Grid container spacing={3}>
        {/* Total Bugs Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
            }}
          >
            <Typography component="h2" variant="h6" gutterBottom>
              Total Bugs
            </Typography>
            <Typography component="p" variant="h4">
              {stats.totalBugs}
            </Typography>
          </Paper>
        </Grid>

        {/* Open Bugs Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'error.light',
              color: 'error.contrastText',
            }}
          >
            <Typography component="h2" variant="h6" gutterBottom>
              Open Bugs
            </Typography>
            <Typography component="p" variant="h4">
              {stats.openBugs}
            </Typography>
          </Paper>
        </Grid>

        {/* In Progress Bugs Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'warning.light',
              color: 'warning.contrastText',
            }}
          >
            <Typography component="h2" variant="h6" gutterBottom>
              In Progress
            </Typography>
            <Typography component="p" variant="h4">
              {stats.inProgressBugs}
            </Typography>
          </Paper>
        </Grid>

        {/* Resolved Bugs Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'success.light',
              color: 'success.contrastText',
            }}
          >
            <Typography component="h2" variant="h6" gutterBottom>
              Resolved
            </Typography>
            <Typography component="p" variant="h4">
              {stats.resolvedBugs}
            </Typography>
          </Paper>
        </Grid>

        {/* Assigned to Me Card */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'info.light',
              color: 'info.contrastText',
            }}
          >
            <Typography component="h2" variant="h6" gutterBottom>
              Bugs Assigned to Me
            </Typography>
            <Typography component="p" variant="h4">
              {stats.assignedToMe}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 