import React, { useState } from 'react';

const CameraPermission = () => {
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  const captureImage = () => {
    if (window.navigator && window.navigator.camera) {
      // Using Cordova Camera Plugin
      window.navigator.camera.getPicture(
        (imageData) => {
          // Success callback
          setImage('data:image/jpeg;base64,' + imageData);
        },
        (err) => {
          // Error callback
          setError('Error capturing image: ' + err);
        },
        {
          quality: 50,
          destinationType: window.navigator.camera.DestinationType.DATA_URL,
          sourceType: window.navigator.camera.PictureSourceType.CAMERA,
        }
      );
    } else {
      setError('Camera not available');
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
        },
        (err) => {
          setError('Error fetching location: ' + err.message);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div>
      <h1>Capture Image and Location</h1>

      {/* Show location if available */}
      {location ? (
        <p>
          Location: Latitude {location.latitude}, Longitude {location.longitude}
        </p>
      ) : (
        <button onClick={getLocation}>Get Location</button>
      )}

      {/* Show error if there's any */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Button to capture image */}
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

export default CameraPermission;
