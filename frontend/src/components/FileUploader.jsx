import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  CircularProgress, 
  Paper,
  Stack,
  LinearProgress,
  Divider,
  IconButton,
  Alert,
  Collapse
} from '@mui/material';
import { 
  CloudUpload, 
  VideoLibrary,
  CheckCircleOutline,
  Delete,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';

const FileUploader = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setError('');
    setProgress(0);
    setUploadComplete(false);
    setAlertOpen(false);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      setAlertOpen(true);
      return;
    }

    // File size validation (limit to 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError('File too large. Maximum size is 100MB');
      setAlertOpen(true);
      return;
    }

    setLoading(true);
    setProgress(0);
    setError('');
    setAlertOpen(false);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Use the simplified upload endpoint
      const response = await axios.post('http://localhost:8000/upload/simple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          // Calculate upload progress percentage
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        },
        timeout: 60000 // 1 minute timeout should be enough for the simplified endpoint
      });
      
      setLoading(false);
      setUploadComplete(true);
      
      if (response.data.videoUrl) {
        onUploadSuccess(response.data.videoUrl);
      }
    } catch (err) {
      setLoading(false);
      console.error('Upload error:', err);
      
      // Provide more descriptive error messages
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(`Server error: ${err.response.data.error || err.response.statusText}`);
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please try a smaller video file.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Error: ${err.message}`);
      }
      
      setAlertOpen(true);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError('');
    setProgress(0);
    setUploadComplete(false);
    setAlertOpen(false);
  };

  const getFileSize = (size) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 4, 
        borderRadius: 3,
        background: 'linear-gradient(to right bottom, #ffffff, #f9fbff)',
        boxShadow: '0 6px 16px rgba(0,0,0,0.05)' 
      }}
    >
      <Typography 
        variant="h5" 
        sx={{ 
          mb: 2, 
          color: '#2e3b4e',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <VideoLibrary sx={{ mr: 1.5, color: '#4a6da7' }} />
        Upload Video
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      <Collapse in={alertOpen}>
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setAlertOpen(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      </Collapse>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center' }}>
        <Box 
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            border: '2px dashed #cad5e2',
            borderRadius: 2,
            bgcolor: '#f7fafd',
            mb: { xs: 3, md: 0 },
            mr: { md: 3 },
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: '#4a6da7',
              bgcolor: '#f0f7ff'
            }
          }}
        >
          <input
            accept="video/*"
            style={{ display: 'none' }}
            id="video-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="video-upload" style={{ width: '100%', textAlign: 'center' }}>
            <CloudUpload sx={{ fontSize: 60, color: '#4a6da7', mb: 2, opacity: 0.8 }} />
            <Typography variant="body1" sx={{ mb: 1, color: '#2e3b4e', fontWeight: 500 }}>
              Drag and drop your video here
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: '#5f6a7a' }}>
              or
            </Typography>
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUpload />}
              sx={{ 
                borderColor: '#4a6da7',
                color: '#4a6da7',
                '&:hover': {
                  borderColor: '#3a5a91',
                  bgcolor: 'rgba(74, 109, 167, 0.08)'
                }
              }}
            >
              Select Video
            </Button>
          </label>
          <Typography variant="caption" sx={{ mt: 2, color: '#5f6a7a', textAlign: 'center' }}>
            Maximum file size: 100MB
          </Typography>
        </Box>
        
        <Box sx={{ flex: 1 }}>
          {file ? (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, mr: 1 }}>
                  <VideoLibrary sx={{ mr: 1.5, color: '#4a6da7' }} />
                  <Box>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 500,
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {file.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getFileSize(file.size)}
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={clearFile} size="small" sx={{ ml: 1 }}>
                  <Delete fontSize="small" />
                </IconButton>
              </Stack>
              
              {loading && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      Uploading: {progress}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#5f6a7a' }}>
                    Video upload in progress. Do not close this window.
                  </Typography>
                </Box>
              )}
              
              {uploadComplete && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', color: 'success.main' }}>
                  <CheckCircleOutline sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="success.main">
                    Upload complete! Your video is ready to stream.
                  </Typography>
                </Box>
              )}
              
              {!loading && !uploadComplete && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpload}
                  disabled={loading}
                  sx={{ mt: 2, width: '100%' }}
                >
                  Upload Video
                </Button>
              )}
            </Paper>
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ mb: 1, color: '#2e3b4e' }}>
                No file selected
              </Typography>
              <Typography variant="body2" sx={{ color: '#5f6a7a' }}>
                Select a video file to upload and stream with our player.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default FileUploader; 