import React, { useState, useRef, useEffect, useCallback } from 'react';
import OpenMapButton from './OpenMapButton';

const CameraCapture = () => {
  const [stream, setStream] = useState(null);
  //const [currentDevice, setCurrentDevice] = useState(null);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraType, setCameraType] = useState('front'); // 'front' or 'back'

  const toggleCamera = async (cameraType) => {
    const devices = await getCameraDevices();
    const nextDevice = devices.find(device =>
      (cameraType === 'front' && device.label.includes('front')) ||
      (cameraType === 'back' && device.label.includes('back'))
    );

    if (nextDevice) {
      stopCurrentStream();
      //setCurrentDevice(nextDevice.deviceId);
      await startStream(nextDevice.deviceId);
    }
  };

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
        //setCurrentDevice(devices[0].deviceId);
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


      {/* Custom Radio Button Slider */}
      <div style={styles.toggleButtonContainer}>
       
        <div
          style={{
            ...styles.toggleButton,
            ...(cameraType === 'front' ? styles.active : styles.inactive)
          }}
          onClick={() => {
            const newCameraType = cameraType === 'front' ? 'back' : 'front';
            setCameraType(newCameraType);
            toggleCamera(newCameraType);
          }}
        >
          <div
            style={{
              ...styles.toggleButtonSlider,
              transform: cameraType === 'front' ? 'translateX(50px)' : 'translateX(0)',
            }}
          />
        </div>
      </div>

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
  toggleButtonContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '20px', // Adding some space for the toggle
  },
  toggleButtonLabel: {
    fontSize: '16px',
    marginRight: '10px', // Space between label and the toggle switch
  },
  toggleButton: {
    position: 'relative',
    width: '100px',
    height: '50px',
    borderRadius: '25px',
    backgroundColor: '#ddd',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '5px',
  },
  toggleButtonSlider: {
    position: 'absolute',
    top: '5px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'white',
    transition: 'transform 0.3s ease',
  },
  active: {
    backgroundColor: '#4CAF50', // Green for Front Camera
  },
  inactive: {
    backgroundColor: '#FF5722', // Orange for Back Camera
  },
  captureButton: {
    marginTop: '10px',
    width: '80px', // Set the width and height to make it a circle
    height: '80px',
    borderRadius: '50%', // This makes it round
    padding: '10px', // Optional padding to adjust the size
    fontSize: '16px',
    backgroundColor: '#FF5722',
    color: 'white',
    border: 'none',
    display: 'flex',
    justifyContent: 'center', // Center the text inside the button
    alignItems: 'center', // Center the text inside the button
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
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