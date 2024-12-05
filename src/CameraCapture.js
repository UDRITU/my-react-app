import React, { useState, useRef, useEffect, useCallback } from 'react';
import OpenMapButton from './OpenMapButton';

const CameraCapture = () => {
  const [stream, setStream] = useState(null);
  const [currentDevice, setCurrentDevice] = useState(null);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Memoize stopCurrentStream to prevent it from changing on every render
  const stopCurrentStream = useCallback(() => {
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
  }, [stream]);

  // Get the available video devices (front and back cameras)
  const getCameraDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    return videoDevices;
  };

  // Start the video stream from a given device ID
  const startStream = async (deviceId) => {
    try {
      const constraints = {
        video: { deviceId: { exact: deviceId } },
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      videoRef.current.srcObject = newStream;
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  // Switch camera device
  const toggleCamera = async () => {
    const devices = await getCameraDevices();
    const nextDevice = devices.find(device => device.deviceId !== currentDevice);

    if (nextDevice) {
      // Proper cleanup: stop the current stream first
      stopCurrentStream();
      setStream(null); // Optionally reset stream state to avoid flickering
      videoRef.current.srcObject = null; // Reset the video ref

      // Start the next camera stream
      setCurrentDevice(nextDevice.deviceId);
      await startStream(nextDevice.deviceId);
    }
  };

  // Capture the image from the video stream
  const captureImage = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/png');
    setCapturedImage(imageData);
  };

  // Get geolocation (lat, lng)
  const getGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error getting geolocation:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  // Initialize the first camera and geolocation when the component mounts
  useEffect(() => {
    const initializeCamera = async () => {
      const devices = await getCameraDevices();
      if (devices.length > 0) {
        setCurrentDevice(devices[0].deviceId);
        await startStream(devices[0].deviceId);
      }
    };

    initializeCamera();
    getGeolocation();

   
  }, []); // Add stopCurrentStream as a dependency

  return (
    <div style={styles.container}>
      <div style={styles.videoWrapper}>
        <video
          ref={videoRef}
          autoPlay
          width="100%"
          height="auto"
          style={styles.video}
        />
      </div>

      <button onClick={toggleCamera} style={styles.toggleButton}>
        Switch Camera
      </button>

      <button onClick={captureImage} style={styles.captureButton}>
        Capture Image
      </button>

      {location.lat && location.lng && (
        <div style={styles.locationInfo}>
          <p>Latitude: {location.lat}</p>
          <p>Longitude: {location.lng}</p>
          <OpenMapButton latitude={location.lat} longitude={location.lng}></OpenMapButton>
        </div>
      )}

      {capturedImage && (
        <div style={styles.imageContainer}>
          <h3>Captured Image:</h3>
          <img src={capturedImage} alt="Captured" style={styles.capturedImage} />
        </div>
      )}

      <canvas ref={canvasRef} style={styles.canvas} />
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  videoWrapper: {
    position: 'relative',
    width: '80%',
    maxWidth: '600px',
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    border: '2px solid #ccc',
    borderRadius: '10px',
  },
  toggleButton: {
    marginTop: '10px',
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  captureButton: {
    marginTop: '10px',
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#FF5722',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  locationInfo: {
    marginTop: '20px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  imageContainer: {
    marginTop: '20px',
    textAlign: 'center',
  },
  capturedImage: {
    maxWidth: '100%',
    border: '2px solid #ddd',
    borderRadius: '10px',
  },
  canvas: {
    display: 'none',
  },
};

export default CameraCapture;
