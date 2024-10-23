
import "./DriverDashBoard.css";
import React from 'react';
import { SlHome } from "react-icons/sl";
import { IoNotificationsOutline } from "react-icons/io5";
import { BsPerson } from "react-icons/bs";
import { LuBookPlus } from "react-icons/lu";

const DriverDashBoard = () => {
  return (
    <div className="container">
      <header className="header">
        <div className="logoContainer">
          <img src="/images/circle.png" alt="OxiWheel Logo" className="logo" />
          <p className= "logo-below-text"> Driver</p>
        </div>
        <h1 className="title">
            <span className="welcome">Welcome to</span>
            <span className="oxiwheel">OxiWheel</span>
        </h1>
        <img src="/images/bell.png" alt="Notification Icon" className="notificationIcon" />
      </header>

      <div className="main">
       
          <div className="card">
            <img src="/images/bookings.png" alt="Dashboard" className="cardIcon" />
            <p className="cardText">Bookings</p>
          </div>
          
          <div className="card">
            <img src="/images/dashboard.png" alt="Bookings" className="cardIcon" />
            <p className="cardText">Dashboard</p>
          </div>
          
        
      </div>

      <footer className="footer">
        <div className="footerItem">
          <SlHome className="footerIcon" />
          <p>Home</p>
        </div>
        <div className="footerItem">
          < LuBookPlus className="footerIcon" />
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
  );
};

export default DriverDashBoard;
