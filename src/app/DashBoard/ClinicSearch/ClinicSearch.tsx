"use client"
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IoChevronBackSharp } from "react-icons/io5";
import "./ClinicSearch.css";
import Footer from "./Footer";

const ClinicSearch: React.FC = () => {
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distances, setDistances] = useState<string[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const location = searchParams?.get("location");
  console.log(location, "location");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        console.error("Error getting user location:", err);
      }
    );
  }, []);

  useEffect(() => {
    const fetchClinics = async () => {
      setLoading(true); // Ensure loading state is set to true when fetching begins
      try {
        const response = await fetch(
          `http://127.0.0.1:8003/api/vendor-details/?location=${encodeURIComponent(location || "")}`
        );
        if (!response.ok) throw new Error("Failed to fetch clinic data");

        const data = await response.json();
        setClinics(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false); // Set loading to false after fetching is complete
      }
    };

    if (location) fetchClinics();
  }, [location]);

  useEffect(() => {
    const calculateDistances = () => {
      if (!userLocation || clinics.length === 0) return;

      const service = new window.google.maps.DistanceMatrixService();

      const clinicAddresses = clinics.map((clinic) => clinic.address);
      service.getDistanceMatrix(
        {
          origins: [{ lat: userLocation.lat, lng: userLocation.lng }],
          destinations: clinicAddresses,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (response: { rows: { elements: any[] }[] }, status: string) => {
          if (status === "OK") {
            const distancesArray = response.rows[0].elements.map((element) =>
              element.status === "OK" ? element.distance.text : "Distance unavailable"
            );
            setDistances(distancesArray);
          } else {
            console.error("Error fetching distance matrix:", status);
          }
        }
      );
    };

    if (window.google && window.google.maps) {
      calculateDistances();
    }
  }, [userLocation, clinics]);

  const handleCardClick = (vendorId: string, selectedService: string) => {
    const oxiId = localStorage.getItem("oxi_id");
    if (!oxiId) {
      console.error("oxi_id is missing in localStorage");
      return;
    }

    localStorage.setItem("selected_service", selectedService);
    router.push(`/DashBoard/BookAppointment?vendor_id=${vendorId}&oxi_id=${oxiId}`);
  };

  if (error) return <p>Error: {error}</p>;

  return (
    <div className="home-container3">
      <div className="clinic-search-container3">
        {/* Header */}
        <div className="search-bar3">
          <button className="back-button3" onClick={() => router.back()}>
            <IoChevronBackSharp size={20} />
          </button>
          <input
            type="text"
            placeholder="Search for a location"
            className="search-input3"
            value={location || ""}
            readOnly
          />
        </div>

        <div className="clinic-cards-container">
          {/* Show loading spinner when loading */}
          {loading ? (
            <div className="spinner-container">
              <div className="spinner"></div>
              
            </div>
          ) : clinics.length > 0 ? (
            clinics.map((clinic, index) => (
              <div className="clinic-card" key={index}>
                <div className="image-container">
                  <div className="white-card">
                    {clinic.selected_service || "Service not available"}
                  </div>
                  <img
                    src={clinic.oxi_image1 || clinic.oxi_image2 || "https://via.placeholder.com/100"}
                    alt={clinic.clinic_name}
                    className="clinic-image"
                    onClick={() => handleCardClick(clinic.vendor_id, clinic.selected_service || "Service not available")}
                  />
                </div>
                <div className="clinic-info">
                <div className="clinic-name-distance-container">
                  <p className="clinic-name3">{clinic.clinic_name}</p>
                  <p className="clinic-distance">
                    {distances[index] || "Calculating distance..."}
                  </p>
                  </div>
                  <div className="clinic-address-container">
                    <p className="clinic-address">{clinic.address}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-clinics-message">No clinics found for the selected location.</p>
          )}
        </div>

        {/* Footer Section */}
        <Footer />
      </div>
    </div>
  );
};

export default ClinicSearch;
