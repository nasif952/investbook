import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Grid,
  CircularProgress
} from '@mui/material';

const CriteriaFormDialog = ({ open, onClose, criterion, onSave }) => {
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form data when dialog opens or criterion changes
  useEffect(() => {
    if (open) {
      if (criterion) {
        // Editing existing criterion
        setFormData({
          name: criterion.name || '',
          description: criterion.description || '',
          weight: criterion.weight || 0,
          order: criterion.order || 0,
          active: criterion.active !== undefined ? criterion.active : true, // Default to active
        });
      } else {
        // Adding new criterion - reset form
        setFormData({
          name: '',
          description: '',
          weight: 0,
          order: 0,
          active: true,
        });
      }
    }
  }, [open, criterion]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    await onSave(formData, criterion?._id); // Pass data and optional ID to parent save handler
    setIsSaving(false);
    // onClose(); // Let parent decide whether to close on success/error
  };

  const isEditMode = !!criterion;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? 'Edit Criterion' : 'Add New Criterion'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          <Grid item xs={12}>
            <TextField
              autoFocus
              required
              margin="dense"
              id="name"
              name="name"
              label="Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              margin="dense"
              id="description"
              name="description"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={formData.description || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              required
              margin="dense"
              id="weight"
              name="weight"
              label="Weight (%)"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.weight ?? ''} // Use nullish coalescing for 0
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              required
              margin="dense"
              id="order"
              name="order"
              label="Display Order"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.order ?? ''} // Use nullish coalescing for 0
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active ?? true}
                  onChange={handleChange}
                  name="active"
                />
              }
              label="Active"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={isSaving}>Cancel</Button>
        <Button onClick={handleSaveClick} variant="contained" disabled={isSaving}>
          {isSaving ? <CircularProgress size={24} /> : (isEditMode ? 'Save Changes' : 'Create Criterion')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CriteriaFormDialog; 