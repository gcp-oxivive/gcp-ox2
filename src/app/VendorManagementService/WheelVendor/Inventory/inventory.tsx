'use client';
import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaHome, FaBell, FaUser, FaCalendarAlt } from 'react-icons/fa';
import './inventory.css';
import { useRouter } from 'next/navigation';

const Inventory: React.FC = () => {
  const [selectedFooter, setSelectedFooter] = useState<string>('home');
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [approvedItems, setApprovedItems] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  // Fetch vendor_id from local storage
  const vendorId = typeof window !== 'undefined' ? localStorage.getItem('vendor_id') : null;

  // Fetch approved inventory data
  useEffect(() => {
    const fetchApprovedItems = async () => {
      if (!vendorId) {
        console.error('Vendor ID not found. Please log in again.');
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`https://inventorymanagementservice-69668940637.asia-east1.run.app/api/approved_inventorydetails/?vendor_id=${vendorId}`);
        if (response.ok) {
          const data = await response.json();
          setApprovedItems(data);
        } else {
          console.error('Error fetching approved items:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching approved items:', error);
      }finally {
        setIsLoading(false); // Stop loader
      }
    };
  
    fetchApprovedItems();
  }, [vendorId]);
  

  // Fetch inventory data when the popup is triggered
  useEffect(() => {
    const fetchInventoryItems = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://inventorymanagementservice-69668940637.asia-east1.run.app/api/fetchinventory/');
        if (response.ok) {
          const data = await response.json();
          setInventoryItems(data);
        } else {
          console.error('Error fetching inventory items:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching inventory items:', error);
      }finally {
        setIsLoading(false); // Stop loader
      }
    };

    if (showPopup) fetchInventoryItems();
  }, [showPopup]);

  const handleFooterClick = (footer: string) => {
    setSelectedFooter(footer);
  };

  const handleAddItemClick = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleQuantityChange = (index: number, action: 'increase' | 'decrease') => {
    const updatedItems = [...inventoryItems];
    if (action === 'increase') {
      updatedItems[index].quantity = (updatedItems[index].quantity || 0) + 1;
    } else if (action === 'decrease' && updatedItems[index].quantity > 0) {
      updatedItems[index].quantity = updatedItems[index].quantity - 1;
    }
    setInventoryItems(updatedItems);
  };

  const handleSave = async () => {
    if (!vendorId) {
      alert('Vendor ID not found. Please try again.');
      return;
    }

    const payload = inventoryItems
      .filter((item) => item.quantity > 0)
      .map((item) => ({
        product_name: item.product_name,
        stock: item.stock,
        product_image: item.product_image,
        request_quantity: item.quantity,
      }));

    if (payload.length === 0) {
      alert('No items with increased quantity to save.');
      return;
    }

    try {
      const response = await fetch('https://inventorymanagementservice-69668940637.asia-east1.run.app/api/iteminventory/save/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendor_id: vendorId,
          items: payload,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
      } else {
        const errorData = await response.json();
        console.error('Failed to save inventory:', errorData);
        alert('Failed to save inventory.');
      }
    } catch (error) {
      console.error('Error saving inventory:', error);
      alert('An error occurred while saving inventory.');
    }
  };

  return (
    <div className="inventory-page">
      <header className="inventory-header">
        <FaArrowLeft
          className="back-arrow"
          onClick={() => router.push('/VendorManagementService/Vendors/WheelVendor/Wheel')}
        />
        <h1>Inventory</h1>
      </header>
      {isLoading && (
        <div className="spinner-overlay">
          <div className="spinner7"></div>
        </div>
      )}

      {/* Approved Items Section */}
      {!isLoading && !showPopup && (
        <div className="approved-items-section">
          <h2>Approved Items</h2>
          <div className="approved-items">
            {approvedItems.map((item, index) => (
              <div className="approved-item-card" key={index}>
                <img
                  src={item.product_image || '/images/default.png'}
                  alt={item.product_name}
                  className="approved-item-image"
                />
                <div className="approved-item-details">
                  <h3>{item.product_name}</h3>
                  <p>
                    Stock: <span className="in-stock">{item.stock}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button className="add-items-button" onClick={handleAddItemClick}>
            Add items
          </button>
        </div>
      )}

      {/* Popup for Inventory Items */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <div className="inventory-cards">
              {inventoryItems.map((item, index) => (
                <div className="inventory-card" key={index}>
                  <img
                    src={item.product_image || '/images/default.png'}
                    alt={item.product_name}
                    className="item-image"
                  />
                  <div className="item-details">
                    <h2>{item.product_name}</h2>
                    <p>
                      Stock: <span className="in-stock">{item.stock} in Stock</span>
                    </p>
                  </div>

                  <div className="quantity-box">
                    <button
                      className="quantity-button"
                      onClick={() => handleQuantityChange(index, 'decrease')}
                    >
                      -
                    </button>
                    <span className="quantity-display">{item.quantity || 0}</span>
                    <button
                      className="quantity-button"
                      onClick={() => handleQuantityChange(index, 'increase')}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="save-popup" onClick={handleSave}>
              Save
            </button>

            <button className="close-popup" onClick={handleClosePopup}>
              Close
            </button>
          </div>
        </div>
      )}

      <div className="footer">
        <div
          className={`footer-icon ${selectedFooter === 'home' ? 'selected' : ''}`}
          onClick={() => handleFooterClick('home')}
        >
          <FaHome />
          <span>Home</span>
        </div>
        <div
          className={`footer-icon ${selectedFooter === 'bookings' ? 'selected' : ''}`}
          onClick={() => handleFooterClick('bookings')}
        >
          <FaCalendarAlt />
          <span>Bookings</span>
        </div>
        <div
          className={`footer-icon ${selectedFooter === 'notifications' ? 'selected' : ''}`}
          onClick={() => handleFooterClick('notifications')}
        >
          <FaBell />
          <span>Notifications</span>
        </div>
        <div
          className={`footer-icon ${selectedFooter === 'profile' ? 'selected' : ''}`}
          onClick={() => handleFooterClick('profile')}
        >
          <FaUser />
          <span>Profile</span>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
