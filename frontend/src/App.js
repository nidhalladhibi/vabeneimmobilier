import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AddListing from "./pages/AddListing";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import OwnerProperties from "./pages/OwnerProperties";
import EditProperty from "./pages/EditProperty";
import PropertyDetails from "./pages/PropertyDetails";
import Dashboard from "./admin/Dashboard"; // Import the PropertyDetails component
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { login } from "./store/actions"; // Import the login action

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Vérifier si les cookies existent au chargement de l'application
    const userCookie = Cookies.get("user");
    const tokenCookie = Cookies.get("token");

    if (userCookie && tokenCookie && userCookie !== "undefined") {
      try {
        // Si les cookies existent, les charger dans le store Redux
        const user = JSON.parse(userCookie);
        const token = tokenCookie;

        // Dispatch l'action de login avec les données des cookies
        dispatch(login({ user, token }));
      } catch (error) {
        console.error("Error parsing user cookie:", error);
        // Clear invalid cookies
        Cookies.remove("user", { secure: true, sameSite: 'Strict', path: '/' });
        Cookies.remove("token", { secure: true, sameSite: 'Strict', path: '/' });
      }
    }
  }, [dispatch]);
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/add-listing"
          element={
            <ProtectedRoute>
              <AddListing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-properties"
          element={
            <ProtectedRoute>
              <OwnerProperties />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-property/:id"
          element={
            <ProtectedRoute>
              <EditProperty />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute >
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/property/:id" element={<PropertyDetails />} /> {/* New route */}
        <Route path="*" element={<h1>Page non trouvée</h1>} /> {/* Catch-all route */}
      </Routes>
    </Router>
  );
};

export default App;