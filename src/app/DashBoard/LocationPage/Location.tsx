"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import './Location.css';
import { IoChevronBackSharp } from 'react-icons/io5';

const Location: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Oxivive Clinic');
  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyCMsV0WQ7v8ra-2e7qRXVnDr7j0vOoOcWM', // Replace with your API key
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lng: longitude };
          setCurrentLocation(location);
          fetchAddress(location);
        },
        (error) => console.error('Error obtaining location:', error)
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
    // Fetch user name from the backend
    fetchUserName();
  }, []);

  const fetchAddress = async (location: google.maps.LatLngLiteral) => {
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=AIzaSyCMsV0WQ7v8ra-2e7qRXVnDr7j0vOoOcWM`);
    const data = await response.json();
    if (data.status === 'OK') {
      const address = data.results[0].formatted_address;
      setCurrentAddress(address);
    } else {
      console.error('Error fetching address:', data.status);
    }
  };

  const fetchUserName = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/usmapp-oxiusers/");
      if (response.ok) {
  
        const data = await response.json();
      console.log("response ", data);

        setUserName(data.name);
      } else {
        console.error("Error fetching user details");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  if (!isLoaded || !currentLocation) return <div>Loading...</div>;

  const addressDetails = {
    "Oxivive Clinic": {
      address: "HSR Layout Pvt. Ltd.",
      name: userName || "Fetching user name...",
    },
    "Oxivive Wheel": {
      address: "Right Joy Pvt. Ltd.",
      name: userName || "Fetching user name...",
    },
  };

  const handleContinue = () => {
    const selectedData = {
      serviceType: activeTab,
      address: currentAddress,
      name: addressDetails[activeTab].name,
    };
    localStorage.setItem('selectedData', JSON.stringify(selectedData));
    window.location.href = '/DashBoard/AppointmentPage';
  };

  return (
    <div>
      <div className="map-section">
        
        <GoogleMap
          zoom={15}
          center={currentLocation}
          mapContainerClassName="map-full-width"
          options={{
            disableDefaultUI: true,
          }}
        >
          <Marker position={currentLocation} />
          <button className="back-button" onClick={() => router.back()}>
          <IoChevronBackSharp size={20} /> {/* Back icon */}
        </button>
        </GoogleMap>
        
      </div>

      <div className="appointment-container">
        
        
      <div className="tab-toggle">
          <button
            className={activeTab === 'Oxivive Clinic' ? 'active' : ''}
            style={{ color: activeTab === 'Oxivive Clinic' ? 'white' : '#FC000E' }}
            onClick={() => setActiveTab('Oxivive Clinic')}
          >
            Oxivive Clinic
          </button>
          <button
            className={activeTab === 'Oxivive Wheel' ? 'active' : ''}
            style={{ color: activeTab === 'Oxivive Wheel' ? 'white' : '#FC000E' }}
            onClick={() => setActiveTab('Oxivive Wheel')}
          >
            Oxivive Wheel
          </button>
        </div>

        <div className="address-section">
          <div className="address-line">
            <p className="label">Your Pick Address</p>
            <h3 className="value">{currentAddress || 'Fetching address...'}</h3>
          </div>
          
          <div className="address-line">
            <p className="label">Your Name</p>
            <h3 className="value">{addressDetails[activeTab].name}</h3>
          </div>
        </div>

        <div className="button-container">
          <button className="continue-button" onClick={handleContinue}>Continue</button>
        </div>
      </div>
    </div>
    
  );




  
};

export default Location;
