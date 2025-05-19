import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BugDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bug, setBug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    assignedTo: '',
  });

  useEffect(() => {
    fetchBug();
  }, [id]);

  const fetchBug = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_API_URL}/api/bugs/${id}`);
      setBug(response.data);
      setEditData({
        title: response.data.title,
        description: response.data.description,
        status: response.data.status,
        priority: response.data.priority,
        assignedTo: response.data.assignedTo?._id || '',
      });
    } catch (err) {
      setError('Failed to fetch bug details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_BASE_API_URL}/api/bugs/${id}`, editData);
      setBug({ ...bug, ...editData });
      setEditMode(false);
    } catch (err) {
      setError('Failed to update bug');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_BASE_API_URL}/api/bugs/${id}`);
      navigate('/bugs');
    } catch (err) {
      setError('Failed to delete bug');
    }
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!bug) return <div>Bug not found</div>;

  const canEdit = user._id === bug.createdBy._id || user.role === 'admin';

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Bug Details
            </Typography>
            {canEdit && (
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setEditMode(!editMode)}
                  sx={{ mr: 1 }}
                >
                  {editMode ? 'Cancel Edit' : 'Edit'}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setDeleteDialog(true)}
                >
                  Delete
                </Button>
              </Box>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {editMode ? (
            <Box>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={editData.title}
                onChange={handleEditChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={editData.description}
                onChange={handleEditChange}
                margin="normal"
                multiline
                rows={4}
                required
              />
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={editData.status}
                    label="Status"
                    onChange={handleEditChange}
                  >
                    <MenuItem value="open">Open</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    name="priority"
                    value={editData.priority}
                    label="Priority"
                    onChange={handleEditChange}
                  >
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={handleEditSubmit}
                sx={{ mt: 2 }}
              >
                Save Changes
              </Button>
            </Box>
          ) : (
            <Box>
              <Typography variant="h5" gutterBottom>
                {bug.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  label={bug.status}
                  color={getStatusColor(bug.status)}
                  size="small"
                />
                <Chip
                  label={bug.priority}
                  color={getPriorityColor(bug.priority)}
                  size="small"
                />
              </Box>
              <Typography variant="body1" paragraph>
                {bug.description}
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created by: {bug.createdBy.name}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Assigned to: {bug.assignedTo?.name || 'Unassigned'}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Created at: {new Date(bug.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Last updated: {new Date(bug.updatedAt).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>

      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Bug</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this bug? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BugDetail; 