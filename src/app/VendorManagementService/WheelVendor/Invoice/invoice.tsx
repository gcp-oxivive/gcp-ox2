"use client";
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faClipboardList, faBell, faUser, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './invoice.css';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

const InvoicePage: React.FC = () => {
  const [selectedFooter, setSelectedFooter] = useState('home');
  const [selectedTab, setSelectedTab] = useState('invoice');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState<{ id: number; name: string; price: string }[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [savedItems, setSavedItems] = useState<{ id: number; name: string; price: string }[]>([]);
  const [vendorId, setVendorId] = useState<string | null>(null);

  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Fetch vendor ID from URL or localStorage
    const urlVendorId = searchParams.get('vendorId');
    if (urlVendorId) {
      setVendorId(urlVendorId);
    } else {
      const storedVendorId = localStorage.getItem('vendor_id');
      if (storedVendorId) {
        setVendorId(storedVendorId);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/invoices/');
        setInvoices(response.data);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    };

    fetchInvoices();
  }, []);

  const handleFooterClick = (footer: string) => setSelectedFooter(footer);
  const handleTabClick = (tab: string) => setSelectedTab(tab);

  const handleAddItem = () => setItems([...items, { id: items.length, name: '', price: '' }]);
  const handleItemChange = (id: number, field: string, value: string) =>
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));

  const handleSave = () => {
    setSavedItems([...savedItems, ...items]);
    setItems([]);
  };

  const handleRaiseClaim = async () => {
    if (!vendorId) {
      alert('Vendor ID is not available. Please ensure it is set.');
      return;
    }

    const invoiceDetails = savedItems.map((item) => item.name).join(', ');
    const totalPrice = savedItems.reduce((sum, item) => sum + parseFloat(item.price), 0);

    const data = {
      vendor_id: vendorId,
      invoice_details: invoiceDetails,
      invoice_price: totalPrice,
      status: 'Unpaid',
    };

    try {
      const response = await axios.post('http://localhost:8000/api/invoices/', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setInvoices((prevInvoices) => [...prevInvoices, response.data]);
      setSavedItems([]);
      toggleModal();
      alert('Claim raised and data saved successfully!');
    } catch (error) {
      console.error('Error raising claim:', error.response ? error.response.data : error);
      alert('Failed to raise claim.');
    }
  };

  return (
    <div className="invoice-container6">
      {/* Header Section */}
      <div className="header9">
        <button className="back-button1" onClick={() => router.push('/VendorManagementService/Vendors/WheelVendor/Wheel')}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h1 className="title">Invoice</h1>
      </div>

      {/* Tab Navigation */}
      <div className="tabsp">
        <div className={`tab1 ${selectedTab === 'invoice' ? 'active' : ''}`} onClick={() => handleTabClick('invoice')}>
          Invoice
        </div>
        <div className={`tab1 ${selectedTab === 'history' ? 'active' : ''}`} onClick={() => handleTabClick('history')}>
          History
        </div>
      </div>

      {/* Invoice Cards */}
      <div className="new-invoice-card1">
        <div className="cards0">
          {invoices.map((invoice) => (
            <div key={invoice.invoice_id} className="invoice-cards">
              <div className="invoice-info">
                <p className="invoice-title">{invoice.invoice_details}</p>
                <p className="invoice-date">{invoice.date}</p>
              </div>
              <div className="invoice-price">
                <p className="price">Rs {invoice.invoice_price}</p>
                <span className={`status ${invoice.status ? invoice.status.toLowerCase() : ''}`}>{invoice.status}</span>
              </div>
            </div>
          ))}
        </div>

        <button className="new-invoice-buttons" onClick={toggleModal}>
          New Invoice
        </button>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-x-modal" onClick={toggleModal}>
              &times;
            </button>
            <h2>Create New Invoice</h2>

            {savedItems.length > 0 && (
              <div className="saved-items-section">
                <h3>Saved Items</h3>
                <ul className="saved-items-list">
                  {savedItems.map((item, index) => (
                    <li key={index} className="saved-item">
                      <span className="item-name">{item.name}</span> - <span className="item-price"> Rs {item.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button className="add-item-button" onClick={handleAddItem}>
              Add Item
            </button>

            <div className="items-container">
              {items.map((item) => (
                <div key={item.id} className="item-row">
                  <input
                    type="text"
                    placeholder="Item Name"
                    value={item.name}
                    onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Item Price"
                    value={item.price}
                    onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="modal-buttons">
              <button className="save-button" onClick={handleSave}>
                Save
              </button>
              <button className="raise-claim-button" onClick={handleRaiseClaim}>
                Raise Claim
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="footerd">
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
    </div>
  );
};

export default InvoicePage;
