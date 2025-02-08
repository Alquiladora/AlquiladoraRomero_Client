import React, { useState, useEffect } from "react";
import { TextField, InputAdornment, IconButton, Typography, Box ,Alert} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faSave } from "@fortawesome/free-solid-svg-icons";
import { useSpring, animated } from '@react-spring/web';


const EditableInput = ({ label, value, onSave, validate,showHint, hintMessage }) => {
  const [isEditable, setIsEditable] = useState(false);
  const [inputValue, setInputValue] = useState(value); 
  const [tempValue, setTempValue] = useState(value); 
  const [error, setError] = useState(""); 
  const [hasInteracted, setHasInteracted] = useState(false); 
  const [isValid, setIsValid] = useState(false); 
  const [saving, setSaving] = useState(false); 


    // Animación para mostrar la nota de ayuda
    const fadeStyles = useSpring({
        opacity: isEditable ? 1 : 0,
        transform: isEditable ? 'translateY(0)' : 'translateY(-10px)',
        config: { duration: 300 },
      });

  const handleInputChange = (e) => {
    setTempValue(e.target.value); 
    setHasInteracted(true); 
  };

  
  useEffect(() => {
    if (hasInteracted) {
      const validationError = validate(tempValue);
      setError(validationError);
      setIsValid(!validationError); 
    }
  }, [tempValue, hasInteracted, validate]);

  
  const handleIconClick = async () => {
    if (isEditable) {
 
      const validationError = validate(tempValue);
      if (validationError) {
        setError(validationError);
        return;
      }

      setSaving(true); 
      try {

        await onSave(tempValue);
        setInputValue(tempValue); 
        setIsEditable(false); 
      } catch (error) {
        console.error("Error al guardar:", error);
        setError("Error al guardar en la base de datos.");
      } finally {
        setSaving(false); 
      }
    } else {
      setIsEditable(true); 
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      {/* Mostrar mensaje de error arriba del input */}
      {error && (
        <Typography variant="body2" color="error" sx={{ mb: 1 }}>
          {error}
        </Typography>
      )}

       {/* Mostrar el hint (mensaje) cuando esté en modo edición */}
       {showHint && isEditable && (
        <animated.div style={fadeStyles}>
           <Alert severity="info" sx={{ mb: 2 }}>
            {hintMessage}
          </Alert>
        </animated.div>
      )}
      <TextField
        label={label}
        value={isEditable ? tempValue : inputValue}
        onChange={handleInputChange}
        error={!!error}
        fullWidth
        InputProps={{
          readOnly: !isEditable, 
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleIconClick}
                disabled={saving || (!isValid && isEditable)} 
                sx={{
                  color: isEditable
                    ? isValid
                      ? "green" 
                      : "red" 
                    : "blue", 
                }}
              >
                <FontAwesomeIcon icon={isEditable ? faSave : faEdit} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        variant="outlined"
      />
    </Box>
  );
};

export default EditableInput;
