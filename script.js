const products = [
  {
    id: 1,
    name: "Cheeseburger",
    price: 59.0,
    category: "Food",
    img: "assets/images/cheeseburger.jpg",
  },
  {
    id: 2,
    name: "Fries",
    price: 39.0,
    category: "Snack",
    img: "assets/images/fries.jpg",
  },
  {
    id: 3,
    name: "Burgersteak",
    price: 69.0,
    category: "Meal",
    img: "assets/images/burgersteak.jpg",
  },
  {
    id: 4,
    name: "Chicken w/ Rice",
    price: 89.0,
    category: "Meal",
    img: "assets/images/chickenwithrice.jpg",
  },
  {
    id: 5,
    name: "Ramen",
    price: 120.0,
    category: "Meal",
    img: "assets/images/ramen.jpg",
  },
  {
    id: 6,
    name: "Mountain Dew",
    price: 25.0,
    category: "Drink",
    img: "assets/images/mountaindew.jpg",
  },
];

let cart = [];

function renderProducts() {
  const productList = document.getElementById("productList");
  if (!productList) return;
  productList.innerHTML = "";

  products.forEach((product) => {
    const card = `
            <div class="col">
                <div class="pro-card h-100" onclick="addToCart(${product.id})">
                    <div class="pro-img">
                        <img src="${product.img}" alt="${product.name}" onerror="this.src='https://placehold.co/400x300?text=No+Image'">
                    </div>
                    <div class="p-3">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="fw-bold m-0 text-dark">${product.name}</h6>
                            <span class="badge bg-light text-secondary border rounded-pill" style="font-size:0.7rem">${product.category}</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <span class="text-primary fw-bold">₱${product.price.toFixed(2)}</span>
                            <div class="add-btn"><span>+</span></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    productList.innerHTML += card;
  });
}

function addToCart(id) {
  const product = products.find((p) => p.id === id);
  const existingItem = cart.find((item) => item.id === id);
  if (existingItem) {
    existingItem.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  updateCartUI();
}

function updateQty(id, change) {
  const item = cart.find((item) => item.id === id);
  if (item) {
    item.qty += change;
    if (item.qty <= 0) {
      removeFromCart(id);
    } else {
      updateCartUI();
    }
  }
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  updateCartUI();
}

function clearCart() {
  cart = [];
  updateCartUI();
}

function updateCartUI() {
  const cartContainer = document.getElementById("cartContainer");
  const emptyMsg = document.getElementById("emptyCartMessage");

  if (cart.length === 0) {
    cartContainer.innerHTML = "";
    cartContainer.appendChild(emptyMsg);
    emptyMsg.style.display = "block";
  } else {
    cartContainer.innerHTML = "";
    cart.forEach((item) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "cart-item";
      itemDiv.innerHTML = `
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <span class="fw-bold text-dark small">${item.name}</span>
                    <span class="fw-bold text-dark small">₱${(item.price * item.qty).toFixed(2)}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="qty-pill">
                        <button class="qty-action" onclick="updateQty(${item.id}, -1)">-</button>
                        <span class="px-2 small fw-bold">${item.qty}</span>
                        <button class="qty-action" onclick="updateQty(${item.id}, 1)">+</button>
                    </div>
                    <small class="text-danger fw-bold" style="cursor:pointer; font-size:0.7rem;" onclick="removeFromCart(${item.id})">REMOVE</small>
                </div>
            `;
      cartContainer.appendChild(itemDiv);
    });
  }

  // CALCULATIONS
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  let discount = 0;
  if (subtotal >= 1000) discount = subtotal * 0.1;

  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * 0.12;

  let shipping = 0;
  const deliveryMethod = document.getElementById("deliveryOption")
    ? document.getElementById("deliveryOption").value
    : "Pickup";

  if (deliveryMethod === "Delivery" && subtotal > 0) {
    if (subtotal < 500) {
      shipping = 80;
    } else {
      shipping = 0; // Free shipping
    }
  }

  const grandTotal = subtotal - discount + tax + shipping;

  document.getElementById("subtotal").innerText = `₱${subtotal.toFixed(2)}`;
  document.getElementById("discount").innerText = `-₱${discount.toFixed(2)}`;
  document.getElementById("tax").innerText = `₱${tax.toFixed(2)}`;

  const shippingEl = document.getElementById("shipping");
  if (shippingEl) {
    if (deliveryMethod === "Pickup") {
      shippingEl.innerText = "Pickup";
    } else {
      shippingEl.innerText =
        shipping === 0 ? "Free" : `₱${shipping.toFixed(2)}`;
    }
  }

  document.getElementById("grandTotal").innerText = `₱${grandTotal.toFixed(2)}`;

  return { subtotal, discount, tax, shipping, grandTotal };
}

function toggleAddress(isDelivery) {
  const addressDiv = document.getElementById("addressFieldDiv");
  const addressInput = document.getElementById("address");
  if (isDelivery) {
    addressDiv.classList.remove("d-none");
    addressInput.setAttribute("required", "true");
  } else {
    addressDiv.classList.add("d-none");
    addressInput.removeAttribute("required");
    addressInput.value = "";
  }
  updateCartUI();
}

document
  .getElementById("checkoutForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    if (!this.checkValidity()) {
      event.stopPropagation();
      this.classList.add("was-validated");
      return;
    }
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    generateReceipt();
  });

function generateReceipt() {
  const totals = updateCartUI();
  const orderId = "ORD-" + Math.floor(Math.random() * 1000000);
  const date = new Date().toLocaleString();
  const name = document.getElementById("fullName").value;
  const payment = document.getElementById("paymentMethod").value;

  let itemsHtml = "";
  cart.forEach((item) => {
    itemsHtml += `
            <div class="d-flex justify-content-between border-bottom py-2">
                <span>${item.name} <small class="text-muted">(x${item.qty})</small></span>
                <span class="fw-bold">₱${(item.price * item.qty).toFixed(2)}</span>
            </div>
        `;
  });

  const receiptContent = `
        <div class="text-center mb-4">
            <h5 class="fw-bold text-primary">JoshPanda Receipt</h5>
            <p class="text-muted small">Thank you for ordering!</p>
        </div>
        <div class="bg-white border p-3 rounded mb-3">
            <p class="mb-1 small"><strong>Order ID:</strong> ${orderId}</p>
            <p class="mb-1 small"><strong>Date:</strong> ${date}</p>
            <p class="mb-1 small"><strong>Customer:</strong> ${name}</p>
            <p class="mb-0 small"><strong>Payment:</strong> ${payment}</p>
        </div>
        <div class="mb-3 small">
            ${itemsHtml}
        </div>
        <div class="d-flex justify-content-between small"><span>Subtotal:</span> <span>₱${totals.subtotal.toFixed(2)}</span></div>
        <div class="d-flex justify-content-between text-success small"><span>Discount:</span> <span>-₱${totals.discount.toFixed(2)}</span></div>
        <div class="d-flex justify-content-between small"><span>VAT (12%):</span> <span>₱${totals.tax.toFixed(2)}</span></div>
        <div class="d-flex justify-content-between text-primary small"><span>Shipping:</span> <span>${totals.shipping === 0 ? "Free" : "₱" + totals.shipping.toFixed(2)}</span></div>
        <hr>
        <div class="d-flex justify-content-between fw-bold fs-5 text-dark">
            <span>TOTAL:</span> <span>₱${totals.grandTotal.toFixed(2)}</span>
        </div>
    `;

  document.getElementById("receiptBody").innerHTML = receiptContent;
  const modal = new bootstrap.Modal(document.getElementById("receiptModal"));
  modal.show();
}

window.onload = function () {
  renderProducts();
};
