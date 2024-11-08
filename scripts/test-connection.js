// test-connection.js
async function testBackendConnection() {
  const API_URL = window.CONFIG.getApiUrl();
  console.log("Testing connection to:", API_URL);

  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "OPTIONS",
    });
    console.log("Connection test response:", response);
    return true;
  } catch (error) {
    console.error("Connection test failed:", error);
    return false;
  }
}

// Run the test when the script loads
testBackendConnection().then((success) => {
  console.log("Connection test completed. Success:", success);
});
