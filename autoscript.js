// Utility functions
function getCurrentTimestamp() {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
    .getDate()
    .toString()
    .padStart(2, "0")} ${d
    .getHours()
    .toString()
    .padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}:${d
    .getSeconds()
    .toString()
    .padStart(2, "0")}`;
}

function generateRandomString(length) {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((x) => charset[x % charset.length])
    .join("");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isEmptyOrSpaces(str) {
  return !str || str.trim().length === 0;
}

function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod/.test(navigator.userAgent);
}

// Initialize variables
const randomString = generateRandomString(5);
let ip = "";
let latitude = null;
let longitude = null;
let state = null;
let city = null;
let zip = "";
let currentTime = getCurrentTimestamp();
let name = "";
let message = "";

// Local storage setup
localStorage.setItem("idTemp", randomString);
const idTemp = localStorage.getItem("idTemp");
export { idTemp };

// Supabase initialization
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabaseUrl = "https://fbgusjhcfhcsmzupzisi.supabase.co"; // Safe to use
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiZ3VzamhjZmhjc216dXB6aXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc3NzI2MTYsImV4cCI6MjA0MzM0ODYxNn0.idT_N9hcPq2dvpDIa6V32vapPE2rmN9t5M4w3IseOSM"; // RLS enabled
const supabase = createClient(supabaseUrl, supabaseKey);

// Data insertion function
async function insertData() {
  console.warn("Inserting data...");
  try {
    const { data, error } = await supabase.from("message-auto").insert([
      {
        "request-id": randomString,
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

    if (error) throw error;
    console.log("Data inserted successfully:", data);
  } catch (error) {
    console.error("Error inserting data:", error);
  }
}

// Data update function
async function updateData() {
  console.warn("Updating data...");
  try {
    const { data, error } = await supabase
      .from("message")
      .update({ message })
      .eq("name", name);

    if (error) throw error;
    console.log("Data updated successfully:", data);
    document.getElementById("send").innerHTML =
      "Message sent &nbsp;&#10004;&nbsp;";
  } catch (error) {
    console.error("Error updating data:", error);
    document.getElementById("send").innerHTML =
      "Error : refresh the page &nbsp;&#10006;";
  }
}

// IP and location fetching function
export async function getIPonload() {
  console.warn("Connecting to server...");
  try {
    const ipResponse = await fetch("https://api.ipify.org?format=json");
    const ipData = await ipResponse.json();
    ip = ipData.ip;

    console.log("Request ID:", randomString);
    console.log("Your IP Address:", ip);

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

    await insertData();
  } catch (error) {
    console.error("Error fetching IP address or location:", error);
  }
}

// Event handling for desktop
if (!isMobileDevice()) {
  const messageContainer = document.getElementById("message-container");
  const form = document.getElementById("form");

  if (messageContainer) messageContainer.style.marginTop = "50px";
  if (form) form.style.maxHeight = "575px";
}

// Event handling for sending data
export async function getIP() {
  name = document.getElementById("name").value || "anonymous";
  message = document.getElementById("message").value;

  if (isEmptyOrSpaces(name) || isEmptyOrSpaces(message)) {
    window.alert("Error: Please fill in all required fields.");
    return;
  }

  document.getElementById("send").innerHTML = "Please wait . . . ";
  await updateData();
}
