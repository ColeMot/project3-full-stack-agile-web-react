import React, { useState, useEffect } from 'react';
import firebase from '../firebase';
import '../css/admin.css'; // Styles for the admin panel
import '../css/AdminComponents/admin.css'; // Additional styles specific to admin components
import { Link } from 'react-router-dom';
import colorblindIcon from "../images/red-green.png"; // Icon for colorblind mode toggle
import textSizeIcon from "../images/text-size-icon.png"; // Icon for text size increase toggle
import { useRoleRequired } from '../components/utility';

/**
 * Admin panel component for user management. Allows adding, deleting, updating, and finding users,
 * as well as toggling accessibility settings.
 *
 * @returns {JSX.Element} The rendered component for the admin panel.
 * @module Admin
 */
const Admin = () => {
  // Statse for managing the input fields for new, delete, update, and find operations
  const [newUser, setNewUser] = useState({ username: '', name: '', email: '', role: 'Employee' });
  const [deleteUsername, setDeleteUsername] = useState('');
  const [updateUser, setUpdateUser] = useState({ name: '', email: '', role: '' });
  const [findUsername, setFindUsername] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserName, setSelectedUserName] = useState('');

  // States for storing user data and UI state
  const [users, setUsers] = useState([]);
  const [currentUserUsername, setCurrentUserUsername] = useState('');
  const [foundUser, setFoundUser] = useState({ name: '', email: '', role: '' });
  const [currentUser, setCurrentUser] = useState(null);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [textSizeIncreased, setTextSizeIncreased] = useState(false);

  // Enforces the role of 'admin' to access this component
  useRoleRequired(['admin'], '/');

  // Effect to handle authentication state changes
  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged(user => {
      setCurrentUser(user);
      if (user) {
        setCurrentUserUsername(user.username);
      }
    });
    return () => unregisterAuthObserver();
  }, []);

  // Effect to fetch users from Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await firebase.firestore().collection('users').get();
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          email: doc.data().email,
          username: doc.data().username,
          role: doc.data().role
        }));
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  /**
   * Toggles color blind mode.
   * @returns {void}
   * @memberof module:Admin
   */
  const toggleColorBlindMode = () => {
    setColorBlindMode(prev => !prev);
    if (!colorBlindMode) {
      document.body.classList.add("colorblind-mode");
    } else {
      document.body.classList.remove("colorblind-mode");
    }
  };

  /**
   * Toggles increased text size.
   * @returns {void}
   * @memberof module:Admin
   */
  const toggleTextSize = () => {
    setTextSizeIncreased(prev => !prev);
    if (!textSizeIncreased) {
      document.body.classList.add("text-size-increased");
    } else {
      document.body.classList.remove("text-size-increased");
    }
  };

  /**
   * Handles input changes to update state based on form inputs.
   * @param {Object} e - The event object.
   * @returns {void}
   * @memberof module:Admin
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'deleteUsername') {
      setDeleteUsername(value);
    } else if (name === 'findUsername') {
      setFindUsername(value);
    } else {
      setUpdateUser(prev => ({ ...prev, [name]: value }));
    }
  };

  /**
   * Handles changes in the input fields for adding a new user.
   * @param {Object} e - The event object.
   * @returns {void}
   * @memberof module:Admin
   */
  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Adds a new user to Firebase.
   * @returns {void}
   * @memberof module:Admin
   */
  const handleAddUser = () => {
    const exists = users.some(user => user.username === newUser.username);
    if (exists) {
      alert('Error: Username already exists. Please choose a different one.');
      return;
    }
    firebase.firestore().collection('users').add(newUser)
      .then(() => {
        alert('User added successfully!');
        setNewUser({ username: '', name: '', email: '', role: 'Employee' });
      })
      .catch(error => alert('Error adding user: ' + error.message));
  };

  /**
   * Deletes a user from Firebase.
   * @returns {void}
   * @memberof module:Admin
   */
  const handleDeleteUser = () => {
    if (deleteUsername === currentUserUsername) {
      alert("You cannot delete your own account.");
      return;
    }
    firebase.firestore().collection('users').where("username", "==", deleteUsername)
      .get().then(querySnapshot => {
        const batch = firebase.firestore().batch();
        querySnapshot.forEach(doc => {
          batch.delete(doc.ref);
        });
        return batch.commit();
      })
      .then(() => {
        alert('User deleted successfully!');
        setDeleteUsername('');
      })
      .catch(error => alert('Error deleting user: ' + error.message));
  };

  /**
   * Finds a user by username.
   * @returns {void}
   * @memberof module:Admin
   */
  const handleFindUser = () => {
    firebase.firestore().collection('users').where("username", "==", findUsername)
      .get()
      .then(querySnapshot => {
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setSelectedUserId(doc.id);
          setFoundUser({
            name: doc.data().name,
            email: doc.data().email,
            role: doc.data().role
          });
          alert('User found!');
        } else {
          alert('No user found with that username.');
          clearFoundUser();
        }
      })
      .catch(error => alert('Error searching user: ' + error.message));
  };

  /**
   * Handles the selection of a user to update.
   * @param {Object} e - The event object.
   * @returns {void}
   * @memberof module:Admin
   */
  const handleUserSelection = (e) => {
    const userId = e.target.value;
    const selectedUser = users.find(user => user.id === userId);
    if (selectedUser) {
      setSelectedUserId(selectedUser.id);
      setSelectedUserName(selectedUser.username);
      setUpdateUser({
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role
      });
    }
  };

  /**
   * Updates user details in Firebase
   * @returns {void}
   * @memberof module:Admin
   */
  const handleUpdateUser = () => {
    if (selectedUserName === currentUserUsername) {
      alert("You cannot update your own account.");
      return;
    }
    if (selectedUserId) {
      firebase.firestore().collection('users').doc(selectedUserId).update(updateUser)
        .then(() => {
          alert('User updated successfully!');
        })
        .catch(error => {
          alert('Error updating user: ' + error.message);
        });
    } else {
      alert('No user selected for update.');
    }
  };

  /**
   * Clears the found user details
   * @returns {void}
   * @memberof module:Admin
   */
  const clearFoundUser = () => {
    setFoundUser({ name: '', email: '', role: '' });
    setFindUsername('');
  };

  /**
   * Toggles the visibility of all users.
   * @returns {void}
   * @memberof module:Admin
   */
  const handleShowAllUsers = () => {
    setShowAllUsers(!showAllUsers);
  };

  // Render the admin panel UI
  return (
    <div className="admin-page">
      <div className="content">
        {/* Add New User section */}
        <div className="user-input">
          <h2>Add New User</h2>
          <input type="text" name="username" placeholder="Username" value={newUser.username} onChange={handleNewUserChange} />
          <input type="text" name="name" placeholder="Name" value={newUser.name} onChange={handleNewUserChange} />
          <input type="text" name="email" placeholder="Email" value={newUser.email} onChange={handleNewUserChange} />
          <select name="role" value={newUser.role} onChange={handleNewUserChange}>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={handleAddUser}>Add User</button>
          <img
            src={colorblindIcon}
            alt="Colorblind Mode"
            className="admin-colorblind-toggle"
            onClick={toggleColorBlindMode}
            style={{ marginLeft: '10px' }}
          />
          <img
            src={textSizeIcon}
            alt="Increase Text Size"
            className="admin-text-size-toggle"
            onClick={toggleTextSize}
          />
        </div>

        {/* Delete User section */}
        <div className="user-input">
          <h2>Delete User</h2>
          <input type="text" name="deleteUsername" placeholder="Username" value={deleteUsername} onChange={handleInputChange} />
          <button onClick={handleDeleteUser}>Delete User</button>
        </div>

        {/* Update User section */}
        <div className="user-input">
          <h2>Update User</h2>
          <select onChange={handleUserSelection} value={selectedUserId || ''}>
            <option value="">Select a user to update</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.username}</option>
            ))}
          </select>
          <input type="text" name="name" placeholder="Name" value={updateUser.name} onChange={handleInputChange} />
          <input type="text" name="email" placeholder="Email" value={updateUser.email} onChange={handleInputChange} />
          <select name="role" value={updateUser.role} onChange={handleInputChange}>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={handleUpdateUser}>Update User</button>
        </div>

        {/* Find User section */}
        <div className="user-input">
          <h2>Find User by Username</h2>
          <input type="text" name="findUsername" placeholder="Username" value={findUsername} onChange={handleInputChange} />
          <button onClick={handleFindUser}>Find User</button>
          {foundUser.name && (
            <div>
              <p>Name: {foundUser.name}</p>
              <p>Email: {foundUser.email}</p>
              <p>Role: {foundUser.role}</p>
              <button onClick={clearFoundUser}>Clear</button>
            </div>
          )}
        </div>

        {/* Show All Users section */}
        <div className="user-input">
          <button onClick={() => setShowAllUsers(!showAllUsers)}>
            {showAllUsers ? 'Hide All Users' : 'Show All Users'}
          </button>
          {showAllUsers && (
            <div className="user-list">
              <h2>All Users</h2>
              <table className="user-list-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <Link to="/" className="back-to-home-button">
          Back to Home
        </Link>
      </div>
    </div>
  );
}




export default Admin;
