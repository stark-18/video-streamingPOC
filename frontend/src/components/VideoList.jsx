import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar,
  IconButton
} from '@mui/material';
import { 
  PlayArrow, 
  VideoLibrary
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE = (typeof window !== 'undefined' && window.location.hostname === 'localhost')
  ? 'http://localhost:8000'
  : (import.meta.env?.VITE_API_BASE || '');

const VideoList = ({ onSelectVideo }) => {
  const [videos, setVideos] = useState([]);

  const fetchVideos = async () => {
    try {
      const response = await axios.get(`${API_BASE}/videos`);
      setVideos(response.data);
    } catch (err) {
      console.error('Error fetching videos:', err);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        <VideoLibrary sx={{ mr: 1, verticalAlign: 'middle' }} />
        Your Videos
      </Typography>
      
      {videos.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary' }}>
          No videos uploaded yet
        </Typography>
      ) : (
        <List>
          {videos.map((video) => (
            <ListItem key={video.id} divider>
              <ListItemAvatar>
                <Avatar>
                  <VideoLibrary />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={video.filename}
                secondary={`Uploaded: ${new Date(video.uploadedAt).toLocaleDateString()}`}
              />
              <IconButton 
                onClick={() => onSelectVideo(video.videoUrl)}
                color="primary"
              >
                <PlayArrow />
              </IconButton>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default VideoList; 