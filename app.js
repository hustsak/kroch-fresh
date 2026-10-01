/**
 * ក្រូចស្រុកយើង - Cambodian Fresh Fruit E-Commerce Store Logic
 * Phone & Telegram: 0963508320
 * Products: ក្រូចតែជ្រក់ (4,000 ៛ / 1kg) & ក្រូចថ្លុង (5,000 ៛ / 1ផ្លែ)
 */

// ==========================================================================
// 1. PRODUCT DATA CONFIGURATION (KHMER RIEL PRICES)
// ==========================================================================
const DEFAULT_CONFIG = {
  shopName: "ក្រូចស្រុកយើង",
  phone: "0963508320",
  telegram: "0963508320",
  telegramLink: "https://t.me/+855963508320",
  exchangeRate: 4000, // 1 USD = 4,000 KHR
  products: [
    {
      id: "orange",
      name: "ក្រូចតែជ្រក់",
      description: "ក្រូចស្រស់ពីចម្ការ រសជាតិផ្អែមឆ្ងាញ់ធម្មជាតិ",
      price: 4000, // KHR per 1kg
      unit: "kg",
      unitLabel: "1kg",
      image: "images/orange.jpg",
      weights: [1, 2, 5],
      inStock: true
    },
    {
      id: "pomelo",
      name: "ក្រូចថ្លុង",
      description: "ក្រូចថ្លុងស្រស់ រសជាតិឆ្ងាញ់ បេះថ្មីៗពីដើម",
      price: 5000, // KHR per 1ផ្លែ
      unit: "ផ្លែ",
      unitLabel: "1ផ្លែ",
      image: "4.jpg",
      weights: [1, 2, 5],
      inStock: true
    }
  ],
  mapsLink: "https://maps.app.goo.gl/CKua7u4Khgq8hTqt7"
};

// Load saved config or default
let SHOP_CONFIG = JSON.parse(localStorage.getItem("krouch_shop_config")) || DEFAULT_CONFIG;

// Ensure prices are updated to Khmer Riel even if user had older USD data in localStorage
if (!SHOP_CONFIG.products || !SHOP_CONFIG.products[0] || SHOP_CONFIG.products[0].price < 100) {
  SHOP_CONFIG = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
} else {
  // Ensure product units and labels match specifications
  SHOP_CONFIG.products[0].unit = "kg";
  SHOP_CONFIG.products[0].unitLabel = "1kg";
  if (!SHOP_CONFIG.products[0].price || SHOP_CONFIG.products[0].price < 100) {
    SHOP_CONFIG.products[0].price = 4000;
  }
  if (SHOP_CONFIG.products[1]) {
    SHOP_CONFIG.products[1].unit = "ផ្លែ";
    SHOP_CONFIG.products[1].unitLabel = "1ផ្លែ";
    if (!SHOP_CONFIG.products[1].price || SHOP_CONFIG.products[1].price < 100) {
      SHOP_CONFIG.products[1].price = 5000;
    }
    SHOP_CONFIG.products[1].image = "4.jpg";
  }
}
SHOP_CONFIG.mapsLink = "https://maps.app.goo.gl/CKua7u4Khgq8hTqt7";
saveConfig();

// Cart State
let cart = JSON.parse(localStorage.getItem("krouch_cart")) || [];
let cartNeedsSave = false;
cart = cart.map(item => {
  if (item.productId === "pomelo") {
    item.image = "4.jpg";
    if (!item.unitPrice || item.unitPrice < 100) {
      item.unitPrice = 5000 * (item.weightOption || 1);
      item.weightLabel = `${item.weightOption || 1} ផ្លែ`;
      cartNeedsSave = true;
    }
  } else if (item.productId === "orange") {
    if (!item.unitPrice || item.unitPrice < 100) {
      item.unitPrice = 4000 * (item.weightOption || 1);
      item.weightLabel = `${item.weightOption || 1}kg`;
      cartNeedsSave = true;
    }
  }
  return item;
});
if (cartNeedsSave) {
  localStorage.setItem("krouch_cart", JSON.stringify(cart));
}

// Save state helpers
function saveCart() {
  localStorage.setItem("krouch_cart", JSON.stringify(cart));
  renderCart();
  updateCartBadge();
}

function saveConfig() {
  localStorage.setItem("krouch_shop_config", JSON.stringify(SHOP_CONFIG));
}

// Format currency
function formatKHR(amountRiel) {
  const riel = Math.round(Number(amountRiel) || 0);
  return `${riel.toLocaleString("en-US")} ៛`;
}

function formatUSD(amountRiel) {
  const usd = (Number(amountRiel) || 0) / (SHOP_CONFIG.exchangeRate || 4000);
  return `$${usd.toFixed(2)}`;
}

// Show toast alert
function showToast(message, icon = "✅") {
  const toast = document.getElementById("toastAlert");
  if (!toast) return;
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

// ==========================================================================
// 2. PRODUCT CARDS INTERACTION
// ==========================================================================
function setupProductCards() {
  SHOP_CONFIG.products.forEach(product => {
    // Sync price display
    const priceDisplay = document.getElementById(`price-${product.id}`);
    if (priceDisplay) {
      const uLabel = product.id === "pomelo" ? "1ផ្លែ" : "1kg";
      priceDisplay.textContent = `${formatKHR(product.price)} / ${uLabel}`;
    }

    // Weight/quantity selection chips
    const chipContainer = document.getElementById(`weights-${product.id}`);
    if (chipContainer) {
      chipContainer.querySelectorAll(".weight-chip").forEach(chip => {
        chip.addEventListener("click", () => {
          chipContainer.querySelectorAll(".weight-chip").forEach(c => c.classList.remove("active"));
          chip.classList.add("active");
        });
      });
    }

    // Quantity buttons
    const minusBtn = document.getElementById(`minus-${product.id}`);
    const plusBtn = document.getElementById(`plus-${product.id}`);
    const qtyInput = document.getElementById(`qty-${product.id}`);

    if (minusBtn && plusBtn && qtyInput) {
      minusBtn.onclick = () => {
        let val = parseInt(qtyInput.value) || 1;
        if (val > 1) qtyInput.value = val - 1;
      };

      plusBtn.onclick = () => {
        let val = parseInt(qtyInput.value) || 1;
        qtyInput.value = val + 1;
      };
    }

    // Add to cart button
    const addBtn = document.getElementById(`add-${product.id}`);
    if (addBtn) {
      addBtn.onclick = () => {
        const qty = parseInt(qtyInput ? qtyInput.value : 1) || 1;
        let selectedWeight = 1;
        const activeChip = chipContainer ? chipContainer.querySelector(".weight-chip.active") : null;
        if (activeChip) {
          selectedWeight = parseInt(activeChip.dataset.weight) || 1;
        }

        addToCart(product.id, qty, selectedWeight);
      };
    }
  });
}

// ==========================================================================
// 3. CART ACTIONS
// ==========================================================================
function addToCart(productId, quantity, weightMultiplier = 1) {
  const product = SHOP_CONFIG.products.find(p => p.id === productId);
  if (!product) return;

  const itemKey = `${productId}-${weightMultiplier}`;
  const existingIndex = cart.findIndex(item => item.itemKey === itemKey);

  const unitText = product.id === "pomelo" ? "ផ្លែ" : "kg";
  const weightLabel = `${weightMultiplier} ${unitText}`;

  if (existingIndex > -1) {
    cart[existingIndex].qty += quantity;
  } else {
    cart.push({
      itemKey: itemKey,
      productId: product.id,
      name: product.name,
      weightOption: weightMultiplier,
      weightLabel: weightLabel,
      unitPrice: product.price * weightMultiplier,
      qty: quantity,
      image: product.image
    });
  }

  saveCart();
  updateLiveOrderPreview();
  showToast(`បានបន្ថែម "${product.name} (${weightLabel})" ទៅកន្ត្រក!`, "🛒");
}

function updateCartItemQty(itemKey, delta) {
  const index = cart.findIndex(item => item.itemKey === itemKey);
  if (index === -1) return;

  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  saveCart();
  updateLiveOrderPreview();
}

function removeCartItem(itemKey) {
  const index = cart.findIndex(item => item.itemKey === itemKey);
  if (index > -1) {
    const itemName = cart[index].name;
    cart.splice(index, 1);
    saveCart();
    updateLiveOrderPreview();
    showToast(`បានលុប "${itemName}" ចេញពីកន្ត្រក`, "🗑️");
  }
}

function calculateCartTotal() {
  return cart.reduce((total, item) => total + (item.unitPrice * item.qty), 0);
}

function updateCartBadge() {
  const count = cart.reduce((total, item) => total + item.qty, 0);
  const badges = document.querySelectorAll(".cart-badge");
  badges.forEach(badge => {
    badge.textContent = count;
  });

  const cartHeaderCount = document.getElementById("cartCountHeader");
  if (cartHeaderCount) {
    cartHeaderCount.textContent = `${count} មុខ`;
  }

  const mobileCartHeaderCount = document.getElementById("mobileCartCountHeader");
  if (mobileCartHeaderCount) {
    mobileCartHeaderCount.textContent = `${count}`;
  }
}

function renderCart() {
  const cartList = document.getElementById("cartItemsList");
  const mobileCartList = document.getElementById("mobileCartItemsList");
  const cartTotalVal = document.getElementById("cartTotalValue");
  const cartTotalRiel = document.getElementById("cartTotalRiel");
  const mobileCartTotalVal = document.getElementById("mobileCartTotalValue");
  const mobileCartTotalRiel = document.getElementById("mobileCartTotalRiel");
  const btnCheckout = document.getElementById("btnCheckoutCart");
  const btnMobileCheckout = document.getElementById("btnMobileCheckoutCart");

  const total = calculateCartTotal();
  const formattedKHR = formatKHR(total);
  const formattedUSD = `(~${formatUSD(total)})`;

  if (cart.length === 0) {
    const emptyHtml = `
      <div class="cart-empty-state">
        <div class="cart-empty-icon">🛒</div>
        <p>កន្ត្រកទំនិញនៅទទេ</p>
        <span style="font-size: 13px; color: #889a8f;">សូមជ្រើសរើសផ្លែឈើស្រស់ៗខាងលើ</span>
      </div>
    `;
    if (cartList) cartList.innerHTML = emptyHtml;
    if (mobileCartList) mobileCartList.innerHTML = emptyHtml;
    if (cartTotalVal) cartTotalVal.textContent = "0 ៛";
    if (cartTotalRiel) cartTotalRiel.textContent = "($0.00)";
    if (mobileCartTotalVal) mobileCartTotalVal.textContent = "0 ៛";
    if (mobileCartTotalRiel) mobileCartTotalRiel.textContent = "($0.00)";
    if (btnCheckout) btnCheckout.style.opacity = "0.6";
    if (btnMobileCheckout) btnMobileCheckout.style.opacity = "0.6";
    updateLiveOrderPreview();
    return;
  }

  if (btnCheckout) btnCheckout.style.opacity = "1";
  if (btnMobileCheckout) btnMobileCheckout.style.opacity = "1";

  const itemsHtml = cart.map(item => {
    const itemSubtotal = item.unitPrice * item.qty;
    return `
      <div class="cart-item" data-key="${item.itemKey}">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-weight">ទំហំ/ចំនួន: ${item.weightLabel}</div>
          <div class="cart-item-price">${formatKHR(item.unitPrice)} ${item.qty > 1 ? `<span style="font-size: 12px; color: #888;">(សរុប ${formatKHR(itemSubtotal)})</span>` : ""}</div>
        </div>
        <div class="cart-item-actions">
          <button class="cart-item-remove" onclick="removeCartItem('${item.itemKey}')" title="លុបចោល">
            ✕
          </button>
          <div class="cart-item-qty">
            <button class="cart-mini-btn" onclick="updateCartItemQty('${item.itemKey}', -1)">−</button>
            <span class="cart-mini-qty">${item.qty}</span>
            <button class="cart-mini-btn" onclick="updateCartItemQty('${item.itemKey}', 1)">+</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  if (cartList) cartList.innerHTML = itemsHtml;
  if (mobileCartList) mobileCartList.innerHTML = itemsHtml;

  if (cartTotalVal) cartTotalVal.textContent = formattedKHR;
  if (cartTotalRiel) cartTotalRiel.textContent = formattedUSD;
  if (mobileCartTotalVal) mobileCartTotalVal.textContent = formattedKHR;
  if (mobileCartTotalRiel) mobileCartTotalRiel.textContent = formattedUSD;

  updateLiveOrderPreview();
}

// Checkout button handler in cart
function setupCartCheckout() {
  function handleCheckout() {
    if (cart.length === 0) {
      showToast("សូមបន្ថែមផ្លែឈើទៅក្នុងកន្ត្រកជាមុនសិន!", "⚠️");
      return;
    }

    // Close mobile cart sheet if open
    closeMobileCart();

    // Scroll to order form
    const orderSection = document.getElementById("order");
    if (orderSection) {
      orderSection.scrollIntoView({ behavior: "smooth" });
    }

    // Pre-populate order form based on cart
    const productSelect = document.getElementById("orderProduct");
    const qtyInput = document.getElementById("orderQuantity");
    const unitSelect = document.getElementById("orderUnit");

    if (productSelect) {
      if (cart.length === 1) {
        if (cart[0].productId === "orange") {
          productSelect.value = "ក្រូចតែជ្រក់";
          if (unitSelect) unitSelect.value = "kg";
        } else {
          productSelect.value = "ក្រូចថ្លុង";
          if (unitSelect) unitSelect.value = "ផ្លែ";
        }
      } else {
        productSelect.value = "ទាំងពីរមុខ (ក្រូចតែជ្រក់ និង ក្រូចថ្លុង)";
        if (unitSelect) unitSelect.value = "ឈុត";
      }
    }

    if (qtyInput) {
      const totalUnits = cart.reduce((acc, it) => acc + (it.weightOption * it.qty), 0);
      qtyInput.value = totalUnits > 10 ? "10" : totalUnits.toString();
    }

    updateLiveOrderPreview();
    showToast("បានបំពេញទំនិញក្នុងទម្រង់បញ្ជាទិញរួចរាល់!", "📋");
  }

  const btnCheckout = document.getElementById("btnCheckoutCart");
  if (btnCheckout) btnCheckout.addEventListener("click", handleCheckout);

  const btnMobileCheckout = document.getElementById("btnMobileCheckoutCart");
  if (btnMobileCheckout) btnMobileCheckout.addEventListener("click", handleCheckout);
}

// Mobile Cart Sheet controls
function openMobileCart() {
  const sheet = document.getElementById("mobileCartSheet");
  const backdrop = document.getElementById("mobileCartBackdrop");
  if (sheet) sheet.classList.add("open");
  if (backdrop) backdrop.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeMobileCart() {
  const sheet = document.getElementById("mobileCartSheet");
  const backdrop = document.getElementById("mobileCartBackdrop");
  if (sheet) sheet.classList.remove("open");
  if (backdrop) backdrop.classList.remove("show");
  document.body.style.overflow = "";
}

function setupMobileCartSheet() {
  const trigger = document.getElementById("mobileCartTrigger");
  const closeBtn = document.getElementById("closeMobileCartBtn");
  const backdrop = document.getElementById("mobileCartBackdrop");

  if (trigger) trigger.addEventListener("click", openMobileCart);
  if (closeBtn) closeBtn.addEventListener("click", closeMobileCart);
  if (backdrop) backdrop.addEventListener("click", closeMobileCart);

  // Drag handle touch down to close
  const handle = document.getElementById("sheetDragHandle");
  if (handle) {
    let startY = 0;
    handle.addEventListener("touchstart", (e) => {
      startY = e.touches[0].clientY;
    });
    handle.addEventListener("touchmove", (e) => {
      let currentY = e.touches[0].clientY;
      if (currentY - startY > 40) {
        closeMobileCart();
      }
    });
  }
}

// ==========================================================================
// 4. ORDER CALCULATION & TELEGRAM DISPATCH
// ==========================================================================

/**
 * Calculates current order items, unit prices, and accurate totals.
 * Prioritizes cart items if present; otherwise calculates accurately
 * based on selected product, quantity, and unit from the order form.
 */
function calculateCurrentOrderDetails() {
  const pOrange = SHOP_CONFIG.products[0]?.price || 4000;
  const pPomelo = SHOP_CONFIG.products[1]?.price || 5000;

  // 1. If cart has items, use cart items as exact calculation
  if (cart.length > 0) {
    const cartTotal = calculateCartTotal();
    const itemsDescription = cart.map(i => `• ${i.name} (${i.weightLabel}) x ${i.qty} = ${formatKHR(i.unitPrice * i.qty)}`).join("\n");
    const summaryText = cart.map(i => `${i.name} (${i.weightLabel}) x ${i.qty}`).join(", ");
    return {
      source: "cart",
      items: cart,
      totalKHR: cartTotal,
      formattedKHR: formatKHR(cartTotal),
      formattedUSD: formatUSD(cartTotal),
      description: itemsDescription,
      summaryText: summaryText
    };
  }

  // 2. Otherwise calculate directly from order form controls
  const productSelect = document.getElementById("orderProduct");
  const qtySelect = document.getElementById("orderQuantity");
  const unitSelect = document.getElementById("orderUnit");

  const productVal = productSelect ? productSelect.value : "ក្រូចតែជ្រក់";
  const qtyVal = parseInt(qtySelect ? qtySelect.value : 1) || 1;
  const unitVal = unitSelect ? unitSelect.value : "kg";

  let totalKHR = 0;
  let description = "";
  let summaryText = "";

  if (productVal.includes("ក្រូចតែជ្រក់") && !productVal.includes("ទាំងពីរមុខ")) {
    totalKHR = pOrange * qtyVal;
    description = `• ក្រូចតែជ្រក់: ${qtyVal} ${unitVal} x ${formatKHR(pOrange)} = ${formatKHR(totalKHR)}`;
    summaryText = `ក្រូចតែជ្រក់ ${qtyVal} ${unitVal} x ${formatKHR(pOrange)}`;
  } else if (productVal.includes("ក្រូចថ្លុង") && !productVal.includes("ទាំងពីរមុខ")) {
    totalKHR = pPomelo * qtyVal;
    description = `• ក្រូចថ្លុង: ${qtyVal} ${unitVal} x ${formatKHR(pPomelo)} = ${formatKHR(totalKHR)}`;
    summaryText = `ក្រូចថ្លុង ${qtyVal} ${unitVal} x ${formatKHR(pPomelo)}`;
  } else {
    // ទាំងពីរមុខ combo: 1kg ក្រូចតែជ្រក់ (4000) + 1ផ្លែ ក្រូចថ្លុង (5000) = 9000 ៛ per set
    const comboPrice = pOrange + pPomelo;
    totalKHR = comboPrice * qtyVal;
    description = `• ក្រូចតែជ្រក់: ${qtyVal} kg x ${formatKHR(pOrange)} = ${formatKHR(pOrange * qtyVal)}\n` +
                  `• ក្រូចថ្លុង: ${qtyVal} ផ្លែ x ${formatKHR(pPomelo)} = ${formatKHR(pPomelo * qtyVal)}`;
    summaryText = `ទាំងពីរមុខ (${qtyVal} ឈុត: ក្រូចតែជ្រក់ ${qtyVal}kg + ក្រូចថ្លុង ${qtyVal}ផ្លែ)`;
  }

  return {
    source: "form",
    product: productVal,
    quantity: qtyVal,
    unit: unitVal,
    totalKHR: totalKHR,
    formattedKHR: formatKHR(totalKHR),
    formattedUSD: formatUSD(totalKHR),
    description: description,
    summaryText: summaryText
  };
}

/**
 * Updates the live price preview box in the order form
 */
function updateLiveOrderPreview() {
  const priceElem = document.getElementById("orderCalculatedPrice");
  const subtextElem = document.getElementById("orderCalculatedSubtext");
  if (!priceElem || !subtextElem) return;

  const order = calculateCurrentOrderDetails();
  priceElem.textContent = order.formattedKHR;

  if (order.source === "cart") {
    subtextElem.textContent = `ទំនិញក្នុងកន្ត្រក (${cart.length} មុខ): ${order.summaryText} (~${order.formattedUSD})`;
  } else {
    subtextElem.textContent = `${order.summaryText} (~${order.formattedUSD})`;
  }
}

function setupOrderForm() {
  const form = document.getElementById("orderForm");
  const btnTelegram = document.getElementById("btnTelegramDirect");
  const productSelect = document.getElementById("orderProduct");
  const qtySelect = document.getElementById("orderQuantity");
  const unitSelect = document.getElementById("orderUnit");

  // Sync unit dropdown automatically based on product
  if (productSelect && unitSelect) {
    productSelect.addEventListener("change", () => {
      if (productSelect.value.includes("ក្រូចតែជ្រក់") && !productSelect.value.includes("ទាំងពីរមុខ")) {
        unitSelect.value = "kg";
      } else if (productSelect.value.includes("ក្រូចថ្លុង") && !productSelect.value.includes("ទាំងពីរមុខ")) {
        unitSelect.value = "ផ្លែ";
      } else {
        unitSelect.value = "ឈុត";
      }
      updateLiveOrderPreview();
    });
  }

  if (qtySelect) {
    qtySelect.addEventListener("change", updateLiveOrderPreview);
  }
  if (unitSelect) {
    unitSelect.addEventListener("change", updateLiveOrderPreview);
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("orderName").value.trim();
      const phone = document.getElementById("orderPhone").value.trim();
      const product = document.getElementById("orderProduct").value;
      const quantity = document.getElementById("orderQuantity").value;
      const unit = document.getElementById("orderUnit").value;
      const address = document.getElementById("orderAddress").value.trim();
      const note = document.getElementById("orderNote").value.trim();

      if (!name || !phone || !address) {
        showToast("សូមបំពេញព័ត៌មានចាំបាច់ (*) ឱ្យបានត្រឹមត្រូវ!", "⚠️");
        return;
      }

      // Calculate accurate order details
      const orderDetails = calculateCurrentOrderDetails();

      // Show confirmation modal
      showConfirmationModal({
        name,
        phone,
        product: orderDetails.source === "cart" ? orderDetails.summaryText : `${product} (${quantity} ${unit})`,
        quantity,
        unit,
        address,
        note,
        totalKHR: orderDetails.formattedKHR,
        totalUSD: orderDetails.formattedUSD
      });
    });
  }

  if (btnTelegram) {
    btnTelegram.addEventListener("click", () => {
      sendTelegramOrder();
    });
  }
}

/**
 * Builds accurate order message and launches Telegram
 */
function sendTelegramOrder() {
  const nameInput = document.getElementById("orderName");
  const phoneInput = document.getElementById("orderPhone");
  const addressInput = document.getElementById("orderAddress");
  const noteInput = document.getElementById("orderNote");

  const name = nameInput ? nameInput.value.trim() : "";
  const phone = phoneInput ? phoneInput.value.trim() : "";
  const address = addressInput ? addressInput.value.trim() : "";
  const note = noteInput ? noteInput.value.trim() : "";

  // Accurate calculation of all items and total
  const orderDetails = calculateCurrentOrderDetails();

  let messageText = `🍊 បញ្ជាទិញផ្លែឈើស្រស់ពី "ក្រូចស្រុកយើង"\n`;
  messageText += `═══════════════════════\n`;
  messageText += `👤 អតិថិជន: ${name || "អតិថិជន Telegram"}\n`;
  messageText += `📞 លេខទូរស័ព្ទ: ${phone || "សូមទាក់ទងតាម Telegram នេះ"}\n`;
  messageText += `📍 ទីតាំងដឹកជញ្ជូន: ${address || "ភ្នំពេញ / ខេត្ត (សូមប្រាប់ទីតាំងជាក់ស្តែង)"}\n`;
  if (note) {
    messageText += `📝 ចំណាំបន្ថែម: ${note}\n`;
  }

  messageText += `═══════════════════════\n`;
  messageText += `📋 បញ្ជីទំនិញកុម្ម៉ង់:\n`;
  if (orderDetails.source === "cart") {
    messageText += orderDetails.items.map(i => `• ${i.name} (${i.weightLabel}) x ${i.qty} = ${formatKHR(i.unitPrice * i.qty)}`).join("\n");
  } else {
    messageText += orderDetails.description;
  }

  messageText += `\n═══════════════════════\n`;
  messageText += `💰 តម្លៃសរុប: ${orderDetails.formattedKHR} (~${orderDetails.formattedUSD})\n`;
  messageText += `🚚 សេវាដឹក: គិតតាមចម្ងាយទីតាំងជាក់ស្តែង\n`;
  messageText += `✨ គុណភាព: ស្រស់ធម្មជាតិ ១០០% បេះថ្មីៗពីដើម\n`;
  messageText += `🙏 សូមអរគុណបង!`;

  const encoded = encodeURIComponent(messageText);
  window.open(`https://t.me/+855963508320?text=${encoded}`, "_blank");
}

function showConfirmationModal(details) {
  const modal = document.getElementById("orderModal");
  if (!modal) return;

  document.getElementById("modalCustomerName").textContent = details.name;
  document.getElementById("modalPhone").textContent = details.phone;
  document.getElementById("modalProduct").textContent = details.product;
  document.getElementById("modalAddress").textContent = details.address;
  document.getElementById("modalTotal").textContent = `${details.totalKHR} (~${details.totalUSD})`;

  modal.classList.add("show");

  // Hook telegram button in modal
  const btnModalTelegram = document.getElementById("btnModalTelegram");
  if (btnModalTelegram) {
    btnModalTelegram.onclick = () => {
      sendTelegramOrder();
    };
  }
}

function closeModal() {
  const modal = document.getElementById("orderModal");
  if (modal) modal.classList.remove("show");
  
  // Clear cart after confirmed order
  cart = [];
  saveCart();
  const form = document.getElementById("orderForm");
  if (form) form.reset();
  updateLiveOrderPreview();
  showToast("អរគុណសម្រាប់ការបញ្ជាទិញ!", "🎉");
}

// ==========================================================================
// 5. MOBILE DRAWER & NAVIGATION
// ==========================================================================
function setupNavigation() {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const mobileDrawer = document.getElementById("mobileDrawer");
  const drawerClose = document.getElementById("drawerClose");
  const drawerBackdrop = document.getElementById("drawerBackdrop");

  function openDrawer() {
    mobileDrawer.classList.add("open");
    drawerBackdrop.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    mobileDrawer.classList.remove("open");
    drawerBackdrop.classList.remove("show");
    document.body.style.overflow = "";
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener("click", openDrawer);
  if (drawerClose) drawerClose.addEventListener("click", closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener("click", closeDrawer);

  // Close drawer on link click
  document.querySelectorAll(".mobile-links a").forEach(link => {
    link.addEventListener("click", closeDrawer);
  });

  // Carousel dots interaction
  const dots = document.querySelectorAll(".hero-dots .dot");
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      dots.forEach(d => d.classList.remove("active"));
      dot.classList.add("active");
    });
  });
}

// ==========================================================================
// 6. PRICE MANAGER MODAL (STORE OWNER TOOL - IN KHMER RIEL)
// ==========================================================================
function setupPriceManager() {
  const trigger = document.getElementById("priceEditTrigger");
  const modal = document.getElementById("priceEditModal");
  const closeBtn = document.getElementById("closePriceModal");
  const saveBtn = document.getElementById("savePriceBtn");

  if (!trigger || !modal) return;

  trigger.addEventListener("click", () => {
    document.getElementById("inputPriceOrange").value = SHOP_CONFIG.products[0].price;
    document.getElementById("inputPricePomelo").value = SHOP_CONFIG.products[1].price;
    modal.classList.add("show");
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => modal.classList.remove("show"));
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const pOrange = parseInt(document.getElementById("inputPriceOrange").value);
      const pPomelo = parseInt(document.getElementById("inputPricePomelo").value);

      if (!isNaN(pOrange) && pOrange > 0) SHOP_CONFIG.products[0].price = pOrange;
      if (!isNaN(pPomelo) && pPomelo > 0) SHOP_CONFIG.products[1].price = pPomelo;

      saveConfig();
      setupProductCards();
      renderCart();
      updateLiveOrderPreview();
      modal.classList.remove("show");
      showToast("បានកែប្រែតម្លៃផលិតផលដោយជោគជ័យ!", "💾");
    });
  }
}

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  setupProductCards();
  renderCart();
  updateCartBadge();
  setupCartCheckout();
  setupOrderForm();
  setupNavigation();
  setupPriceManager();
  setupMobileCartSheet();
  updateLiveOrderPreview();

  // Header cart icon click: on mobile open bottom sheet, on desktop scroll to cart panel
  const headerCartBtn = document.getElementById("headerCartBtn");
  if (headerCartBtn) {
    headerCartBtn.addEventListener("click", () => {
      if (window.innerWidth <= 1024) {
        openMobileCart();
      } else {
        const cartPanel = document.getElementById("cartPanel");
        if (cartPanel) {
          cartPanel.scrollIntoView({ behavior: "smooth", block: "center" });
          cartPanel.style.transform = "scale(1.02)";
          setTimeout(() => cartPanel.style.transform = "scale(1)", 400);
        }
      }
    });
  }

  // Active state update on bottom bar during scroll
  const sections = document.querySelectorAll("section[id]");
  const bottomBarItems = document.querySelectorAll(".bottom-bar-item[href]");
  window.addEventListener("scroll", () => {
    let scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute("id");

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        bottomBarItems.forEach(item => {
          if (item.getAttribute("href") === `#${sectionId}`) {
            item.classList.add("active");
          } else {
            item.classList.remove("active");
          }
        });
      }
    });
  });
});
