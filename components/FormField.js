import React from 'react';
import {
  TextField,
  MenuItem,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel,
  Switch,
  RadioGroup,
  Radio,
  FormLabel,
  FormGroup,
  InputAdornment,
  IconButton,
  useTheme,
  alpha,
  Typography,
  Box,
  Tooltip,
  Slider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Info as InfoIcon,
} from '@mui/icons-material';

/**
 * A versatile form field component that renders different form controls
 * based on the type prop.
 *
 * @param {Object} props - The component props
 * @param {string} props.type - The input type (text, password, select, etc.)
 * @param {string} props.id - Input id
 * @param {string} props.name - Input name
 * @param {string} props.label - Input label
 * @param {any} props.value - Current value
 * @param {function} props.onChange - Change handler function
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.error - Error message to display
 * @param {string} props.helperText - Helper text to display below the input
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.fullWidth - Whether the field should take up full width
 * @param {Array} props.options - Options for select, radio, checkbox group
 * @param {number} props.rows - Number of rows for textarea
 * @param {Object} props.startAdornment - Component to render at the start of the input
 * @param {Object} props.endAdornment - Component to render at the end of the input
 * @param {boolean} props.disabled - Whether the field is disabled
 * @param {string} props.tooltipText - Text to show in tooltip next to label
 * @param {string} props.margin - Margin size ('none', 'dense', 'normal')
 * @param {Object} props.sx - Additional styled-sx props
 */
const FormField = ({
  type = 'text',
  id,
  name,
  label,
  value,
  onChange,
  required = false,
  error = false,
  helperText = '',
  placeholder = '',
  fullWidth = true,
  options = [],
  rows = 4,
  startAdornment,
  endAdornment,
  disabled = false,
  tooltipText,
  margin = 'normal',
  sx = {},
  ...rest
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [showPassword, setShowPassword] = React.useState(false);
  
  // Generate unique id if not provided
  const fieldId = id || `form-field-${name}-${Math.random().toString(36).substring(2, 9)}`;
  
  // Helper to generate common props for most field types
  const getCommonProps = () => ({
    id: fieldId,
    name,
    value: value ?? '',
    onChange,
    disabled,
    required,
    error: !!error,
    helperText,
    placeholder,
    fullWidth,
    margin,
    sx: {
      '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        '&.Mui-focused': {
          boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`,
        },
        '&.Mui-error': {
          boxShadow: error ? `0 0 0 2px ${alpha(theme.palette.error.main, 0.25)}` : 'none',
        },
      },
      '& .MuiFormLabel-asterisk': {
        color: theme.palette.error.main,
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
      ...sx,
    },
    ...rest,
  });
  
  // Handle password visibility toggle
  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  
  // Label with optional tooltip
  const renderLabelWithTooltip = (labelText) => {
    if (!tooltipText) return labelText;
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {labelText}
        <Tooltip title={tooltipText} arrow placement="top">
          <InfoIcon 
            fontSize="small" 
            sx={{ 
              ml: 0.5, 
              color: theme.palette.text.secondary,
              fontSize: '16px',
              cursor: 'help',
            }} 
          />
        </Tooltip>
      </Box>
    );
  };
  
  // Render field based on type
  switch (type) {
    case 'password':
      return (
        <TextField
          {...getCommonProps()}
          type={showPassword ? 'text' : 'password'}
          label={renderLabelWithTooltip(label)}
          InputProps={{
            startAdornment: startAdornment ? (
              <InputAdornment position="start">
                {startAdornment}
              </InputAdornment>
            ) : null,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleTogglePasswordVisibility}
                  edge="end"
                  sx={{
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      );
      
    case 'textarea':
      return (
        <TextField
          {...getCommonProps()}
          label={renderLabelWithTooltip(label)}
          multiline
          rows={rows}
          InputProps={{
            startAdornment: startAdornment ? (
              <InputAdornment position="start">
                {startAdornment}
              </InputAdornment>
            ) : null,
            endAdornment: endAdornment ? (
              <InputAdornment position="end">
                {endAdornment}
              </InputAdornment>
            ) : null,
          }}
        />
      );
      
    case 'select':
      return (
        <FormControl 
          fullWidth={fullWidth} 
          required={required} 
          error={!!error}
          margin={margin}
          disabled={disabled}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&.Mui-focused': {
                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`,
              },
            },
            ...sx,
          }}
        >
          <InputLabel id={`${fieldId}-label`}>{renderLabelWithTooltip(label)}</InputLabel>
          <Select
            labelId={`${fieldId}-label`}
            id={fieldId}
            name={name}
            value={value ?? ''}
            onChange={onChange}
            label={label}
          >
            {options.map((option) => (
              <MenuItem 
                key={option.value} 
                value={option.value}
                sx={{
                  borderRadius: 1,
                  mx: 0.5,
                  my: 0.25,
                }}
              >
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {(helperText || error) && (
            <FormHelperText>{error || helperText}</FormHelperText>
          )}
        </FormControl>
      );
      
    case 'checkbox':
      return (
        <FormControl 
          fullWidth={fullWidth} 
          required={required} 
          error={!!error}
          margin={margin}
          disabled={disabled}
          component="fieldset"
          variant="standard"
          sx={sx}
        >
          {label && <FormLabel component="legend">{renderLabelWithTooltip(label)}</FormLabel>}
          <FormControlLabel
            control={
              <Checkbox
                id={fieldId}
                name={name}
                checked={!!value}
                onChange={onChange}
                color="primary"
                sx={{
                  '&.Mui-checked': {
                    color: theme.palette.primary.main,
                  },
                }}
              />
            }
            label={rest.checkboxLabel || ''}
          />
          {(helperText || error) && (
            <FormHelperText>{error || helperText}</FormHelperText>
          )}
        </FormControl>
      );
      
    case 'checkbox-group':
      return (
        <FormControl 
          fullWidth={fullWidth} 
          required={required} 
          error={!!error}
          margin={margin}
          disabled={disabled}
          component="fieldset"
          variant="standard"
          sx={sx}
        >
          {label && <FormLabel component="legend">{renderLabelWithTooltip(label)}</FormLabel>}
          <FormGroup>
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    id={`${fieldId}-${option.value}`}
                    name={name}
                    value={option.value}
                    checked={Array.isArray(value) ? value.includes(option.value) : false}
                    onChange={onChange}
                    color="primary"
                  />
                }
                label={option.label}
              />
            ))}
          </FormGroup>
          {(helperText || error) && (
            <FormHelperText>{error || helperText}</FormHelperText>
          )}
        </FormControl>
      );
      
    case 'radio':
      return (
        <FormControl 
          fullWidth={fullWidth} 
          required={required} 
          error={!!error}
          margin={margin}
          disabled={disabled}
          component="fieldset"
          sx={sx}
        >
          {label && <FormLabel component="legend">{renderLabelWithTooltip(label)}</FormLabel>}
          <RadioGroup
            aria-label={name}
            name={name}
            value={value ?? ''}
            onChange={onChange}
            row={rest.row}
          >
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio color="primary" />}
                label={option.label}
              />
            ))}
          </RadioGroup>
          {(helperText || error) && (
            <FormHelperText>{error || helperText}</FormHelperText>
          )}
        </FormControl>
      );
      
    case 'switch':
      return (
        <FormControl 
          fullWidth={fullWidth} 
          required={required} 
          error={!!error}
          margin={margin}
          disabled={disabled}
          sx={sx}
        >
          <FormControlLabel
            control={
              <Switch
                id={fieldId}
                name={name}
                checked={!!value}
                onChange={onChange}
                color="primary"
              />
            }
            label={renderLabelWithTooltip(label)}
          />
          {(helperText || error) && (
            <FormHelperText>{error || helperText}</FormHelperText>
          )}
        </FormControl>
      );
      
    case 'slider':
      return (
        <FormControl 
          fullWidth={fullWidth} 
          required={required} 
          error={!!error}
          margin={margin}
          disabled={disabled}
          sx={sx}
        >
          {label && (
            <Typography id={`${fieldId}-label`} gutterBottom>
              {renderLabelWithTooltip(label)}
            </Typography>
          )}
          <Slider
            id={fieldId}
            name={name}
            value={value ?? 0}
            onChange={onChange}
            aria-labelledby={`${fieldId}-label`}
            valueLabelDisplay="auto"
            min={rest.min || 0}
            max={rest.max || 100}
            step={rest.step || 1}
            marks={rest.marks || false}
            color="primary"
          />
          {(helperText || error) && (
            <FormHelperText>{error || helperText}</FormHelperText>
          )}
        </FormControl>
      );
      
    default: // text, email, number, date, etc.
      return (
        <TextField
          {...getCommonProps()}
          type={type}
          label={renderLabelWithTooltip(label)}
          InputProps={{
            startAdornment: startAdornment ? (
              <InputAdornment position="start">
                {startAdornment}
              </InputAdornment>
            ) : null,
            endAdornment: endAdornment ? (
              <InputAdornment position="end">
                {endAdornment}
              </InputAdornment>
            ) : null,
          }}
        />
      );
  }
};

export default FormField; 