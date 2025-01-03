'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import './Booking.css';
import { FaRedoAlt } from 'react-icons/fa';
import { IoIosArrowBack } from "react-icons/io";
import Footer from './Footer';

interface Booking {
    booking_status: string;
    service_type: string;
    appointment_date: number;
    appointment_time: string;
    name: string;
    address: string;
    booking_id: string;
    phone_number: number;
    user_id: string;
    vendor_id: string;
    oxi_id: string;
    service_price: string;
}

const Booking = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [activeTab, setActiveTab] = useState('MyBooking');
    const [loading, setLoading] = useState(true); // New loading state
    const router = useRouter();
    const searchParams = useSearchParams();
    const user_id = searchParams.get('oxi_id');
    const oxi_id = searchParams.get('oxi_id');

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true); // Start loading
                const response = await fetch(`https://bookingservice-69668940637.asia-east1.run.app/api/bookingapp-bookingservice/${user_id}/`);
                if (response.ok) {
                    const data = await response.json();
                    console.log('Fetched bookings:', data);
    
                    const updatedBookings = data.map((booking: Booking) => ({
                        ...booking,
                        booking_status: booking.booking_status.toLowerCase() === 'cancel' ? 'cancelled' : booking.booking_status,
                    }));
                    setBookings(updatedBookings);
                } else {
                    console.error('Failed to fetch bookings:', response.status);
                }
            } catch (error) {
                console.error('Error fetching booking data:', error);
            } finally {
                setLoading(false); // End loading
            }
        };
    
        fetchBookings();
    }, [user_id]);
    

    const [userMobile, setUserMobile] = useState<string>('N/A');

    useEffect(() => {
        const fetchMobileNumber = async () => {
            try {
                const response = await fetch(`https://bookingservice-69668940637.asia-east1.run.app/api/get-oxiuser-details/${oxi_id}/`);
                if (response.ok) {
                    const data = await response.json();
                    console.log('Fetched mobile number:', data);
                    setUserMobile(data.phone_number || 'N/A');
                } else {
                    console.error('Failed to fetch mobile number:', response.status);
                }
            } catch (error) {
                console.error('Error fetching mobile number:', error);
            }
        };
    
        if (oxi_id) fetchMobileNumber();
    }, [oxi_id]);
    

    const handleCardClick = (booking: Booking) => {
        if (activeTab === 'History') {
            router.push(`/Booking/CompleteBooking?status=${booking.booking_status}&serviceType=${booking.service_type}&appointmentDate=${booking.appointment_date}&appointmentTime=${booking.appointment_time}&name=${booking.name}&location=${booking.address}&booking_id=${booking.booking_id}&service_price=${booking.service_price}`);
        }
    };

    const handleCancelClick = (booking: Booking) => {
        localStorage.setItem('bookingData', JSON.stringify(booking));
        router.push(`/Booking/CancelBooking?status=${booking.booking_status}&serviceType=${booking.service_type}&appointmentDate=${booking.appointment_date}&appointmentTime=${booking.appointment_time}&name=${booking.name}&location=${booking.address}&booking_id=${booking.booking_id}&service_price=${booking.service_price}`);
    };

    const handleRescheduleClick = (booking: Booking) => {
        localStorage.setItem('bookingData', JSON.stringify(booking));
        localStorage.setItem('vendorId', booking.vendor_id);
        router.push(`/Booking/ReschedulePage?booking_id=${booking.booking_id}&oxi_id=${booking.user_id}&date=${booking.appointment_date}&time=${booking.appointment_time}&name=${booking.name}&location=${booking.address}&vendor_id=${booking.vendor_id}`);
    };

    const filteredBookings = bookings
        .filter((booking) => {
            const now = new Date();
            const bookingDateTime = new Date(`${booking.appointment_date}T${booking.appointment_time}`);
            
            if (activeTab === 'MyBooking') {
                return bookingDateTime > now && booking.booking_status.toLowerCase() !== 'cancelled';
            }
            if (activeTab === 'Cancelled') {
                return booking.booking_status.toLowerCase() === 'cancelled';
            }
            if (activeTab === 'History') {
                return (
                    (bookingDateTime <= now || booking.booking_status.toLowerCase() === 'cancelled') && 
                    booking.user_id === user_id
                );
            }
            return false;
        })
        .sort((a, b) => {
            const dateTimeA = new Date(`${a.appointment_date}T${a.appointment_time}`).getTime();
            const dateTimeB = new Date(`${b.appointment_date}T${b.appointment_time}`).getTime();
            return dateTimeA - dateTimeB;
        });

    const handleBackClick = () => {
        router.back();
    };

    const calculateTimeRemaining = (appointmentDate: string, appointmentTime: string) => {
        const now = new Date();
        const bookingDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
        const difference = bookingDateTime.getTime() - now.getTime();

        if (difference <= 0) return 'Time passed';

        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours > 0 ? `${hours}h ` : ''}${minutes}m left`;
    };

    return (
        <div className='container1'>
            <header className='header'>
                <IoIosArrowBack className="back-button" onClick={handleBackClick}/>
                <h1 className="title">My Bookings</h1>
            </header>
            <div className='container-header'>
                <button className={`tab ${activeTab === 'MyBooking' ? 'active' : ''}`} onClick={() => setActiveTab('MyBooking')}>My Booking</button>
                <button className={`tab ${activeTab === 'Cancelled' ? 'active' : ''}`} onClick={() => setActiveTab('Cancelled')}>Cancelled</button>
                <button className={`tab ${activeTab === 'History' ? 'active' : ''}`} onClick={() => setActiveTab('History')}>History</button>
            </div>
            <section className="booking-list">
                {loading ? (
                    <div className="spinner-overlay">
                    <div className="spinner"></div>
                </div>
                ) : filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                        <article key={booking.booking_id} className="booking-card" onClick={() => handleCardClick(booking)}>
                            <p className="service-name1">{booking.service_type} <span className="price">{booking.service_price}</span></p>
                            <p className="booking-address1">Address: {booking.address}</p>
                            <p className="booking-phone1">Phone: {userMobile}</p>
                            <p className="service-time">
                                {new Date(booking.appointment_date).toLocaleDateString()} {booking.appointment_time}
                                <span className="time-remaining">
                                {calculateTimeRemaining(booking.appointment_date, booking.appointment_time)}</span>
                            </p>
                            {activeTab === 'MyBooking' && (
                                <div className="action-buttons">
                                    <button className="cancel-button" onClick={(e) => {
                                        e.stopPropagation();
                                        handleCancelClick(booking);
                                    }}>Cancel Booking</button>
                                    <button
                                        className="reschedule-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRescheduleClick(booking);
                                        }}
                                    >
                                        <FaRedoAlt /> Reschedule
                                    </button>
                                </div>
                            )}
                        </article>
                    ))
                ) : (
                    <p>No bookings available</p>
                )}
            </section>
            {/* Footer Section */}
      <Footer activeFooterIcon={activeTab} setActiveFooterIcon={setActiveTab} />
        </div>
    );
};

export default Booking;
