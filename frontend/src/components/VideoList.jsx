import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Divider,
  Button,
  Chip,
  Skeleton,
  Alert
} from '@mui/material';
import { 
  PlayArrow, 
  Delete, 
  VideoLibrary,
  Refresh
} from '@mui/icons-material';
import axios from 'axios';

const VideoList = ({ onSelectVideo }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchVideos = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:8000/videos');
      setVideos(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to load videos. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDeleteVideo = async (videoId) => {
    try {
      await axios.delete(`http://localhost:8000/videos/${videoId}`);
      // Update the video list after deletion
      setVideos(videos.filter(video => video.id !== videoId));
    } catch (err) {
      console.error('Error deleting video:', err);
      setError('Failed to delete video. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 4, 
        mt: 4,
        borderRadius: 3,
        background: 'linear-gradient(to right bottom, #ffffff, #f9fbff)',
        boxShadow: '0 6px 16px rgba(0,0,0,0.05)'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            color: '#2e3b4e',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <VideoLibrary sx={{ mr: 1.5, color: '#4a6da7' }} />
          Your Videos
        </Typography>
        
        <Button 
          startIcon={<Refresh />} 
          onClick={fetchVideos}
          variant="outlined"
          size="small"
        >
          Refresh
        </Button>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        // Loading skeletons
        Array.from(new Array(3)).map((_, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box sx={{ width: '100%' }}>
                <Skeleton variant="text" width="70%" height={24} />
                <Skeleton variant="text" width="40%" height={20} />
              </Box>
            </Box>
            <Divider sx={{ mt: 2 }} />
          </Box>
        ))
      ) : videos.length === 0 ? (
        <Box 
          sx={{ 
            py: 4, 
            textAlign: 'center',
            border: '2px dashed #cad5e2',
            borderRadius: 2,
            bgcolor: '#f7fafd',
          }}
        >
          <Typography variant="body1" sx={{ color: '#5f6a7a', mb: 2 }}>
            No videos uploaded yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#8996a8' }}>
            Upload your first video to see it here
          </Typography>
        </Box>
      ) : (
        <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
          {videos.map((video) => (
            <React.Fragment key={video.id}>
              <ListItem 
                alignItems="flex-start"
                sx={{ 
                  transition: 'background-color 0.2s',
                  '&:hover': { 
                    bgcolor: 'rgba(74, 109, 167, 0.08)' 
                  },
                  borderRadius: 1,
                  py: 1.5
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    variant="rounded" 
                    sx={{ 
                      bgcolor: 'rgba(74, 109, 167, 0.2)', 
                      color: '#4a6da7',
                      width: 56,
                      height: 56
                    }}
                  >
                    <VideoLibrary />
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#2e3b4e' }}>
                      {video.filename}
                    </Typography>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography variant="body2" color="text.secondary" component="span">
                        {formatDate(video.uploadedAt)}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Chip 
                          label={formatFileSize(video.fileSize)} 
                          size="small" 
                          sx={{ 
                            bgcolor: 'rgba(74, 109, 167, 0.1)', 
                            color: '#4a6da7', 
                            fontWeight: 500,
                            fontSize: '0.75rem'
                          }} 
                        />
                        <Chip 
                          label={video.duration} 
                          size="small" 
                          sx={{ 
                            bgcolor: 'rgba(74, 109, 167, 0.1)', 
                            color: '#4a6da7', 
                            fontWeight: 500,
                            fontSize: '0.75rem'
                          }} 
                        />
                      </Box>
                    </React.Fragment>
                  }
                  sx={{ ml: 1 }}
                />
                
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    onClick={() => onSelectVideo(video.videoUrl)}
                    sx={{ 
                      bgcolor: 'rgba(74, 109, 167, 0.1)',
                      color: '#4a6da7',
                      mr: 1,
                      '&:hover': {
                        bgcolor: 'rgba(74, 109, 167, 0.2)',
                      }
                    }}
                  >
                    <PlayArrow />
                  </IconButton>
                  <IconButton 
                    edge="end" 
                    onClick={() => handleDeleteVideo(video.id)}
                    sx={{ 
                      color: '#e57373',
                      '&:hover': {
                        bgcolor: 'rgba(229, 115, 115, 0.1)',
                      }
                    }}
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default VideoList; 