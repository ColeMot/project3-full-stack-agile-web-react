import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Managerportal, Order, MainPage, Checkout, Menu, Admin, Kitchen } from "./pages";
import { CartProvider } from "./Functions/CartContext";

function App() {
  return (
    <>
      <div id="google_translate_element"></div>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route
            path="/checkout"
            element={
              <CartProvider>
                <Checkout />
              </CartProvider>
            }
          />
          <Route path="/manager" element={<Managerportal />} />
          <Route path="/order" element={<Order />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/kitchen" element={<Kitchen />}/>
        </Routes>
      </Router>
    </>
  );
}

export default App;
