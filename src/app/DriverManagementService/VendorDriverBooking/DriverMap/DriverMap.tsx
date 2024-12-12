"use client";
import React, { useEffect, useState } from "react";
import { useRouter,useSearchParams } from 'next/navigation';
import { FaMapMarkerAlt } from "react-icons/fa";
import { LuBookPlus } from "react-icons/lu";
import { SlHome } from "react-icons/sl";
import { IoNotificationsOutline } from "react-icons/io5";
import { IoChevronBackSharp } from 'react-icons/io5';
import { BsPerson } from "react-icons/bs";
import './DriverMap.css';

const getGeocode = async (address: string) => {
  const apiKey = 'AIzaSyCMsV0WQ7v8ra-2e7qRXVnDr7j0vOoOcWM';  // Replace with your Google API Key
  const encodedAddress = encodeURIComponent(address); // URL encode the address
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status === 'OK') {
    const location = data.results[0].geometry.location;
    return {
      latitude: location.lat,
      longitude: location.lng
    };
  } else {
    throw new Error('Geocoding failed');
  }
};
const DriverMap: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const location = searchParams.get('location') || '';
  const email = searchParams.get('email') || '';  // Get email from query params
  const [isReached, setIsReached] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [driverMarker, setDriverMarker] = useState<google.maps.Marker | null>(null);

  const initialCustomerLocation = { lat: 16.7506273, lng: 81.6904138 };
  const [customerLocation, setCustomerLocation] = useState(initialCustomerLocation);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  
  // Fetch geocode coordinates based on the location query parameter
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const coordinate = await getGeocode(location);
        setCoordinates(coordinate);
      } catch (error) {
        console.error('Error fetching geocode:', error);
      }
    };
    fetchLocation();
  }, [location]);

  useEffect(() => {
    if (coordinates) {
      setCustomerLocation({
        lat: coordinates.latitude,
        lng: coordinates.longitude,
      });
    }
  }, [coordinates]);

  // Initialize the map and set up marker and directions
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (!document.querySelector("#googleMaps")) {
        const script = document.createElement("script");
        script.id = "googleMaps";
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCMsV0WQ7v8ra-2e7qRXVnDr7j0vOoOcWM`; // Replace with your API key
        script.async = true;
        script.defer = true;
        script.onload = () => {
          navigator.geolocation.watchPosition(
            (position) => {
              const currentLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };

              if (!map) {
                initializeMap(currentLocation);
              } else if (driverMarker) {
                driverMarker.setPosition(currentLocation);
                map.setCenter(currentLocation);
              }
            },
            (error) => {
              alert("Error getting location. Ensure location access is enabled.");
              console.error("Geolocation error:", error);
            },
            { enableHighAccuracy: true, timeout: 10000 }
          );
        };
        document.head.appendChild(script);
      }
    };

    const initializeMap = (initialPosition: google.maps.LatLngLiteral) => {
      const mapOptions: google.maps.MapOptions = {
        center: initialPosition,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
        tilt: 45,
      };

      const mapInstance = new google.maps.Map(document.getElementById("map") as HTMLElement, mapOptions);
      setMap(mapInstance);

      const renderer = new google.maps.DirectionsRenderer({
        map: mapInstance,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#FF0000',
          strokeWeight: 5,
        },
      });
      setDirectionsRenderer(renderer);

      const marker = new google.maps.Marker({
        position: initialPosition,
        map: mapInstance,
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        },
      });
      setDriverMarker(marker);
    };

    loadGoogleMapsScript();
  }, []);

  // Update route whenever map, directionsRenderer, or customerLocation changes
  useEffect(() => {
    if (map && directionsRenderer && driverMarker) {
      const updateRoute = (
        start: google.maps.LatLngLiteral,
        end: google.maps.LatLngLiteral
      ) => {
        const directionsService = new google.maps.DirectionsService();
        directionsService.route(
          {
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === google.maps.DirectionsStatus.OK && result) {
              directionsRenderer.setDirections(result);
              const route = result.routes[0].legs[0];
              setDistance(route.distance?.text || null);
              setDuration(route.duration?.text || null);
            } else {
              console.error("Error calculating route: ", status);
            }
          }
        );
      };
      updateRoute(driverMarker.getPosition()!.toJSON(), customerLocation);
    }
  }, [map, directionsRenderer, driverMarker, customerLocation]);


  




  const handleReached = async () => {
    try {
      // Send OTP to the customer's email using the email from URL parameters
      const response = await fetch(`http://127.0.0.1:8000/api/user-send-otp/?email=${email}`);
      const data = await response.json();
      
      if (response.ok) {
        alert('OTP has been sent to the customer');
        router.push(`/DriverManagementService/VendorDriverBooking/DriverOtp?email=${email}`);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
    }
  };
  


  const handleStartRide = () => {
    router.push("/DriverManagementService/VendorDriverBooking/DriverOtp");
  };

  return (
    <div className="driverMapContainer">
      <div id="map" style={{ width: "100%", height: "80vh" }}></div>
      <button className="back-button" onClick={() => router.back()}>
          <IoChevronBackSharp size={20} /> {/* Back icon */}
        </button>
        <label className="distance">{distance ? `${distance} | ${duration}` : "Calculating route..."}</label>
     
      {isReached ? (
        <button onClick={handleStartRide} className="startButton">
          Start
        </button>
      ) : (
        <button onClick={handleReached} className="reachedButton">
          Reached
        </button>
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

  );
};

export default DriverMap;