import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete, CheckCircle } from '@mui/icons-material';
import { transferAPI, dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Transfers = () => {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({
    fromBase: '',
    toBase: '',
    status: '',
    startDate: '',
    endDate: '',
  });
  const [formData, setFormData] = useState({
    asset: '',
    fromBase: '',
    toBase: '',
    quantity: '',
    remarks: '',
  });

  useEffect(() => {
    fetchTransfers();
    fetchFilterData();
  }, []);

  const fetchTransfers = async (filterParams = {}) => {
    try {
      setLoading(true);
      const response = await transferAPI.getAll(filterParams);
      setTransfers(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load transfers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterData = async () => {
    try {
      const basesRes = await dashboardAPI.getBases();
      setBases(basesRes.data);
    } catch (err) {
      console.error('Failed to load bases:', err);
    }
  };

  const handleOpenDialog = (transfer = null) => {
    if (transfer) {
      setEditingId(transfer._id);
      setFormData({
        asset: transfer.asset._id,
        fromBase: transfer.fromBase._id,
        toBase: transfer.toBase._id,
        quantity: transfer.quantity,
        remarks: transfer.remarks,
      });
    } else {
      setEditingId(null);
      setFormData({
        asset: '',
        fromBase: user?.base?._id || '',
        toBase: '',
        quantity: '',
        remarks: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await transferAPI.update(editingId, formData);
      } else {
        await transferAPI.create(formData);
      }
      handleCloseDialog();
      fetchTransfers(filters);
      alert(editingId ? 'Transfer updated successfully' : 'Transfer initiated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving transfer');
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm('Approve this transfer?')) {
      try {
        await transferAPI.approve(id);
        fetchTransfers(filters);
        alert('Transfer approved successfully');
      } catch (err) {
        setError('Error approving transfer');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this transfer?')) {
      try {
        await transferAPI.delete(id);
        fetchTransfers(filters);
        alert('Transfer deleted successfully');
      } catch (err) {
        setError('Error deleting transfer');
      }
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchTransfers(newFilters);
  };

  const handleReset = () => {
    setFilters({
      fromBase: '',
      toBase: '',
      status: '',
      startDate: '',
      endDate: '',
    });
    fetchTransfers();
  };

  const canCreate = ['Admin', 'BaseCommander', 'LogisticsOfficer'].includes(user?.role);
  const canApprove = ['Admin', 'BaseCommander'].includes(user?.role);

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'warning',
      InTransit: 'info',
      Delivered: 'success',
      Cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Asset Transfers
        </Typography>
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            New Transfer
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="From Base"
                select
                value={filters.fromBase}
                onChange={(e) => handleFilterChange({ ...filters, fromBase: e.target.value })}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">All Bases</option>
                {bases.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="To Base"
                select
                value={filters.toBase}
                onChange={(e) => handleFilterChange({ ...filters, toBase: e.target.value })}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">All Bases</option>
                {bases.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Status"
                select
                value={filters.status}
                onChange={(e) => handleFilterChange({ ...filters, status: e.target.value })}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="InTransit">In Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange({ ...filters, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button variant="outlined" onClick={handleReset}>
                Reset Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Transfers Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Transfer Order</strong></TableCell>
                <TableCell><strong>Asset</strong></TableCell>
                <TableCell><strong>From Base</strong></TableCell>
                <TableCell><strong>To Base</strong></TableCell>
                <TableCell align="right"><strong>Quantity</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transfers.map((transfer) => (
                <TableRow key={transfer._id}>
                  <TableCell>{transfer.transferOrderNumber}</TableCell>
                  <TableCell>{transfer.asset?.name}</TableCell>
                  <TableCell>{transfer.fromBase?.name}</TableCell>
                  <TableCell>{transfer.toBase?.name}</TableCell>
                  <TableCell align="right">{transfer.quantity}</TableCell>
                  <TableCell>
                    <Chip
                      label={transfer.status}
                      color={getStatusColor(transfer.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(transfer.transferDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {transfer.status === 'Pending' && canApprove && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<CheckCircle />}
                          onClick={() => handleApprove(transfer._id)}
                        >
                          Approve
                        </Button>
                      )}
                      {transfer.status === 'Pending' && canCreate && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Edit />}
                          onClick={() => handleOpenDialog(transfer)}
                        >
                          Edit
                        </Button>
                      )}
                      {transfer.status === 'Pending' && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => handleDelete(transfer._id)}
                        >
                          Delete
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Transfer' : 'New Transfer'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Asset"
              select
              value={formData.asset}
              onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
              SelectProps={{
                native: true,
              }}
            >
              <option value="">Select Asset</option>
            </TextField>

            <TextField
              fullWidth
              label="From Base"
              select
              value={formData.fromBase}
              onChange={(e) => setFormData({ ...formData, fromBase: e.target.value })}
              SelectProps={{
                native: true,
              }}
            >
              <option value="">Select Base</option>
              {bases.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="To Base"
              select
              value={formData.toBase}
              onChange={(e) => setFormData({ ...formData, toBase: e.target.value })}
              SelectProps={{
                native: true,
              }}
            >
              <option value="">Select Base</option>
              {bases.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />

            <TextField
              fullWidth
              label="Remarks"
              multiline
              rows={3}
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Transfers;
