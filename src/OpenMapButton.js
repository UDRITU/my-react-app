import React from 'react';

const OpenMapButton = ({ latitude, longitude }) => {
  const openMap = () => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  return (
    <button onClick={openMap} style={styles.captureButton}>
      Open Google Map
    </button>
  );
};


const styles = {
  captureButton: {
    marginTop: '10px',
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#0066ff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  }
};


export default OpenMapButton;
