import React, { useState, useEffect, useRef } from 'react';

const MediaCapture = () => {
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [camera, setCamera] = useState('user'); // 'user' for front camera, 'environment' for back camera
  const videoRef = useRef(null); // Reference for the video element
  const [stream, setStream] = useState(null); // To keep track of the media stream

  useEffect(() => {
    // Get the user's location when the component mounts
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
        },
        (err) => {
          setError(err.message);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }

    // Clean up media stream when component is unmounted
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Function to get video stream from selected camera
  const getCameraStream = async (facingMode) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
      });
      setStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera', err);
      setError('Error accessing the camera');
    }
  };

  // Start capturing with the initial camera (user/front camera)
  useEffect(() => {
    getCameraStream(camera);
  }, [camera]);

  // Handle camera toggle
  const toggleCamera = () => {
    // Switch between 'user' (front) and 'environment' (back) cameras
    setCamera((prevCamera) => (prevCamera === 'user' ? 'environment' : 'user'));
  };

  // Capture image from the video stream
  const captureImage = () => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      const imgData = canvas.toDataURL('image/png');
      setImage(imgData);
    }
  };

  return (
    <div>
      <h1>Capture Image and Location</h1>

      {/* Show location if available */}
      {location ? (
        <p>Location: Latitude {location.latitude}, Longitude {location.longitude}</p>
      ) : (
        <p>Location: Loading...</p>
      )}

      {/* Show error if there's any */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Button to toggle camera */}
      <br></br>
      <button onClick={toggleCamera}>Toggle Camera</button>

      {/* Video element to show camera feed */}
      <video ref={videoRef} autoPlay width="30%" height="20%" />

      {/* Button to capture image */}
      <br></br>
      <button onClick={captureImage}>Capture Image</button>

      {/* Show the captured image */}
      {image && (
        <div>
          <h3>Captured Image:</h3>
          <img src={image} alt="Captured" />
        </div>
      )}
    </div>
  );
};

export default MediaCapture;
