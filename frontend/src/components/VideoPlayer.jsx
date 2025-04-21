import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Box, Paper, Typography, IconButton, Slider, Stack } from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  Settings,
} from '@mui/icons-material';

const VideoPlayer = ({ videoUrl }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState('');
  const controlsTimeoutRef = useRef(null);
  const [isHls, setIsHls] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    console.log("Video URL:", videoUrl);
    setError('');

    // Cleanup previous instance if exists
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (!videoUrl) {
      console.error("No video URL provided");
      setError("No video URL provided");
      return;
    }

    // Check if URL is an HLS stream (m3u8) or direct video file
    const isHlsStream = videoUrl.includes('.m3u8');
    setIsHls(isHlsStream);

    try {
      if (isHlsStream && Hls.isSupported()) {
        // HLS stream handling
        const hls = new Hls({
          debug: false,
          enableWorker: false
        });
        
        hls.on(Hls.Events.ERROR, function(event, data) {
          console.error("HLS error:", data);
          if (data.fatal) {
            console.error(`Fatal error: ${data.type}, details: ${data.details}`);
            setError(`Streaming error: ${data.details}`);
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          }
        });

        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("HLS manifest parsed successfully");
          video.play().catch((e) => {
            console.log('Auto-play prevented:', e);
          });
        });
        
        hlsRef.current = hls;
      } else {
        // Direct video file handling
        console.log("Using direct video source");
        video.src = videoUrl;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch((e) => {
            console.log('Auto-play prevented:', e);
          });
        });
      }
    } catch (err) {
      console.error("Error initializing player:", err);
      setError(`Error initializing player: ${err.message}`);
    }

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      console.log("Video metadata loaded, duration:", video.duration);
      setDuration(video.duration);
    };
    const handleEnded = () => setIsPlaying(false);
    const handleError = (e) => {
      console.error("Video element error:", e);
      setError(`Video playback error: ${e.target.error?.message || 'Unknown error'}`);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('play', () => setIsPlaying(true));
    video.addEventListener('pause', () => setIsPlaying(false));

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('play', () => setIsPlaying(true));
      video.removeEventListener('pause', () => setIsPlaying(false));
      
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoUrl]);

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(e => {
          console.error("Play error:", e);
          setError(`Cannot play video: ${e.message}`);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (event, newValue) => {
    if (videoRef.current) {
      videoRef.current.volume = newValue;
      setVolume(newValue);
      setIsMuted(newValue === 0);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (event, newValue) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newValue;
      setCurrentTime(newValue);
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen().catch(e => {
        console.error("Fullscreen error:", e);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        backgroundColor: '#000',
        overflow: 'hidden',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {error && (
        <Box sx={{ p: 2, bgcolor: 'error.main', color: 'white' }}>
          <Typography variant="body2">{error}</Typography>
        </Box>
      )}
      
      <video
        ref={videoRef}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
        }}
        playsInline
        controls={false}
      />

      {showControls && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            padding: '20px',
            transition: 'opacity 0.3s ease',
          }}
        >
          <Stack spacing={2}>
            <Slider
              value={currentTime || 0}
              max={duration || 100}
              onChange={handleSeek}
              sx={{
                color: '#fff',
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                },
              }}
            />

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton onClick={handlePlayPause} sx={{ color: '#fff' }}>
                  {isPlaying ? <Pause /> : <PlayArrow />}
                </IconButton>

                <Stack direction="row" spacing={1} alignItems="center">
                  <IconButton onClick={handleMute} sx={{ color: '#fff' }}>
                    {isMuted ? <VolumeOff /> : <VolumeUp />}
                  </IconButton>
                  <Slider
                    value={volume}
                    min={0}
                    max={1}
                    step={0.1}
                    onChange={handleVolumeChange}
                    sx={{
                      width: 100,
                      color: '#fff',
                      '& .MuiSlider-thumb': {
                        width: 12,
                        height: 12,
                      },
                    }}
                  />
                </Stack>

                <Typography variant="body2" sx={{ color: '#fff' }}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1}>
                <IconButton sx={{ color: '#fff' }}>
                  <Settings />
                </IconButton>
                <IconButton onClick={handleFullscreen} sx={{ color: '#fff' }}>
                  <Fullscreen />
                </IconButton>
              </Stack>
            </Stack>
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export default VideoPlayer;