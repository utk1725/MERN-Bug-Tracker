import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BugList = () => {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bugToDelete, setBugToDelete] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchBugs();
  }, [filters]);

  const fetchBugs = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.priority) queryParams.append('priority', filters.priority);

      const response = await axios.get(`${import.meta.env.VITE_BASE_API_URL}/api/bugs?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBugs(response.data);
    } catch (err) {
      setError('Failed to fetch bugs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (bug) => {
    setBugToDelete(bug);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_BASE_API_URL}/api/bugs/${bugToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBugs(bugs.filter(bug => bug._id !== bugToDelete._id));
      setDeleteDialogOpen(false);
      setBugToDelete(null);
    } catch (err) {
      setError('Failed to delete bug');
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearchChange = (e) => {
    setFilters({
      ...filters,
      search: e.target.value,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'error';
      case 'in-progress':
        return 'warning';
      case 'resolved':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const filteredBugs = bugs.filter((bug) => {
    const matchesSearch = bug.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      bug.description.toLowerCase().includes(filters.search.toLowerCase());
    return matchesSearch;
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Bug List
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/bugs/create')}
          >
            Create New Bug
          </Button>
        </Box>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={filters.search}
              onChange={handleSearchChange}
              sx={{ flexGrow: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={filters.status}
                label="Status"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={filters.priority}
                label="Priority"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBugs.map((bug) => (
                <TableRow key={bug._id}>
                  <TableCell>{bug.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={bug.status}
                      color={getStatusColor(bug.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={bug.priority}
                      color={getPriorityColor(bug.priority)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{bug.assignedTo?.name || 'Unassigned'}</TableCell>
                  <TableCell>{bug.createdBy?.name}</TableCell>
                  <TableCell>
                    {new Date(bug.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        onClick={() => navigate(`/bugs/${bug._id}`)}
                      >
                        View
                      </Button>
                      {(user?.role === 'admin' || bug.createdBy?._id === user?._id) && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(bug)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this bug? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BugList; 