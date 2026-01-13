import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Typography,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Download,
  Upload,
  Assignment,
  Inventory2,
} from '@mui/icons-material';
import StatCard from '../components/StatCard';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [netMovementDetails, setNetMovementDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [base, setBase] = useState('');
  const [assetType, setAssetType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bases, setBases] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [openNetMovementDialog, setOpenNetMovementDialog] = useState(false);

  useEffect(() => {
    fetchData();
    fetchFiltersData();
  }, []);

  const fetchData = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getMetrics(filters);
      setMetrics(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load dashboard metrics');
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

  const handleFilter = async () => {
    const filters = {};
    if (base) filters.base = base;
    if (assetType) filters.assetType = assetType;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    await fetchData(filters);
  };

  const handleNetMovementClick = async () => {
    try {
      const filters = {};
      if (base) filters.base = base;
      if (assetType) filters.assetType = assetType;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const response = await dashboardAPI.getNetMovementDetails(filters);
      setNetMovementDetails(response.data);
      setOpenNetMovementDialog(true);
    } catch (err) {
      setError('Failed to load net movement details');
      console.error(err);
    }
  };

  const handleReset = () => {
    setBase('');
    setAssetType('');
    setStartDate('');
    setEndDate('');
    fetchData();
  };

  if (loading && !metrics) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>
          Dashboard - {user?.base?.name || 'All Bases'}
        </h1>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Filters */}
        <Box
          sx={{
            p: 3,
            backgroundColor: '#f5f5f5',
            borderRadius: 1,
            mb: 3,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Select Base"
                select
                value={base}
                onChange={(e) => setBase(e.target.value)}
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
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
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
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={1}>
                <Button variant="contained" onClick={handleFilter}>
                  Apply Filters
                </Button>
                <Button variant="outlined" onClick={handleReset}>
                  Reset
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Metrics Cards */}
      {metrics && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Opening Balance"
              value={metrics.openingBalance || 0}
              icon={Inventory2}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Closing Balance"
              value={metrics.closingBalance || 0}
              icon={Inventory2}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Net Movement"
              value={metrics.netMovement || 0}
              icon={TrendingUp}
              onClick={handleNetMovementClick}
              style={{ cursor: 'pointer' }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Assigned Assets"
              value={metrics.assigned || 0}
              icon={Assignment}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Purchases"
              value={metrics.purchases || 0}
              icon={TrendingDown}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Transfer In"
              value={metrics.transferIn || 0}
              icon={Upload}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Transfer Out"
              value={metrics.transferOut || 0}
              icon={Download}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Expended Assets"
              value={metrics.expended || 0}
              icon={TrendingDown}
            />
          </Grid>
        </Grid>
      )}

      {/* Net Movement Details Dialog */}
      <Dialog
        open={openNetMovementDialog}
        onClose={() => setOpenNetMovementDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Net Movement Details</DialogTitle>
        <DialogContent>
          {netMovementDetails && (
            <Box sx={{ mt: 2 }}>
              {/* Purchases Table */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Purchases ({netMovementDetails.purchases.length})
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell>Asset</TableCell>
                      <TableCell>Base</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {netMovementDetails.purchases.map((p) => (
                      <TableRow key={p._id}>
                        <TableCell>{p.asset?.name}</TableCell>
                        <TableCell>{p.base?.name}</TableCell>
                        <TableCell align="right">{p.quantity}</TableCell>
                        <TableCell>
                          {new Date(p.purchaseDate).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Transfers In Table */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Transfers In ({netMovementDetails.transfersIn.length})
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell>Asset</TableCell>
                      <TableCell>From Base</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {netMovementDetails.transfersIn.map((t) => (
                      <TableRow key={t._id}>
                        <TableCell>{t.asset?.name}</TableCell>
                        <TableCell>{t.fromBase?.name}</TableCell>
                        <TableCell align="right">{t.quantity}</TableCell>
                        <TableCell>
                          {new Date(t.transferDate).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Transfers Out Table */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Transfers Out ({netMovementDetails.transfersOut.length})
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell>Asset</TableCell>
                      <TableCell>To Base</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {netMovementDetails.transfersOut.map((t) => (
                      <TableRow key={t._id}>
                        <TableCell>{t.asset?.name}</TableCell>
                        <TableCell>{t.toBase?.name}</TableCell>
                        <TableCell align="right">{t.quantity}</TableCell>
                        <TableCell>
                          {new Date(t.transferDate).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
