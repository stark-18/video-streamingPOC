import { useState, useEffect } from 'react'
import './App.css'
import VideoPlayer from './components/VideoPlayer'
import FileUploader from './components/FileUploader'
import VideoList from './components/VideoList'
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  ThemeProvider, 
  createTheme,
  Tab,
  Tabs
} from '@mui/material'
import { PlayCircleOutline, CloudUpload, VideoLibrary } from '@mui/icons-material'

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#4a6da7',
    },
    secondary: {
      main: '#2e3b4e',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  const [videoUrl, setVideoUrl] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Use a pre-existing video URL for testing
  const testVideoUrl = "http://localhost:8000/uploads/courses/48b135c3-eb96-4d89-b4a1-080f0c5be88d/index.m3u8";

  const handleUploadSuccess = (url) => {
    setVideoUrl(url);
    setUploadSuccess(true);
    // Switch to player tab after successful upload
    setTabValue(1);
  };

  const handleSelectVideo = (url) => {
    setVideoUrl(url);
    // Switch to player tab when a video is selected
    setTabValue(1);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    // Reset upload success when changing tabs
    if (tabValue !== 1) {
      setUploadSuccess(false);
    }
  }, [tabValue]);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: 'background.default',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e2e7ed 100%)',
        py: 4
      }}>
        <Container maxWidth="lg">
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              mb: 4, 
              borderTop: '5px solid #4a6da7',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}
          >
            <Typography 
              variant="h1" 
              align="center" 
              sx={{ 
                mb: 3,
                color: '#2e3b4e',
                fontSize: { xs: '1.8rem', sm: '2.5rem' }
              }}
            >
              Video Streaming App
            </Typography>
            
            <Typography 
              variant="body1" 
              align="center" 
              sx={{ 
                mb: 4, 
                color: '#5f6a7a',
                maxWidth: '700px',
                mx: 'auto'
              }}
            >
              Upload your videos and stream them with our advanced HLS video player. Enjoy high-quality adaptive streaming with complete playback controls.
            </Typography>

            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              centered
              sx={{ 
                mb: 2,
                '& .MuiTab-root': {
                  minWidth: '120px',
                  fontWeight: 500
                }
              }}
            >
              <Tab 
                icon={<CloudUpload />} 
                label="Upload" 
                iconPosition="start" 
              />
              <Tab 
                icon={<PlayCircleOutline />} 
                label="Player" 
                iconPosition="start"
                disabled={!videoUrl} 
              />
              <Tab 
                icon={<VideoLibrary />} 
                label="Library" 
                iconPosition="start" 
              />
            </Tabs>
          </Paper>
          
          {/* Tab Content */}
          <Box sx={{ display: tabValue === 0 ? 'block' : 'none' }}>
            <FileUploader onUploadSuccess={handleUploadSuccess} />
          </Box>
          
          <Box sx={{ display: tabValue === 1 ? 'block' : 'none' }}>
            {videoUrl ? (
              <Box sx={{ mt: 4 }}>
                <VideoPlayer videoUrl={videoUrl} />
              </Box>
            ) : (
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 4, 
                  mt: 4, 
                  textAlign: 'center',
                  background: 'linear-gradient(to right, #f0f4f8, #f8f9fa)',
                  border: '1px dashed #cad5e2',
                  borderRadius: '12px'
                }}
              >
                <PlayCircleOutline sx={{ fontSize: 60, color: '#4a6da7', mb: 2, opacity: 0.7 }} />
                <Typography variant="h6" sx={{ mb: 2, color: '#2e3b4e' }}>
                  No video selected
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, color: '#5f6a7a' }}>
                  Upload a video or select one from your library
                </Typography>
              </Paper>
            )}
          </Box>
          
          <Box sx={{ display: tabValue === 2 ? 'block' : 'none' }}>
            <VideoList onSelectVideo={handleSelectVideo} />
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App
