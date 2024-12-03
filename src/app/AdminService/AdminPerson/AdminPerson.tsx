'use client';
import React, { useState, useEffect } from 'react';
import './AdminPerson.css';
import Sidebar from '../Sidebar/page';

const AdminPerson = () => {
  const [showAddAdminForm, setShowAddAdminForm] = useState(false);
  const [formValues, setFormValues] = useState({
    name: '',
    contact: '',
    email: '',
    address: '',
    state: '',
    district: '',
    pincode: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]); // New state for filtered admins
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editAdminId, setEditAdminId] = useState(null); // To track the admin being edited
  const [searchTerm, setSearchTerm] = useState(''); // New state for search term

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/superadmins/');
        if (response.ok) {
          const data = await response.json();
          setAdmins(data);
          setFilteredAdmins(data); // Set filteredAdmins with all admins initially
        } else {
          setError('Failed to fetch data');
        }
      } catch (err) {
        setError('An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // Update the filteredAdmins when search term changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim() === '') {
      setFilteredAdmins(admins); // If search term is empty, show all admins
    } else {
      const filtered = admins.filter((admin) =>
        admin.name.toLowerCase().startsWith(value.toLowerCase()) // Case-insensitive search
      );
      setFilteredAdmins(filtered);
    }
  };

  const handleAddAdminClick = () => {
    setShowAddAdminForm(true);
    setEditMode(false); // Reset edit mode
    setFormValues({
      name: '',
      contact: '',
      email: '',
      address: '',
      state: '',
      district: '',
      pincode: '',
    });
  };

  const handleEditClick = (admin) => {
    setShowAddAdminForm(true);
    setEditMode(true);
    setEditAdminId(admin.admin_id);
    setFormValues(admin); // Pre-fill form with the selected admin's data
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const validateForm = () => {
    const errors = {};
    if (!formValues.name.trim()) errors.name = 'Name is required';
    if (!formValues.contact.trim() || !/^\d{10}$/.test(formValues.contact))
      errors.contact = 'Valid contact number is required';
    if (!formValues.email.trim() || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formValues.email))
      errors.email = 'Valid email is required';
    if (!formValues.address.trim()) errors.address = 'Address is required';
    if (!formValues.state.trim()) errors.state = 'State is required';
    if (!formValues.district.trim()) errors.district = 'District is required';
    if (!formValues.pincode.trim() || !/^\d{6}$/.test(formValues.pincode))
      errors.pincode = 'Valid 6-digit pincode is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
    } else {
      try {
        const url = editMode
          ? `http://127.0.0.1:8000/api/superadmins/${editAdminId}/` // PUT URL for updating
          : 'http://127.0.0.1:8000/api/superadmins/'; // POST URL for creating
        const method = editMode ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formValues),
        });

        if (response.ok) {
          const updatedAdmin = await response.json();

          if (editMode) {
            // Update the admin list with the edited admin data
            setAdmins(
              admins.map((admin) =>
                admin.admin_id === editAdminId ? updatedAdmin : admin
              )
            );
            setFilteredAdmins(
              filteredAdmins.map((admin) =>
                admin.admin_id === editAdminId ? updatedAdmin : admin
              )
            );
          } else {
            setAdmins([...admins, updatedAdmin]); // Add new admin to the list
            setFilteredAdmins([...filteredAdmins, updatedAdmin]); // Add new admin to filtered list
          }

          setShowAddAdminForm(false);
          setEditMode(false);
          setFormValues({
            name: '',
            contact: '',
            email: '',
            address: '',
            state: '',
            district: '',
            pincode: '',
          });
          setFormErrors({});
          alert('Data has been submitted successfully!');
        } else {
          const errorData = await response.json();
          alert(`Failed to save admin: ${JSON.stringify(errorData)}`);
        }
      } catch (error) {
        alert('An error occurred while saving the admin details.');
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="admin-person-container">
      <Sidebar />
      <main className="content">
        <header>
          <div className="header-content">
            <div className="header-text">
              <h2>{showAddAdminForm ? 'Add/Edit Admin Details' : 'Admin Persons'}</h2>
              <p>
                {showAddAdminForm
                  ? 'Fill the following details to add or edit person'
                  : 'The following table consists of Admins details'}
              </p>
            </div>
            {!showAddAdminForm && (
              <input
                type="text"
                placeholder="Search Admin"
                className="search-input"
                value={searchTerm}
                onChange={handleSearchChange} // Update search on input change
              />
            )}
          </div>
        </header>

        {!showAddAdminForm && (
          <div className="actions">
            <button className="add-details-btn" onClick={handleAddAdminClick}>
              + Add Admin
            </button>
          </div>
        )}

        {!showAddAdminForm && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sl.No</th>
                <th>Admin's Name</th>
                <th>Contact No</th>
                <th>Location</th>
                <th>Edit Info</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map((admin, index) => (
                <tr key={admin.admin_id}>
                  <td>{index + 1}</td>
                  <td>{admin.name}</td>
                  <td>{admin.contact}</td>
                  <td>{`${admin.address}, ${admin.state}`}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEditClick(admin)}>
                      Edit
                    </button>
                    <button className="delete-btn" >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {showAddAdminForm && (
          <div className="add-admin-form">
            <h3>{editMode ? 'Edit Admin' : 'Add New Admin'}</h3>
            <form onSubmit={handleSubmit}>
              {['name', 'contact', 'email', 'address', 'state', 'district', 'pincode'].map(
                (field) => (
                  <div className="form-group" key={field}>
                    <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                    <input
                      type="text"
                      name={field}
                      placeholder={`Enter ${field}`}
                      value={formValues[field]}
                      onChange={handleInputChange}
                    />
                    {formErrors[field] && <p className="error">{formErrors[field]}</p>}
                  </div>
                )
              )}
              <div className="form-actions">
                <button type="submit" className="save1-btn">
                  {editMode ? 'Update Admin' : 'Save Admin'}
                </button>
                <button type="button" className="cancel-btn" onClick={() => setShowAddAdminForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPerson;
