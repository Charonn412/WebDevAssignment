// =========================
// Bloom Valley Nursery Site
// Vanilla JavaScript
// =========================

document.addEventListener("DOMContentLoaded", function () {
  initNavigation();
  initFooterYear();
  initSubscribeForm();
  initGalleryPage();
  initCartPage();
  initContactPage();
});

/**
 * Toggles mobile navigation visibility.
 */
function initNavigation() {
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  if (!navToggle || !nav) return;

  navToggle.addEventListener("click", function () {
    const isOpen = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

/**
 * Sets the footer year to the current year.
 */
function initFooterYear() {
  const yearSpan = document.getElementById("footer-year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear().toString();
  }
}

/**
 * Handles newsletter subscription using localStorage.
 * Stores the subscriber email and shows a success message.
 */
function initSubscribeForm() {
  const subscribeForm = document.getElementById("subscribe-form");
  const emailInput = document.getElementById("subscribe-email");
  const messageEl = document.getElementById("subscribe-message");

  if (!subscribeForm || !emailInput || !messageEl) return;

  // Pre-fill if a subscriber email already exists
  const storedEmail = localStorage.getItem("bvn_subscriberEmail");
  if (storedEmail) {
    emailInput.value = storedEmail;
  }

  subscribeForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const email = emailInput.value.trim();

    if (!validateEmail(email)) {
      messageEl.textContent = "Please enter a valid email address.";
      messageEl.classList.remove("success");
      messageEl.classList.add("error");
      emailInput.classList.add("error");
      return;
    }

    emailInput.classList.remove("error");
    localStorage.setItem("bvn_subscriberEmail", email);

    messageEl.textContent = "Thank you for subscribing! You will receive seasonal updates from Bloom Valley Nursery.";
    messageEl.classList.remove("error");
    messageEl.classList.add("success");
  });
}

/**
 * Returns an array of available products.
 * This shared data is used for both the gallery and cart pages.
 */
function getProducts() {
  return [
    {
      id: 1,
      name: "Blushing Peony Mix",
      price: 38.0
    },
    {
      id: 2,
      name: "Evergreen Houseplant Trio",
      price: 54.0
    },
    {
      id: 3,
      name: "Sunset Succulent Garden",
      price: 42.0
    },
    {
      id: 4,
      name: "Cottage Garden Crate",
      price: 65.0
    }
  ];
}

/**
 * Loads the shopping cart from sessionStorage.
 * Returns an array of cart item objects.
 */
function loadCart() {
  const raw = sessionStorage.getItem("bvn_cart");
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (e) {
    console.error("Error parsing cart data from sessionStorage", e);
    return [];
  }
}

/**
 * Saves the cart array back into sessionStorage.
 */
function saveCart(cart) {
  sessionStorage.setItem("bvn_cart", JSON.stringify(cart));
}

/**
 * Adds a product to the cart by ID.
 * If the product is already present, increases the quantity.
 */
function addToCart(productId) {
  const products = getProducts();
  const product = products.find(function (p) {
    return p.id === productId;
  });

  if (!product) {
    return { success: false, message: "Product not found." };
  }

  const cart = loadCart();
  const existing = cart.find(function (item) {
    return item.id === product.id;
  });

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  saveCart(cart);

  return { success: true, message: product.name + " has been added to your cart." };
}

/**
 * Initializes Add to Cart buttons and messaging on the gallery page.
 */
function initGalleryPage() {
  const page = document.body.getAttribute("data-page");
  if (page !== "gallery") return;

  const buttons = document.querySelectorAll(".add-to-cart-btn");
  const messageEl = document.getElementById("gallery-message");

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const card = btn.closest(".product-card");
      if (!card) return;

      const idAttr = card.getAttribute("data-product-id");
      const productId = parseInt(idAttr, 10);
      if (Number.isNaN(productId)) return;

      const result = addToCart(productId);

      if (messageEl) {
        messageEl.textContent = result.message;
        messageEl.classList.remove("error");
        if (result.success) {
          messageEl.classList.add("success");
        } else {
          messageEl.classList.add("error");
        }
      }
    });
  });
}

/**
 * Renders cart items and handles interactions on the cart page.
 */
function initCartPage() {
  const page = document.body.getAttribute("data-page");
  if (page !== "cart") return;

  const tbody = document.getElementById("cart-items");
  const subtotalEl = document.getElementById("cart-subtotal");
  const taxEl = document.getElementById("cart-tax");
  const totalEl = document.getElementById("cart-total");
  const clearBtn = document.getElementById("clear-cart-btn");
  const emptyMessageEl = document.getElementById("cart-empty-message");
  const cartMessageEl = document.getElementById("cart-message");

  if (!tbody || !subtotalEl || !taxEl || !totalEl || !clearBtn) return;

  /**
   * Updates the cart table rows and totals.
   */
  function renderCart() {
    const cart = loadCart();
    tbody.innerHTML = "";

    if (cart.length === 0) {
      if (emptyMessageEl) {
        emptyMessageEl.textContent = "Your cart is currently empty. Visit the gallery to start adding plants.";
      }
      updateTotals(0, 0, 0);
      return;
    }

    if (emptyMessageEl) {
      emptyMessageEl.textContent = "";
    }

    let subtotal = 0;

    cart.forEach(function (item, index) {
      const lineTotal = item.price * item.quantity;
      subtotal += lineTotal;

      const row = document.createElement("tr");

      const nameCell = document.createElement("td");
      nameCell.textContent = item.name;

      const priceCell = document.createElement("td");
      priceCell.textContent = formatCurrency(item.price);

      const quantityCell = document.createElement("td");
      const quantityInput = document.createElement("input");
      quantityInput.type = "number";
      quantityInput.min = "1";
      quantityInput.value = String(item.quantity);
      quantityInput.setAttribute("aria-label", "Quantity for " + item.name);
      quantityInput.addEventListener("change", function () {
        const newValue = parseInt(quantityInput.value, 10);
        if (Number.isNaN(newValue) || newValue < 1) {
          quantityInput.value = String(item.quantity);
          return;
        }
        const cartData = loadCart();
        if (cartData[index]) {
          cartData[index].quantity = newValue;
          saveCart(cartData);
          renderCart();
        }
      });
      quantityCell.appendChild(quantityInput);

      const totalCell = document.createElement("td");
      totalCell.textContent = formatCurrency(lineTotal);

      const removeCell = document.createElement("td");
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.textContent = "Remove";
      removeBtn.className = "btn btn-outline btn-sm";
      removeBtn.setAttribute("aria-label", "Remove " + item.name + " from cart");
      removeBtn.addEventListener("click", function () {
        const cartData = loadCart();
        cartData.splice(index, 1);
        saveCart(cartData);
        renderCart();
        if (cartMessageEl) {
          cartMessageEl.textContent = item.name + " was removed from your cart.";
          cartMessageEl.classList.remove("error");
          cartMessageEl.classList.add("success");
        }
      });
      removeCell.appendChild(removeBtn);

      row.appendChild(nameCell);
      row.appendChild(priceCell);
      row.appendChild(quantityCell);
      row.appendChild(totalCell);
      row.appendChild(removeCell);

      tbody.appendChild(row);
    });

    const taxRate = 0.09; // Example tax rate
    const estimatedTax = subtotal * taxRate;
    const total = subtotal + estimatedTax;

    updateTotals(subtotal, estimatedTax, total);
  }

  /**
   * Updates the subtotal, tax, and total elements.
   */
  function updateTotals(subtotal, tax, total) {
    subtotalEl.textContent = formatCurrency(subtotal);
    taxEl.textContent = formatCurrency(tax);
    totalEl.textContent = formatCurrency(total);
  }

  clearBtn.addEventListener("click", function () {
    saveCart([]);
    renderCart();
    if (cartMessageEl) {
      cartMessageEl.textContent = "Your cart has been cleared.";
      cartMessageEl.classList.remove("error");
      cartMessageEl.classList.add("success");
    }
  });

  renderCart();
}

/**
 * Initializes the feedback and custom order forms on the contact page.
 * Uses localStorage to persist submissions.
 */
function initContactPage() {
  const page = document.body.getAttribute("data-page");
  if (page !== "contact") return;

  const feedbackForm = document.getElementById("feedback-form");
  const feedbackStatus = document.getElementById("feedback-message-status");

  const orderForm = document.getElementById("custom-order-form");
  const orderStatus = document.getElementById("order-message-status");

  if (feedbackForm && feedbackStatus) {
    feedbackForm.addEventListener("submit", function (event) {
      event.preventDefault();
      clearFormErrors(feedbackForm);

      const nameInput = document.getElementById("feedback-name");
      const emailInput = document.getElementById("feedback-email");
      const messageInput = document.getElementById("feedback-message");

      if (!nameInput || !emailInput || !messageInput) return;

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const message = messageInput.value.trim();

      const errors = [];

      if (!name) {
        errors.push("Name is required.");
        nameInput.classList.add("error");
      }
      if (!email || !validateEmail(email)) {
        errors.push("A valid email address is required.");
        emailInput.classList.add("error");
      }
      if (!message) {
        errors.push("Message is required.");
        messageInput.classList.add("error");
      }

      if (errors.length > 0) {
        feedbackStatus.textContent = errors.join(" ");
        feedbackStatus.classList.remove("success");
        feedbackStatus.classList.add("error");
        return;
      }

      const entry = {
        name: name,
        email: email,
        message: message,
        submittedAt: new Date().toISOString()
      };

      const existing = loadArrayFromLocalStorage("bvn_feedback");
      existing.push(entry);
      localStorage.setItem("bvn_feedback", JSON.stringify(existing));

      feedbackForm.reset();
      feedbackStatus.textContent = "Thank you for your feedback. We appreciate you taking the time to share your experience.";
      feedbackStatus.classList.remove("error");
      feedbackStatus.classList.add("success");
    });
  }

  if (orderForm && orderStatus) {
    orderForm.addEventListener("submit", function (event) {
      event.preventDefault();
      clearFormErrors(orderForm);

      const nameInput = document.getElementById("order-name");
      const emailInput = document.getElementById("order-email");
      const phoneInput = document.getElementById("order-phone");
      const detailsInput = document.getElementById("order-details");

      if (!nameInput || !emailInput || !phoneInput || !detailsInput) return;

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const phone = phoneInput.value.trim();
      const details = detailsInput.value.trim();

      const errors = [];

      if (!name) {
        errors.push("Name is required.");
        nameInput.classList.add("error");
      }
      if (!email || !validateEmail(email)) {
        errors.push("A valid email address is required.");
        emailInput.classList.add("error");
      }
      if (!phone) {
        errors.push("Phone number is required.");
        phoneInput.classList.add("error");
      }
      if (!details) {
        errors.push("Please share details about your custom order.");
        detailsInput.classList.add("error");
      }

      if (errors.length > 0) {
        orderStatus.textContent = errors.join(" ");
        orderStatus.classList.remove("success");
        orderStatus.classList.add("error");
        return;
      }

      const entry = {
        name: name,
        email: email,
        phone: phone,
        details: details,
        submittedAt: new Date().toISOString()
      };

      const existing = loadArrayFromLocalStorage("bvn_customOrders");
      existing.push(entry);
      localStorage.setItem("bvn_customOrders", JSON.stringify(existing));

      orderForm.reset();
      orderStatus.textContent = "Thank you for your custom order request. We will reach out within 1–2 business days to confirm details.";
      orderStatus.classList.remove("error");
      orderStatus.classList.add("success");
    });
  }
}

/**
 * Validates a basic email pattern.
 */
function validateEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

/**
 * Clears validation error styles from all inputs and textareas
 * inside the provided form element.
 */
function clearFormErrors(form) {
  const inputs = form.querySelectorAll("input, textarea");
  inputs.forEach(function (input) {
    input.classList.remove("error");
  });
}

/**
 * Loads an array from localStorage, safely handling parse failures.
 */
function loadArrayFromLocalStorage(key) {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (e) {
    console.error("Error parsing array from localStorage for key:", key, e);
    return [];
  }
}

/**
 * Formats a number as a currency string.
 */
function formatCurrency(value) {
  return "$" + value.toFixed(2);
}

