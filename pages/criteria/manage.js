import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Alert,
  Switch,
  IconButton,
  Tooltip
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Loader from '../../components/Loader';
import DataTable from '../../components/DataTable';
import CriteriaFormDialog from '../../components/CriteriaFormDialog';

const ManageCriteriaPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add/Edit Dialog State (implement later)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState(null);

  // Redirect non-admins
  useEffect(() => {
    if (status === 'loading') return;
    if (status !== 'authenticated' || session?.user?.role !== 'admin') {
      router.push('/login'); // Or '/' or '/dashboard' depending on desired flow
    }
  }, [status, session, router]);

  // Fetch criteria
  const fetchCriteria = async () => {
      if (status === 'authenticated' && session?.user?.role === 'admin') { 
          setLoading(true);
          setError('');
          try {
              const res = await fetch('/api/evaluations/criteria');
              const data = await res.json();
              if (!res.ok) {
              throw new Error(data.message || 'Failed to fetch evaluation criteria');
              }
              setCriteria(data);
          } catch (err) {
              setError(err.message);
          } finally {
              setLoading(false);
          }
      }
  };

  useEffect(() => {
    fetchCriteria();
  }, [status, session]); // Refetch if session changes

  const handleAddClick = () => {
    setEditingCriterion(null);
    setDialogOpen(true);
  };

  const handleEditClick = (criterion) => {
    setEditingCriterion(criterion);
    setDialogOpen(true);
  };

  const handleDeleteClick = async (id) => {
    // TODO: Implement Delete API Call
    if (window.confirm('Are you sure you want to delete this criterion?')) {
       alert(`Delete functionality for ${id} not implemented yet.`);
        // try {
        //   await fetch(`/api/evaluations/criteria/${id}`, { method: 'DELETE' });
        //   setCriteria(criteria.filter(c => c._id !== id));
        // } catch (err) { setError('Failed to delete criterion'); }
    }
  };
  
  const handleToggleActive = async (id, currentStatus) => {
      setError(''); // Clear previous errors
      const originalCriteria = [...criteria]; // Store original state for potential rollback
      
      // Optimistically update UI
      setCriteria(criteria.map(c => c._id === id ? { ...c, active: !currentStatus } : c));
      
      try {
          const res = await fetch(`/api/evaluations/criteria/${id}`, { 
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ active: !currentStatus }) // Send only the updated field
          });
          if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.message || 'Failed to update status');
          }
          // Success - UI already updated optimistically
      } catch (err) {
          setError(err.message || 'Failed to update active status');
          // Rollback UI on error
          setCriteria(originalCriteria);
      } 
      // No finally block needed here as we handle UI updates within try/catch
  };

  // Handle saving from the dialog
  const handleSave = async (formData, id) => {
    setError('');
    const isEditing = !!id;
    const url = isEditing ? `/api/evaluations/criteria/${id}` : '/api/evaluations/criteria';
    const method = isEditing ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const result = await res.json();
        if (!res.ok) {
            throw new Error(result.message || `Failed to ${isEditing ? 'update' : 'create'} criterion`);
        }
        
        // Refresh criteria list on success & close dialog
        await fetchCriteria(); 
        setDialogOpen(false);

    } catch (err) {
        setError(err.message || 'Failed to save criterion');
        // Keep dialog open on error so user can see/fix?
    }
    // Note: isSaving state is handled within the Dialog component
  };

  // Define columns for DataTable
  const columns = [
    { id: 'name', label: 'Name', sortable: true },
    { id: 'description', label: 'Description', sortable: false },
    { id: 'weight', label: 'Weight (%)', sortable: true, numeric: true },
    { id: 'order', label: 'Order', sortable: true, numeric: true },
    { id: 'active', label: 'Active', sortable: true },
    { id: 'actions', label: 'Actions', sortable: false },
  ];

  // Prepare data for DataTable
  const tableData = criteria.map(c => ({ ...c })); // Simple map for now

  // Custom cell rendering
  const renderCell = (row, column) => {
    if (column.id === 'active') {
      return (
        <Switch 
            checked={row.active} 
            onChange={() => handleToggleActive(row._id, row.active)} 
            size="small"
        />
      );
    }
    if (column.id === 'actions') {
      return (
        <Box>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleEditClick(row)}>
              <EditIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => handleDeleteClick(row._id)} color="error">
              <DeleteIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Box>
      );
    }
    return row[column.id]; // Default rendering
  };

  if (status === 'loading' || loading) {
    return <Loader />;
  }
  
  // Added check to prevent rendering before redirect effect runs
  if (status !== 'authenticated' || session?.user?.role !== 'admin') {
      return <Loader />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Manage Evaluation Criteria</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddCircleOutlineIcon />} 
            onClick={handleAddClick}
          >
            Add Criterion
          </Button>
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <DataTable 
          columns={columns}
          data={tableData}
          renderCell={renderCell}
          // Add sorting handlers later if needed
        />
      </Paper>
      
      <CriteriaFormDialog 
            open={dialogOpen} 
            onClose={() => setDialogOpen(false)} 
            criterion={editingCriterion}
            onSave={handleSave}
       />
    </Container>
  );
};

export default ManageCriteriaPage; 