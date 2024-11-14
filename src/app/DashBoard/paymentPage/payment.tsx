"use client";
import { IoChevronBackSharp } from 'react-icons/io5';
import { useRouter } from 'next/navigation';
import './payment.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';


interface appointmentData {
  name: string;
  address: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceType: string;
}

const PaymentPage: React.FC = () => {
    const router = useRouter();
    const [appointmentData, setappointmentData] = useState<appointmentData | null>(null);
    const [randomPhoneNumber, setRandomPhoneNumber] = useState<string>("");
    const fixedPhoneNumber = "6303872390";
    const fixedEmail = "satyasaiseshagiri1919@gmail.com";  // Set fixed email here

    useEffect(() => {
      // Retrieve booking data from local storage on component mount
      const data = localStorage.getItem("appointmentData");
      if (data) {
        setappointmentData(JSON.parse(data));
      }

        // Generate a random Indian phone number
      const randomPhone = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
      setRandomPhoneNumber(randomPhone);

    }, []);
    
    const handlePayment = () => {
      const appointmentData = JSON.parse(localStorage.getItem("appointmentData") || "{}");
      const totalAmount = 10.00;
      const amountInPaise = totalAmount * 100;
    
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        document.body.style.overflow = 'hidden';
        const razorpayOptions = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_41ch2lqayiGZ9X",
          amount: amountInPaise,
          currency: "INR",
          name: "Oxivive Services",
          description: "Order Payment",
          handler: async (response: any) => {
            const appointmentDate = new Date(appointmentData?.appointmentDate);
            const formattedDate = appointmentDate.toISOString().split("T")[0]; // Convert to YYYY-MM-DD format
            const paymentData = {
              service_type: appointmentData?.serviceType === "Oxi Clinic" ? "Oxi clinic" : "Oxi wheel",  // Map the display name to the value
              address: appointmentData?.address,
              name: appointmentData?.name,
              appointment_date: formattedDate,
              appointment_time: appointmentData?.appointmentTime,
              payment_id: response.razorpay_payment_id,
              booking_id: `OXI_${Math.floor(10000 + Math.random() * 90000)}`, // Generate random 5-digit ID
              booking_status: 'completed',
              phone_number: fixedPhoneNumber,
              email: fixedEmail,  
            };
    
            try {
              await axios.post("http://localhost:8000/api/save-booking/", paymentData);
              router.push('/DashBoard/TickPage')
            } catch (error) {
              console.error("Error saving booking:", error);
            }
          },
          prefill: {
            name: appointmentData.name,
            email: "fixedEmail",
            contact: "fixedPhoneNumber,",
          },
          theme: { color: "#3399cc" },
        };
    
        const razorpay = new (window as any).Razorpay(razorpayOptions);
    
        razorpay.on('payment.failed', async (response: any) => {
          const failedData = {
            ...appointmentData,
            payment_id: response.error.metadata.payment_id,
            booking_id: `BI${Math.floor(10000 + Math.random() * 90000)}`,
            booking_status: 'cancelled',
            phone_number: fixedPhoneNumber,
            email: fixedEmail,  
          };
    
          try {
            await axios.post("http://localhost:8000/api/save-booking/", failedData);
          } catch (error) {
            console.error("Error saving failed booking:", error);
          }
        });
    
        razorpay.open();
    
        // Inject custom styles to control the modal's width and height
        const customStyles = `
          .razorpay-checkout-frame {
    width: 350px !important; /* Adjust the width to match the payment container */
    height: 500px !important; /* Adjust the height to match your container's height */
    max-width: 100% !important;
    margin: auto !important;
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    overflow: hidden !important; /* Hide overflow to prevent scrollbars */
  }

  .razorpay-checkout-frame iframe {
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
    overflow: hidden !important; /* Hide overflow within iframe */
  }

  /* Ensure no scrollbars appear on the iframe (for WebKit browsers) */
  .razorpay-checkout-frame iframe::-webkit-scrollbar {
    display: none;
  }

  /* Also hide scrollbar on iframe for other browsers */
  .razorpay-checkout-frame iframe {
    scrollbar-width: none; /* Firefox */
  }
        
    `;
    
        const styleTag = document.createElement('style');
        styleTag.innerHTML = customStyles;
        document.head.appendChild(styleTag);
      };
    
      document.body.appendChild(script);
    };
    
  

    return (
        <div className="payment-container">
            <div className="payment-method">
                <button className="back-button" onClick={() => router.back()}>
                    <IoChevronBackSharp size={20} />
                </button>
                <span className="payment-text">Payment Method</span>
            </div>


            {appointmentData && (
                <div className="booking-details">
                    <h3>Booking Details</h3>
                    <p><strong>Service Type:</strong> {appointmentData.serviceType}</p>
                    <p><strong>Name:</strong> {appointmentData.name}</p>
                    <p><strong>Address:</strong> {appointmentData.address}</p>
                    <p><strong>Date:</strong> {appointmentData.appointmentDate}</p>
                    <p><strong>Time:</strong> {appointmentData.appointmentTime}</p>
                    {/* <p><strong>Phone Number:</strong> {fixedPhoneNumber}</p> */}
                    {/* <p><strong>Email:</strong> {fixedEmail}</p>   */}
                </div>
            )}

            <div className="order-summary">
                <h3>Order Summary</h3>
                <div className="summary-item">
                    <span>Sub Total</span>
                    <span>INR 156.00</span>
                </div>
                <div className="summary-item">
                    <span>Est. Tax</span>
                    <span>INR 12.00</span>
                </div>
                <hr />
                <div className="summary-item total">
                    <span>Total</span>
                    <span> INR 168.00</span>
                </div>
            </div>

            <button className="payment-button" onClick={handlePayment}>Pay Now</button>
        </div>
    );
};

export default PaymentPage;