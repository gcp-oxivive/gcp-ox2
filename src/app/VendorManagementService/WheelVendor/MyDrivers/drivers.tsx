'use client';
import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';
import './drivers.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faClipboardList, faBell, faUser } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';

interface Driver {
  id: number;
  name: string;
  phone: string;
  imageUrl: string;
}

const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedFooter, setSelectedFooter] = useState('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: '', email: '', phone: '', imageUrl: '' });
  const router = useRouter();

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/drivers/');
      if (response.ok) {
        const data = await response.json();
        const formattedDrivers = data.map((driver: any) => ({
          id: driver.id,
          name: driver.name,
          phone: driver.phone,
          imageUrl: driver.profile_photo ? `${driver.profile_photo}` : 'https://via.placeholder.com/50',
        }));
        setDrivers(formattedDrivers);
      } else {
        console.log("Failed to fetch drivers");
      }
    } catch (error) {
      console.log("Error fetching drivers:", error);
    }
  };

  const handleFooterClick = (footer: string) => setSelectedFooter(footer);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setNewDriver({ name: '', email: '', phone: '', imageUrl: '' });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setNewDriver({
        ...newDriver,
        imageUrl: URL.createObjectURL(event.target.files[0]),
      });
    }
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^\d{10}$/.test(phone);
  const validateName = (name: string) => name.trim() !== '';

  const handleSave = async () => {
    if (!validateName(newDriver.name)) {
      alert("Please enter a valid name.");
      return;
    }
    if (!validateEmail(newDriver.email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (!validatePhone(newDriver.phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }
  
    try {
      let imageUrl = '';
  
      // Get the file from the input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput && fileInput.files && fileInput.files[0]) {
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        formData.append('upload_preset', 'driver_images'); // Cloudinary upload preset
  
        // Upload image to Cloudinary
        const cloudinaryResponse = await fetch('https://api.cloudinary.com/v1_1/dvxscrjk0/image/upload', {
          method: 'POST',
          body: formData,
        });
  
        if (cloudinaryResponse.ok) {
          const cloudinaryData = await cloudinaryResponse.json();
          imageUrl = cloudinaryData.secure_url;
        } else {
          console.log('Failed to upload image to Cloudinary');
          alert("Failed to upload image. Please try again.");
          return;
        }
      }
  
      // Prepare the driver data to be sent to the backend
      const driverData = {
        name: newDriver.name,
        email: newDriver.email,
        phone: newDriver.phone,
        profile_photo: imageUrl, // Cloudinary image URL
      };
  
      // Send driver data to the backend
      const response = await fetch('http://localhost:8000/api/drivers/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(driverData),
      });
  
      if (response.ok) {
        console.log('Driver saved successfully');
        closeModal();
        fetchDrivers(); // Re-fetch drivers to update the list
        alert("Driver saved successfully!");
      } else {
        const errorData = await response.json();
        console.log('Failed to save driver:', errorData);
        alert(`Failed to save driver: ${errorData.message || 'Please check the details and try again.'}`);
      }
    } catch (error) {
      console.log('Error occurred while saving driver:', error);
      alert('An error occurred while saving the driver. Please try again.');
    }
  };
  
  

  return (
    <div className="drivers-container">
      <header className="drivers-header">
        <FaArrowLeft className="back-icon5" onClick={() => router.push('/VendorManagementService/Vendors/WheelVendor/Wheel')}/>
        <h1>My Drivers</h1>
        <button className="add-button" onClick={openModal}>
          <FaPlus /> ADD
        </button>
      </header>

      <div className="driver-list">
        <div className="driver-headings">
          <p>Name</p>
          <p>Phone no</p>
        </div>
        
        {drivers.map((driver) => (
          <div key={driver.id} className="driver-card">
            <img src={driver.imageUrl} alt={driver.name} className="driver-image" />
            <div className="driver-info">
              <p className="driver-name">{driver.name}</p>
              <p className="driver-phone">{driver.phone}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="drivers-footer">
        <div className={`footer-icon ${selectedFooter === 'home' ? 'selected' : ''}`} onClick={() => handleFooterClick('home')}>
          <FontAwesomeIcon icon={faHome} />
          <span>Home</span>
        </div>
        <div className={`footer-icon ${selectedFooter === 'bookings' ? 'selected' : ''}`} onClick={() => handleFooterClick('bookings')}>
          <FontAwesomeIcon icon={faClipboardList} />
          <span>Bookings</span>
        </div>
        <div className={`footer-icon ${selectedFooter === 'notifications' ? 'selected' : ''}`} onClick={() => handleFooterClick('notifications')}>
          <FontAwesomeIcon icon={faBell} />
          <span>Notifications</span>
        </div>
        <div className={`footer-icon ${selectedFooter === 'profile' ? 'selected' : ''}`} onClick={() => handleFooterClick('profile')}>
          <FontAwesomeIcon icon={faUser} />
          <span>Profile</span>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="image-upload1">
              <label htmlFor="file-input">
                <img src={newDriver.imageUrl || 'https://via.placeholder.com/100'} alt="Driver" className="driver-modal-image" />
                <FaPlus className="plus-icon" />
              </label>
              <input id="file-input" type="file" onChange={handleImageUpload} style={{ display: 'none' }} />
            </div>
            <div className="modal-fields">
              <label>Name:</label>
              <input type="text" value={newDriver.name} onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })} />
              <label>Email:</label>
              <input type="text" value={newDriver.email} onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })} />
              <label>Phone Number:</label>
              <input type="text" value={newDriver.phone} onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })} />
            </div>
            <div className="modal-footer">
              <button className="modal-close" onClick={closeModal}>Close</button>
              <button className="modal-save" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;