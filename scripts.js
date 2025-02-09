let lat = null;
let lon = null;
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged  } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {  signOut   } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
const firebaseConfig = {
  apiKey: "AIzaSyB50oHXItUqhtr6og2SyA-YjNJh3vquQKM",
  authDomain: "news-38eff.firebaseapp.com",
  projectId: "news-38eff",
  storageBucket: "news-38eff.firebasestorage.app",
  messagingSenderId: "248358233838",
  appId: "1:248358233838:web:32c2deec6f37057907f5ff"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    const uid = user.uid;
    main();
    // ...
  } else {
    // User is signed out
    // ...
    window.location.href = "login.html"
  }
});
function setUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        lat = position.coords.latitude;
        lon = position.coords.longitude;

        // Log latitude and longitude
        console.log(`Latitude: ${lat}, Longitude: ${lon}`);

        // Fetch and display nearby stores only after location is set
        fetchNearbyStores();
      },
      (error) => {
        console.error("Geolocation error:", error);
        document.getElementById("storesList").textContent =
          "Unable to retrieve your location.";
      }
    );
  } else {
    console.error("Geolocation not supported.");
    document.getElementById("storesList").textContent =
      "Geolocation is not supported by your browser.";
  }
}

async function fetchNearbyStores() {
  if (lat === null || lon === null) {
    console.error("Latitude and longitude not set.");
    return;
  }

  // Overpass API query to find shops (grocery stores, malls, supermarkets, etc.) within 5km
  const overpassQuery = `
    [out:json];
    (
      node["shop"](around:5000, ${lat}, ${lon});
      node["amenity"="marketplace"](around:5000, ${lat}, ${lon});
    );
    out;
  `;

  const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
    overpassQuery
  )}`;

  try {
    const response = await fetch(overpassUrl);
    const data = await response.json();

    const storesList = document.getElementById("storesList");
    storesList.innerHTML = ""; // Clear previous content

    if (data && data.elements.length > 0) {
      console.log("Nearby Stores:", data.elements);

      // Limit the stores to the first 7
      const storesToDisplay = data.elements.slice(0, 7);

      storesToDisplay.forEach((store) => {
        const storeName = store.tags.name || "Unnamed Store";
        const storeType = store.tags.shop || "Unknown Type";

        // Create a store card
        const storeCard = document.createElement("li");
        storeCard.classList.add("store-card");

        // Add store name
        const storeNameElement = document.createElement("div");
        storeNameElement.classList.add("store-name");
        storeNameElement.textContent = storeName;

        // Add store type
        const storeTypeElement = document.createElement("div");
        storeTypeElement.classList.add("store-type");
        storeTypeElement.textContent = storeType;

        // Append elements to store card
        storeCard.appendChild(storeNameElement);
        storeCard.appendChild(storeTypeElement);

        // Append store card to list
        storesList.appendChild(storeCard);
      });
    } else {
      storesList.textContent = "No stores found nearby.";
    }
  } catch (error) {
    console.error("Error fetching nearby stores:", error);
    document.getElementById("storesList").textContent =
      "Failed to load nearby stores.";
  }
}

// Set the user location on page load


async function fetchProductData() {
  const url =
    "https://real-time-amazon-data.p.rapidapi.com/deals-v2?country=IN&min_product_star_rating=ALL&price_range=ALL&discount_range=ALL";
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "ff34655b71msh17c0190835ec44ep181360jsnda328e5f1831",
      "X-RapidAPI-Host": "real-time-amazon-data.p.rapidapi.com",
    },
  };

  try {
    const response = await fetch(url, options);
    // if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    // Check if data contains deals
    if (data && data.data && Array.isArray(data.data.deals) && data.data.deals.length > 0) {
      const deals = data.data.deals;

      // Get the container elements
      const cont = document.querySelectorAll(".deal-card");

      // Loop through and update the first 3 deals
      for (let i = 0; i < Math.min(3, deals.length); i++) {
        cont[i].innerHTML = `
          <h3>${deals[i].deal_title}</h3>
          <p>Price: ₹${deals[i].deal_price.amount} (Discount: ₹${deals[i].savings_amount.amount})</p>
        `;
      }
    } else {
      document.getElementById("dealsContainer").innerHTML = "<p>No deals found.</p>";
    }
  } catch (error) {
    console.error("Error fetching Amazon deals:", error);
    document.getElementById("dealsContainer").innerHTML = "<p>Failed to load deals.</p>";
  }
}

// Fetch product data on page load

async function searchProducts() {
  let count = 0;
  const searchInput = document.querySelector('.search input').value.trim();
  if (!searchInput) {
      alert('Please enter a product to search.');
      return;
  }

  const url = `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(searchInput)}&page=1&country=IN&sort_by=RELEVANCE&product_condition=ALL&is_prime=false&deals_and_discounts=NONE`;
  const options = {
      method: 'GET',
      headers: {
          'x-rapidapi-key': 'ff34655b71msh17c0190835ec44ep181360jsnda328e5f1831',
          'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com'
      }
  };

  try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      if (!data || !data.data || !Array.isArray(data.data.products) || data.data.products.length === 0) {
          document.getElementById('productResults').innerHTML = '<p>No products found.</p>';
          return;
      }

      const productResults = document.getElementById('productResults');
      const productTemplate = document.getElementById('product-template');
      productResults.innerHTML = ''; // Clear previous results

      data.data.products.forEach(product => {
        console.log(product)
          if (count >= 15) return;
          const clone = productTemplate.content.cloneNode(true);
          // Limit title to 100 characters
            const title = product.product_title.length > 100 
            ? product.product_title.substring(0, 97) + "..." 
            : product.product_title;

            clone.querySelector(".product-title").textContent = title;

          clone.querySelector('.product-image').src = product.product_photo;
          // clone.querySelector('.product-title').textContent = product.product_title;
          clone.querySelector('.product-price').textContent = `${product.product_minimum_offer_price ? product.product_minimum_offer_price : 'N/A'}`;
          clone.querySelector('.product-link').href = product.product_url;
          productResults.appendChild(clone);
          count++;
      });

      // Update heading to show the search query
      document.getElementById('searchHeading').textContent = `Search Results for "${searchInput}"`;
  } catch (error) {
      console.error('Error fetching product data:', error);
      document.getElementById('productResults').innerHTML = '<p>Failed to load product data.</p>';
  }
}

// Attach event listener to search button



function main(){
  fetchProductData();
  setUserLocation();
  document.querySelector('.search button').addEventListener('click', searchProducts);
  document.querySelector(".login-btn").addEventListener('click',()=>{
    window.location.href = "login.html"
  })
  document.querySelector(".signup-btn").addEventListener('click',()=>{
    window.location.href = "signup.html"
  })
}