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
  Tabs,
  Tab,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { assignmentAPI, expenditureAPI, dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ width: '100%' }}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const Assignments = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [assignments, setAssignments] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openExpenditureDialog, setOpenExpenditureDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({
    base: '',
    startDate: '',
    endDate: '',
  });
  const [assignmentForm, setAssignmentForm] = useState({
    asset: '',
    base: '',
    assignedTo: '',
    quantity: '',
    remarks: '',
  });
  const [expenditureForm, setExpenditureForm] = useState({
    asset: '',
    base: '',
    quantity: '',
    reason: '',
    remarks: '',
  });

  useEffect(() => {
    fetchData();
    fetchFilterData();
  }, []);

  const fetchData = async (filterParams = {}) => {
    try {
      setLoading(true);
      const [assignRes, expendRes] = await Promise.all([
        assignmentAPI.getAll(filterParams),
        expenditureAPI.getAll(filterParams),
      ]);
      setAssignments(assignRes.data);
      setExpenditures(expendRes.data);
      setError('');
    } catch (err) {
      setError('Failed to load data');
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

  // Assignment Dialog Handlers
  const handleOpenAssignDialog = (assignment = null) => {
    if (assignment) {
      setEditingId(assignment._id);
      setAssignmentForm({
        asset: assignment.asset._id,
        base: assignment.base._id,
        assignedTo: assignment.assignedTo,
        quantity: assignment.quantity,
        remarks: assignment.remarks,
      });
    } else {
      setEditingId(null);
      setAssignmentForm({
        asset: '',
        base: user?.base?._id || '',
        assignedTo: '',
        quantity: '',
        remarks: '',
      });
    }
    setOpenAssignDialog(true);
  };

  const handleCloseAssignDialog = () => {
    setOpenAssignDialog(false);
    setEditingId(null);
  };

  const handleSubmitAssignment = async () => {
    try {
      if (editingId) {
        await assignmentAPI.update(editingId, assignmentForm);
      } else {
        await assignmentAPI.create(assignmentForm);
      }
      handleCloseAssignDialog();
      fetchData(filters);
      alert(editingId ? 'Assignment updated' : 'Assignment created');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving assignment');
    }
  };

  // Expenditure Dialog Handlers
  const handleOpenExpenditureDialog = (expenditure = null) => {
    if (expenditure) {
      setEditingId(expenditure._id);
      setExpenditureForm({
        asset: expenditure.asset._id,
        base: expenditure.base._id,
        quantity: expenditure.quantity,
        reason: expenditure.reason,
        remarks: expenditure.remarks,
      });
    } else {
      setEditingId(null);
      setExpenditureForm({
        asset: '',
        base: user?.base?._id || '',
        quantity: '',
        reason: '',
        remarks: '',
      });
    }
    setOpenExpenditureDialog(true);
  };

  const handleCloseExpenditureDialog = () => {
    setOpenExpenditureDialog(false);
    setEditingId(null);
  };

  const handleSubmitExpenditure = async () => {
    try {
      if (editingId) {
        await expenditureAPI.update(editingId, expenditureForm);
      } else {
        await expenditureAPI.create(expenditureForm);
      }
      handleCloseExpenditureDialog();
      fetchData(filters);
      alert(editingId ? 'Expenditure updated' : 'Expenditure recorded');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving expenditure');
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (window.confirm('Delete this assignment?')) {
      try {
        await assignmentAPI.delete(id);
        fetchData(filters);
        alert('Assignment deleted');
      } catch (err) {
        setError('Error deleting assignment');
      }
    }
  };

  const handleDeleteExpenditure = async (id) => {
    if (window.confirm('Delete this expenditure?')) {
      try {
        await expenditureAPI.delete(id);
        fetchData(filters);
        alert('Expenditure deleted');
      } catch (err) {
        setError('Error deleting expenditure');
      }
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchData(newFilters);
  };

  const handleReset = () => {
    setFilters({
      base: '',
      startDate: '',
      endDate: '',
    });
    fetchData();
  };

  const canEdit = ['Admin', 'BaseCommander'].includes(user?.role);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        Assignments & Expenditures
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
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

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange({ ...filters, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
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

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Assignments" />
          <Tab label="Expenditures" />
        </Tabs>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Assignments Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ mb: 2 }}>
                {canEdit && (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenAssignDialog()}
                  >
                    New Assignment
                  </Button>
                )}
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell><strong>Asset</strong></TableCell>
                      <TableCell><strong>Base</strong></TableCell>
                      <TableCell><strong>Assigned To</strong></TableCell>
                      <TableCell align="right"><strong>Quantity</strong></TableCell>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignments.map((assignment) => (
                      <TableRow key={assignment._id}>
                        <TableCell>{assignment.asset?.name}</TableCell>
                        <TableCell>{assignment.base?.name}</TableCell>
                        <TableCell>{assignment.assignedTo}</TableCell>
                        <TableCell align="right">{assignment.quantity}</TableCell>
                        <TableCell>
                          {new Date(assignment.assignmentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {canEdit && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Edit />}
                                onClick={() => handleOpenAssignDialog(assignment)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<Delete />}
                                onClick={() => handleDeleteAssignment(assignment._id)}
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
            </TabPanel>

            {/* Expenditures Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ mb: 2 }}>
                {canEdit && (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenExpenditureDialog()}
                  >
                    New Expenditure
                  </Button>
                )}
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell><strong>Asset</strong></TableCell>
                      <TableCell><strong>Base</strong></TableCell>
                      <TableCell align="right"><strong>Quantity</strong></TableCell>
                      <TableCell><strong>Reason</strong></TableCell>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expenditures.map((expenditure) => (
                      <TableRow key={expenditure._id}>
                        <TableCell>{expenditure.asset?.name}</TableCell>
                        <TableCell>{expenditure.base?.name}</TableCell>
                        <TableCell align="right">{expenditure.quantity}</TableCell>
                        <TableCell>{expenditure.reason}</TableCell>
                        <TableCell>
                          {new Date(expenditure.expenditureDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {canEdit && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Edit />}
                                onClick={() => handleOpenExpenditureDialog(expenditure)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<Delete />}
                                onClick={() => handleDeleteExpenditure(expenditure._id)}
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
            </TabPanel>
          </>
        )}
      </Paper>

      {/* Assignment Dialog */}
      <Dialog open={openAssignDialog} onClose={handleCloseAssignDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Assignment' : 'New Assignment'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Asset"
              select
              value={assignmentForm.asset}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, asset: e.target.value })}
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
              value={assignmentForm.base}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, base: e.target.value })}
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
              label="Assigned To (Personnel Name/ID)"
              value={assignmentForm.assignedTo}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, assignedTo: e.target.value })}
            />

            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={assignmentForm.quantity}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, quantity: e.target.value })}
            />

            <TextField
              fullWidth
              label="Remarks"
              multiline
              rows={3}
              value={assignmentForm.remarks}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, remarks: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignDialog}>Cancel</Button>
          <Button onClick={handleSubmitAssignment} variant="contained">
            {editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Expenditure Dialog */}
      <Dialog open={openExpenditureDialog} onClose={handleCloseExpenditureDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Expenditure' : 'New Expenditure'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Asset"
              select
              value={expenditureForm.asset}
              onChange={(e) => setExpenditureForm({ ...expenditureForm, asset: e.target.value })}
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
              value={expenditureForm.base}
              onChange={(e) => setExpenditureForm({ ...expenditureForm, base: e.target.value })}
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
              value={expenditureForm.quantity}
              onChange={(e) => setExpenditureForm({ ...expenditureForm, quantity: e.target.value })}
            />

            <TextField
              fullWidth
              label="Reason"
              select
              value={expenditureForm.reason}
              onChange={(e) => setExpenditureForm({ ...expenditureForm, reason: e.target.value })}
              SelectProps={{
                native: true,
              }}
            >
              <option value="">Select Reason</option>
              <option value="Combat">Combat</option>
              <option value="Training">Training</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Loss">Loss</option>
              <option value="Damage">Damage</option>
              <option value="Other">Other</option>
            </TextField>

            <TextField
              fullWidth
              label="Remarks"
              multiline
              rows={3}
              value={expenditureForm.remarks}
              onChange={(e) => setExpenditureForm({ ...expenditureForm, remarks: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseExpenditureDialog}>Cancel</Button>
          <Button onClick={handleSubmitExpenditure} variant="contained">
            {editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Assignments;
