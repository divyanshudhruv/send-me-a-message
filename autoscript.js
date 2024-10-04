// Get the current timestamp in ISO format
function getCurrentTimestamp() {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}   ${d
    .getHours()
    .toString()
    .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d
    .getSeconds()
    .toString()
    .padStart(2, "0")}`;
}

// Generate a random alphanumeric string
function generateRandomString(length) {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((x) => charset[x % charset.length])
    .join("");
}

// Initialize variables
let randomString = generateRandomString(5);
let ip = "";
let latitude = null;
let longitude = null;
let state = null; // Add a default state
let city = null;
let zip = ""; // Placeholder for zip code
let currentTime = getCurrentTimestamp(); // Initialize current time
let name = "";
let message = "";
// let userLatitude = "";
// let userLongitude = "";
let requestID = "";

// Initialize idTemp

localStorage.setItem("idTemp", randomString);
let idTemp = localStorage.getItem("idTemp");
export { idTemp };


// Function to delay the execution of the next step
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isEmptyOrSpaces(str) {
  return str === null || str.match(/^ *$/) !== null;
}

// Main function to get IP and location data
export async function getIPonload() {
  try {
    // Fetch the IPv4 address
    console.warn("Connecting to server...");

    const ipResponse = await fetch("https://api.ipify.org?format=json");
    const ipData = await ipResponse.json();
    ip = ipData.ip;

    console.log("Request ID:", randomString);

    localStorage.setItem("requestID", randomString);
    console.log("Your IP Address:", ip);
    console.log(" ");

    // Fetch location details using ipapi.co
    const locationResponse = await fetch(`https://ipapi.co/${ip}/json/`);
    const locationData = await locationResponse.json();

    // Extract latitude and longitude
    latitude = locationData.latitude; // Change to 'latitude' to match ipapi.co response
    longitude = locationData.longitude; // Change to 'longitude' to match ipapi.co response
    zip = locationData.postal; // Get postal code if available
    city = locationData.city; // Extract city
    state = locationData.region; // Adjust to match ipapi.co response

    console.log("Location Data:", locationData);
    console.log("");
    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);
    console.log("Zip Code:", zip); // Log postal code
    console.log(" ");

    // Save data to localStorage

    // Send data to the Supabase
    await insertData();
  } catch (error) {
    console.log(" ");
    console.error("Error fetching IP address or location:", error);
    console.log(" ");
  }
}

// Initialize Supabase client
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabaseUrl = "https://fbgusjhcfhcsmzupzisi.supabase.co"; // it is safe to use
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiZ3VzamhjZmhjc216dXB6aXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc3NzI2MTYsImV4cCI6MjA0MzM0ODYxNn0.idT_N9hcPq2dvpDIa6V32vapPE2rmN9t5M4w3IseOSM"; // RLS enabled to restrict unauthorized user
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to insert data into the Supabase table
async function insertData() {
  console.warn("Inserting data...");
  const { data, error } = await supabase
    .from("message-auto") // Use your table name
    .insert([
      {
        "request-id": randomString,
        "ip-address": ip,
        latitude: latitude,
        longitude: longitude,
        state: state,
        city: city,
        zip: zip,
        time: currentTime,
        name: name,
        message: message,
      },
    ]);

  if (error) {
    console.error("Error inserting data:", error);

    //here
  } else {
    console.log("Data inserted successfully:", data);
  }
}

// For desktop/pc/laptop users
function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod/.test(navigator.userAgent);
}

if (isMobileDevice() == false) {
  let a = document.getElementById("message-container");
  a.style.marginTop = "50px";

  let b = document.getElementById("form");
  b.style.maxHeight = "575px";
}

export async function getIP() {
  try {
    name = document.getElementById("name").value;
    message = document.getElementById("message").value;

    if (
      (isEmptyOrSpaces(name) == false && isEmptyOrSpaces(message) == false) ||
      (isEmptyOrSpaces(name) == false && isEmptyOrSpaces(message) == false)
    ) {
      document.getElementById("send").innerHTML = "Please wait . . . ";
      // Fetch the IPv4 address

      await updateData();
    } else {
      window.alert(
        "Error: Please fill in all required fields (name : anonymous)"
      );
    }
  } catch (error) {
    console.log(" ");
    console.error("Error fetching IP address or location:", error);
    console.log(" ");
  }
}

export async function updateData() {
  localStorage.setItem("msgsent", 1);

  const name = document.getElementById("name").value;
  const message = document.getElementById("message").value;

  console.warn("Updating data...");

  const { data, error } = await supabase
    .from("message") // Use your table name
    .update({
      message: message, // Update the message field
    })
    .eq("name", name); // Update row where 'name' matches the input

  if (error) {
    console.error("Error inserting data:", error);
    document.getElementById("send").innerHTML =
      "Error : refresh the page &nbsp;&#10006;";

    //here
  } else {
    console.log("Data inserted successfully:", data);
    document.getElementById("send").innerHTML =
      "Message sent &nbsp;&#10004;&nbsp;";

    // setTimeout(() => {
    //   console.clear();
    // }, 5000);
  }
}
