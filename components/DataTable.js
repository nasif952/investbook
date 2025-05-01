import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Typography,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  useTheme,
  alpha,
  Tooltip,
  LinearProgress,
  Collapse,
  TableSortLabel,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  ChevronRight as ChevronRightIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Renders a chip with appropriate color based on the value
const StatusChip = ({ value }) => {
  const theme = useTheme();
  
  // Map common status terms to colors
  const getStatusConfig = (status) => {
    const statusLower = String(status).toLowerCase();
    
    if (statusLower.includes('completed') || statusLower.includes('approved') || statusLower.includes('active') || statusLower === 'yes' || statusLower === 'true') {
      return { color: 'success', icon: '●' };
    }
    if (statusLower.includes('pending') || statusLower.includes('in progress') || statusLower.includes('in-progress') || statusLower.includes('review')) {
      return { color: 'warning', icon: '●' };
    }
    if (statusLower.includes('rejected') || statusLower.includes('failed') || statusLower.includes('inactive') || statusLower === 'no' || statusLower === 'false') {
      return { color: 'error', icon: '●' };
    }
    
    // For stages or categories
    if (statusLower === 'idea' || statusLower === 'early') {
      return { color: 'info', icon: '●' };
    }
    if (statusLower === 'prototype' || statusLower === 'mvp') {
      return { color: 'secondary', icon: '●' };
    }
    if (statusLower === 'growth' || statusLower === 'scaling') {
      return { color: 'success', icon: '●' };
    }
    
    return { color: 'default', icon: null };
  };
  
  const config = getStatusConfig(value);
  
  return (
    <Chip
      size="small"
      label={value}
      color={config.color}
      icon={config.icon ? <Box component="span" sx={{ pl: 1, fontSize: '10px' }}>{config.icon}</Box> : undefined}
      sx={{
        borderRadius: '4px',
        fontWeight: 500,
        fontSize: '0.75rem',
        backgroundColor: config.color !== 'default' ? 
          alpha(theme.palette[config.color].main, 0.1) : undefined,
        color: config.color !== 'default' ? 
          theme.palette[config.color].main : undefined,
        '& .MuiChip-label': {
          px: config.icon ? 1 : 1.5,
        },
      }}
    />
  );
};

// Helper function to get display value for a cell
const getCellDisplayValue = (data, column) => {
  if (!data) return '-';
  
  const value = column.accessor ? data[column.accessor] : data[column.id];
  
  if (value === null || value === undefined) return '-';
  
  if (column.format) {
    return column.format(value, data);
  }
  
  return value;
};

// Enhanced DataTable component
const DataTable = ({
  columns,
  data = [],
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
  enableSearch = true,
  initialSortBy = null,
  initialSortDirection = 'asc',
  renderCell,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(data);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  
  useEffect(() => {
    let result = [...data];
    
    // Apply search filter
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter(row => {
        return columns.some(column => {
          const value = getCellDisplayValue(row, column);
          return String(value).toLowerCase().includes(searchTermLower);
        });
      });
    }
    
    // Apply sorting
    if (sortBy) {
      result.sort((a, b) => {
        const aValue = a[sortBy] || '';
        const bValue = b[sortBy] || '';
        
        // Handle string comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        
        // Handle number comparison
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }
    
    setFilteredData(result);
    setPage(0); // Reset to first page when filters change
  }, [data, searchTerm, sortBy, sortDirection, columns]);
  
  // Handle pagination changes
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle sorting
  const handleRequestSort = (columnId) => {
    const isAsc = sortBy === columnId && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortBy(columnId);
  };
  
  // Pagination calculations
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  // Loading state
  if (loading) {
    return (
      <Box sx={{ width: '100%', my: 4, textAlign: 'center' }}>
        <CircularProgress size={40} />
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading data...
        </Typography>
      </Box>
    );
  }
  
  // Empty state
  if (!data.length) {
    return (
      <Box 
        sx={{ 
          width: '100%', 
          py: 6, 
          textAlign: 'center',
          border: `1px dashed ${theme.palette.divider}`,
          borderRadius: 2,
          bgcolor: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
        }}
      >
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }
  
  // Default cell rendering logic
  const defaultCellRenderer = (row, column) => {
    const cellValue = getCellDisplayValue(row, column);
    const isStatus = column.type === 'status';
    
    if (isStatus) {
      return <StatusChip value={cellValue} />;
    }
    
    return (
      <Typography 
        variant="body2" 
        component="div"
        sx={{ 
          fontWeight: column.primary ? 500 : 400,
          color: column.primary ? theme.palette.text.primary : theme.palette.text.secondary,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: column.maxWidth || 'none',
          whiteSpace: column.wrap ? 'normal' : 'nowrap',
        }}
      >
        {cellValue}
      </Typography>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Box sx={{ width: '100%' }}>
          {enableSearch && (
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
              <TextField
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ 
                  width: 250,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          )}
          
          <TableContainer 
            component={Paper} 
            elevation={0}
            sx={{ 
              borderRadius: '8px',
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
              boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <Table size="medium">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.numeric ? 'right' : 'left'}
                      sortDirection={sortBy === column.id ? sortDirection : false}
                      sx={{
                        backgroundColor: isDarkMode ? alpha(theme.palette.primary.dark, 0.1) : alpha(theme.palette.primary.light, 0.05),
                        fontWeight: 600,
                        color: theme.palette.text.secondary,
                        borderBottom: `2px solid ${theme.palette.divider}`,
                        whiteSpace: 'nowrap',
                        padding: '12px 16px',
                      }}
                    >
                      {column.sortable !== false ? (
                        <TableSortLabel
                          active={sortBy === column.id}
                          direction={sortBy === column.id ? sortDirection : 'asc'}
                          onClick={() => handleRequestSort(column.id)}
                        >
                          {column.label}
                        </TableSortLabel>
                      ) : (
                        column.label
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((row, index) => {
                  const isLast = index === paginatedData.length - 1;
                  
                  return (
                    <TableRow
                      hover
                      key={row.id || row._id || index}
                      onClick={() => onRowClick && onRowClick(row)}
                      sx={{
                        cursor: onRowClick ? 'pointer' : 'default',
                        transition: 'background-color 0.2s',
                        borderBottom: isLast ? 'none' : `1px solid ${theme.palette.divider}`,
                        '&:last-child td, &:last-child th': {
                          borderBottom: 0,
                        },
                        '&:hover': onRowClick ? {
                          backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        } : {},
                      }}
                    >
                      {columns.map((column) => {
                        // **MODIFIED**: Use custom renderCell if provided, otherwise use default
                        const defaultValue = defaultCellRenderer(row, column);
                        const cellContent = renderCell 
                          ? renderCell(row, column, defaultValue) 
                          : defaultValue;
                          
                        return (
                          <TableCell 
                            key={column.id} 
                            align={column.numeric ? 'right' : 'left'}
                            sx={{ padding: '12px 16px' }}
                          >
                            {cellContent}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            />
          </TableContainer>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
};

export default DataTable; 