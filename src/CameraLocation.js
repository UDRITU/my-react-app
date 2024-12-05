import React, { useState, useEffect, useRef } from 'react';

const CameraLocation = () => {
  const [location, setLocation] = useState(null);
  const [hasCameraAccess, setHasCameraAccess] = useState(false);
  const videoRef = useRef(null);
  

  // Function to handle location access
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to retrieve location.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Function to handle camera access
  const getCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // This sets the camera to the back one
      });
      videoRef.current.srcObject = stream;
      setHasCameraAccess(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera.');
    }
  };

  // Call the location and camera access functions when component mounts
  useEffect(() => {
    getLocation();
    getCamera();
  }, []);

  // Function to capture the photo
  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const video = videoRef.current;

    // Set canvas dimensions to match the video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current frame from the video onto the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the canvas to a base64 image (data URL)
    const photoDataUrl = canvas.toDataURL('image/png');
    console.log('Captured Photo:', photoDataUrl);
    // Here, you can do whatever you want with the photo (upload, display, etc.)
  };

  return (
    <div>
      <h1>Camera and Location App</h1>

      <div>
        <h2>Location:</h2>
        {location ? (
          <p>
            Latitude: {location.latitude}, Longitude: {location.longitude}
          </p>
        ) : (
          <p>Fetching location...</p>
        )}
      </div>

      <div>
        <h2>Camera Feed:</h2>
        {hasCameraAccess ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: '100%', maxWidth: '500px' }}
          ></video>
        ) : (
          <p>Loading camera...</p>
        )}
      </div>

      <button onClick={capturePhoto}>Capture Photo</button>
    </div>
  );
};

export default CameraLocation;
