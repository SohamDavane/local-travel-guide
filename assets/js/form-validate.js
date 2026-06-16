// ========================================
// MumbaiGuide - Contact & Booking Form
// form-validate.js
// ========================================

document.addEventListener("DOMContentLoaded", () => {

  const bookingForm = document.getElementById("bookingForm");
  const messageField = document.getElementById("message");
  const charCount = document.getElementById("charCount");
  const successMessage = document.getElementById("success-message");
  const successName = document.getElementById("success-name");

  // ==========================
  // Character Counter
  // ==========================

  if (messageField && charCount) {
    messageField.addEventListener("input", () => {
      charCount.textContent = messageField.value.length;
    });
  }

  // ==========================
  // Set Minimum Date = Today
  // ==========================

  const today = new Date().toISOString().split("T")[0];

  const fromDate = document.getElementById("from-date");
  const toDate = document.getElementById("to-date");

  if (fromDate) {
    fromDate.setAttribute("min", today);
  }

  if (toDate) {
    toDate.setAttribute("min", today);
  }

  // ==========================
  // Form Submit Validation
  // ==========================

  bookingForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const travelers = document.getElementById("travelers").value;
    const startDate = fromDate.value;
    const endDate = toDate.value;

    // --------------------------
    // Name Validation
    // --------------------------

    if (name.length < 3) {
      alert("Please enter a valid full name.");
      return;
    }

    // --------------------------
    // Email Validation
    // --------------------------

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // --------------------------
    // Phone Validation
    // --------------------------

    if (phone !== "") {

      const phonePattern = /^[0-9]{10}$/;

      if (!phonePattern.test(phone)) {
        alert("Phone number must contain exactly 10 digits.");
        return;
      }

    }

    // --------------------------
    // Travelers Validation
    // --------------------------

    if (travelers < 1) {
      alert("Number of travelers must be at least 1.");
      return;
    }

    // --------------------------
    // Date Validation
    // --------------------------

    if (!startDate || !endDate) {
      alert("Please select both travel dates.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert("Travel end date cannot be before start date.");
      return;
    }

    // --------------------------
    // Success Message
    // --------------------------

    successName.textContent = name;

    successMessage.style.display = "block";

    successMessage.scrollIntoView({
      behavior: "smooth"
    });

    // Required by project statement

    alert("Thank you, we will contact you!");

    bookingForm.reset();

    charCount.textContent = "0";

  });

});