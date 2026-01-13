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
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { purchaseAPI, dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Purchases = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [bases, setBases] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({
    base: '',
    assetType: '',
    startDate: '',
    endDate: '',
  });
  const [formData, setFormData] = useState({
    asset: '',
    base: '',
    quantity: '',
    cost: '',
    vendor: '',
    purchaseOrderNumber: '',
    remarks: '',
  });

  useEffect(() => {
    fetchPurchases();
    fetchFiltersData();
  }, []);

  const fetchPurchases = async (filterParams = {}) => {
    try {
      setLoading(true);
      const response = await purchaseAPI.getAll(filterParams);
      setPurchases(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load purchases');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiltersData = async () => {
    try {
      const [basesRes, typesRes] = await Promise.all([
        dashboardAPI.getBases(),
        dashboardAPI.getAssetTypes(),
      ]);
      setBases(basesRes.data);
      setAssetTypes(typesRes.data);
    } catch (err) {
      console.error('Failed to load filter data:', err);
    }
  };

  const handleOpenDialog = (purchase = null) => {
    if (purchase) {
      setEditingId(purchase._id);
      setFormData({
        asset: purchase.asset._id,
        base: purchase.base._id,
        quantity: purchase.quantity,
        cost: purchase.cost,
        vendor: purchase.vendor,
        purchaseOrderNumber: purchase.purchaseOrderNumber,
        remarks: purchase.remarks,
      });
    } else {
      setEditingId(null);
      setFormData({
        asset: '',
        base: user?.base?._id || '',
        quantity: '',
        cost: '',
        vendor: '',
        purchaseOrderNumber: '',
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
        await purchaseAPI.update(editingId, formData);
        setError('');
      } else {
        await purchaseAPI.create(formData);
      }
      handleCloseDialog();
      fetchPurchases(filters);
      alert(editingId ? 'Purchase updated successfully' : 'Purchase recorded successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving purchase');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      try {
        await purchaseAPI.delete(id);
        fetchPurchases(filters);
        alert('Purchase deleted successfully');
      } catch (err) {
        setError('Error deleting purchase');
      }
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchPurchases(newFilters);
  };

  const handleReset = () => {
    setFilters({
      base: '',
      assetType: '',
      startDate: '',
      endDate: '',
    });
    fetchPurchases();
  };

  const canEdit = ['Admin', 'BaseCommander', 'LogisticsOfficer'].includes(user?.role);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Purchases
        </Typography>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            New Purchase
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
                label="Base"
                select
                value={filters.base}
                onChange={(e) => handleFilterChange({ ...filters, base: e.target.value })}
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
                label="Asset Type"
                select
                value={filters.assetType}
                onChange={(e) => handleFilterChange({ ...filters, assetType: e.target.value })}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">All Types</option>
                {assetTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
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

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange({ ...filters, endDate: e.target.value })}
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

      {/* Purchases Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Purchase Order</strong></TableCell>
                <TableCell><strong>Asset</strong></TableCell>
                <TableCell><strong>Base</strong></TableCell>
                <TableCell align="right"><strong>Quantity</strong></TableCell>
                <TableCell align="right"><strong>Cost</strong></TableCell>
                <TableCell><strong>Vendor</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {purchases.map((purchase) => (
                <TableRow key={purchase._id}>
                  <TableCell>{purchase.purchaseOrderNumber}</TableCell>
                  <TableCell>{purchase.asset?.name}</TableCell>
                  <TableCell>{purchase.base?.name}</TableCell>
                  <TableCell align="right">{purchase.quantity}</TableCell>
                  <TableCell align="right">${purchase.cost}</TableCell>
                  <TableCell>{purchase.vendor}</TableCell>
                  <TableCell>{new Date(purchase.purchaseDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {canEdit && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Edit />}
                          onClick={() => handleOpenDialog(purchase)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => handleDelete(purchase._id)}
                        >
                          Delete
                        </Button>
                      </Box>
                    )}
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
          {editingId ? 'Edit Purchase' : 'New Purchase'}
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
              label="Base"
              select
              value={formData.base}
              onChange={(e) => setFormData({ ...formData, base: e.target.value })}
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
              label="Cost"
              type="number"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
            />

            <TextField
              fullWidth
              label="Vendor"
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
            />

            <TextField
              fullWidth
              label="Purchase Order Number"
              value={formData.purchaseOrderNumber}
              onChange={(e) => setFormData({ ...formData, purchaseOrderNumber: e.target.value })}
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

export default Purchases;
