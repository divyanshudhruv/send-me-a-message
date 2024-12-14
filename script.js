// Utility Functions

/**
 * Get the current timestamp in ISO format.
 * @returns {string} - ISO formatted timestamp.
 */
function getCurrentTimestamp() {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
    .getDate()
    .toString()
    .padStart(2, "0")} ${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
}

/**
 * Generate a random alphanumeric string.
 * @param {number} length - Length of the random string.
 * @returns {string} - Generated random string.
 */
function generateRandomString(length) {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((x) => charset[x % charset.length])
    .join("");
}

/**
 * Delay the execution for a specified time.
 * @param {number} ms - Delay time in milliseconds.
 * @returns {Promise<void>} - Resolves after the delay.
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if a string is empty or contains only spaces.
 * @param {string} str - String to check.
 * @returns {boolean} - True if string is empty or contains only spaces, otherwise false.
 */
function isEmptyOrSpaces(str) {
  return str === null || str.match(/^ *$/) !== null;
}

/**
 * Check if the device is a mobile device.
 * @returns {boolean} - True if the device is mobile, otherwise false.
 */
function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod/.test(navigator.userAgent);
}

// Imports
import { idTemp } from "./autoscript.js";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Supabase Client Initialization
const supabaseUrl = "https://fbgusjhcfhcsmzupzisi.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiZ3VzamhjZmhjc216dXB6aXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc3NzI2MTYsImV4cCI6MjA0MzM0ODYxNn0.idT_N9hcPq2dvpDIa6V32vapPE2rmN9t5M4w3IseOSM";
const supabase = createClient(supabaseUrl, supabaseKey);

// Variables Initialization
let randomString = generateRandomString(5);
let ip = "";
let latitude = null;
let longitude = null;
let state = null;
let city = null;
let zip = "";
let currentTime = getCurrentTimestamp();
let name = "";
let message = "";
let userLatitude = "";
let userLongitude = "";

// Main Functions

/**
 * Fetch IP and location data, validate input, and insert data into Supabase.
 */
export async function getIP() {
  try {
    name = document.getElementById("name").value;
    message = document.getElementById("message").value;

    if (!isEmptyOrSpaces(name) && !isEmptyOrSpaces(message)) {
      document.getElementById("send").innerHTML = "Please wait . . . ";
      console.warn("Connecting to server...");

      // Fetch IP address
      const ipResponse = await fetch("https://api.ipify.org?format=json");
      const ipData = await ipResponse.json();
      ip = ipData.ip;

      console.log("Request ID:", idTemp);
      console.log("Your IP Address:", ip);
      console.log(" ");

      // Fetch location details
      const locationResponse = await fetch(`https://ipapi.co/${ip}/json/`);
      const locationData = await locationResponse.json();

      latitude = locationData.latitude;
      longitude = locationData.longitude;
      zip = locationData.postal;
      city = locationData.city;
      state = locationData.region;

      console.log("Location Data:", locationData);
      console.log("Latitude:", latitude);
      console.log("Longitude:", longitude);
      console.log("Zip Code:", zip);

      // Insert data into Supabase
      await insertData();
    } else {
      alert("Error: Please fill in all required fields (name: anonymous)");
    }
  } catch (error) {
    console.error("Error fetching IP address or location:", error);
  }
}

/**
 * Insert data into the Supabase table.
 */
async function insertData() {
  try {
    console.warn("Inserting data...");

    const { data, error } = await supabase.from("message").insert([
      {
        "request-id": idTemp,
        "ip-address": ip,
        latitude,
        longitude,
        state,
        city,
        zip,
        time: currentTime,
        name,
        message,
      },
    ]);

    if (error) {
      console.error("Error inserting data:", error);
      document.getElementById("send").innerHTML = "Error: refresh the page &nbsp;&#10006;";
    } else {
      console.log("Data inserted successfully:", data);
      document.getElementById("send").innerHTML = "Message sent &nbsp;&#10004;&nbsp;";

      setTimeout(() => {
        console.clear();
      }, 2000);
    }
  } catch (error) {
    console.error("Unexpected error during data insertion:", error);
  }
}

// Adjust styles for desktop users
if (!isMobileDevice()) {
  const messageContainer = document.getElementById("message-container");
  messageContainer.style.marginTop = "50px";

  const form = document.getElementById("form");
  form.style.maxHeight = "575px";
}
