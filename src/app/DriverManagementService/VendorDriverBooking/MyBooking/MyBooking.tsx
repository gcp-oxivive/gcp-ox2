"use client";
import React, { useState, useEffect } from 'react';
import { MdAccessTime } from "react-icons/md";
import { SlHome } from "react-icons/sl";
import { LuBookPlus } from "react-icons/lu";
import { IoNotificationsOutline } from "react-icons/io5";
import { BsPerson } from "react-icons/bs";
import { BiArrowBack } from "react-icons/bi";
import { FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import './MyBooking.css';
import { useRouter } from 'next/navigation';


interface Booking {
  name: string;
  address: string;
  phone_number: string;
  email: string;
  timeLeft: string;
  booking_status: 'pending' | 'completed' | 'cancelled';
  appointment_date: string; // e.g., "2024-11-20"
  appointment_time: string; // e.g., "10:30:00"
}

interface Error {
  message: string;
}

const MyBooking: React.FC = () => {
  const router = useRouter();
  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate()}-${currentDate.toLocaleString('default', { month: 'short' }).toLowerCase()}-${currentDate.getFullYear()}`;

  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bookings' | 'cancelled' | 'history'>('bookings');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  

  useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/booking-service/');

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('Fetched bookings data:', result);

      if (Array.isArray(result) && result.length > 0) {
        // Sort bookings by appointment date and time
        const sortedBookings = result.sort((a: Booking, b: Booking) => {
          const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
          const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
          return dateA.getTime() - dateB.getTime();
        });

        setBookings(sortedBookings);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError((error as Error).message);
    }
  };

  fetchData();
}, []);


  const handleBackClick = () => {
    router.back();
  };

  const openBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const closeBookingDetails = () => {
    setSelectedBooking(null);
  };

  const openDriverMap = (booking: Booking) => {
    router.push(`/DriverManagementService/VendorDriverBooking/DriverMap?location=${booking.address}&email=${booking.email}`);
  };
  

  const completeRide = () => {
    if (selectedBooking) {
      const updatedBookings = bookings.map((booking, index) => {
        if (booking === selectedBooking) {
          return { ...booking, booking_status: 'completed' };
        } else if (bookings[index - 1] && bookings[index - 1].booking_status === 'completed' && booking.booking_status === 'cancelled') {
          return { ...booking, booking_status: 'active' };
        }
        return booking;
      });
      setBookings(updatedBookings);
      closeBookingDetails();
    }
  };

  // Filter bookings based on the active tab
  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === 'bookings') return booking.booking_status === 'completed'; // show only completed bookings
    if (activeTab === 'cancelled') return booking.booking_status === 'cancelled'; // show only cancelled bookings
    if (activeTab === 'history') return booking.booking_status === 'completed' || booking.booking_status === 'cancelled'; // show both completed and cancelled
    return false;
  });

  return (
    <>
      <div className="myBookingContainer">
        <div className="heading">
          <BiArrowBack className="backArrow" onClick={handleBackClick} />
          <h1 className="myBookingsTitle">My Bookings</h1>
        </div>
        <div className="tabs">
          <span className={`tab ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>Bookings</span>
          <span className={`tab ${activeTab === 'cancelled' ? 'active' : ''}`} onClick={() => setActiveTab('cancelled')}>Cancelled</span>
          <span className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>History</span>
        </div>

        <div className="greyBackground">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking, index) => (
              <div className="bookingContainer" key={index} onClick={() => openBookingDetails(booking)}>
                <div className="bookingDetails">
                  <div className="bookingInfo">
                    <h2>{booking.name}</h2>
                    <p>{booking.address}</p>
                    <p>{booking.phone_number}</p>
                  </div>
                  <div className="bookingActions">
                    <button className="cancelButton">Cancel</button>
                    <p className="date">{formattedDate}</p>
                    <p className="timeLeft">
                      <MdAccessTime /> {booking.timeLeft}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No bookings available.</p>
          )}
        </div>

        {selectedBooking && (
          <div className="modalOverlay" onClick={closeBookingDetails}>
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
              <h2 style={{ color: '#FC000E', textAlign: 'center', fontSize: '24px' }}>{selectedBooking.name}</h2>
              <div className="modalDetails">
                <div className="modalInfo">
                  <FaMapMarkerAlt color="#FC000E" size={18} />
                  <p>{selectedBooking.address}</p>
                </div>
                <div className="modalInfo">
                  <FaPhoneAlt color="#FC000E" size={18} />
                  <p>{selectedBooking.phone_number}</p>
                </div>
                <div className="modalInfo">
                  <p><strong>Email:</strong> {selectedBooking.email}</p>
                </div>

                

                <div className="modalButtons">
                  <button
                    onClick={() => openDriverMap(selectedBooking)}
                    style={{ backgroundColor: selectedBooking.booking_status === 'completed' ? '#FC000E' : '#CCCCCC' }}
                    disabled={selectedBooking.booking_status !== 'completed'}
                  >
                    Start
                  </button>
                  <button
                    onClick={completeRide}
                    style={{ backgroundColor: selectedBooking.booking_status === 'completed' ? '#FC000E' : '#CCCCCC' }}
                    disabled={selectedBooking.booking_status !== 'completed'}
                  >
                    OTP
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="footer">
          <div className="footerItem">
            <SlHome className="footerIcon" />
            <p>Home</p>
          </div>
          <div className="footerItem">
            <LuBookPlus className="footerIcon" />
            <p>Booking</p>
          </div>
          <div className="footerItem">
            <IoNotificationsOutline className="footerIcon" />
            <p>Notification</p>
          </div>
          <div className="footerItem">
            <BsPerson className="footerIcon" />
            <p>Profile</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default MyBooking;
