// Initialize cart array and DOM elements
let cart = [];
const cartCountEl = document.querySelector('.cart-count');
const cartItemsContainer = document.querySelector('.cart-items-container');
const totalPriceEl = document.querySelector('.total-price');
const checkoutTotalEl = document.getElementById('checkoutTotal');

// Modal & Form Elements
const paymentModal = document.getElementById('paymentModal');
const checkoutBtn = document.querySelector('.checkout-btn');
const closePaymentBtn = document.querySelector('.close-payment');
const confirmOrderBtn = document.getElementById('confirmOrderBtn');
const screenshotInput = document.getElementById('paymentScreenshot');

// Helper: Generate a random Order ID
function generateOrderID() {
    return 'ORD-' + Math.floor(100000 + Math.random() * 900000);
}

// Function to update Cart UI & totals
function updateCartUI() {
    if (!cartItemsContainer) return;
    
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty</p>';
        if (cartCountEl) cartCountEl.innerText = '0';
        if (totalPriceEl) totalPriceEl.innerText = '0';
        if (checkoutTotalEl) checkoutTotalEl.innerText = '0';
        return;
    }

    let total = 0;
    let totalCount = 0;

    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        totalCount += item.quantity;

        const cartBox = document.createElement('div');
        cartBox.classList.add('box');
        cartBox.innerHTML = `
            <img src="${item.image}" alt="">
            <div class="content">
                <h3>${item.name}</h3>
                <div class="price">₹${item.price} x ${item.quantity}</div>
            </div>
            <i class="fa fa-trash" onclick="window.removeFromCart(${index})"></i>
        `;
        cartItemsContainer.appendChild(cartBox);
    });

    if (cartCountEl) cartCountEl.innerText = totalCount;
    if (totalPriceEl) totalPriceEl.innerText = total;
    if (checkoutTotalEl) checkoutTotalEl.innerText = total;
}

// Function to remove item from cart
window.removeFromCart = function(index) {
    cart.splice(index, 1);
    updateCartUI();
};

// Add to Cart Event Listeners
document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const box = button.closest('.box');
        const name = box.getAttribute('data-name');
        const price = parseFloat(box.getAttribute('data-price'));
        const image = box.querySelector('img').getAttribute('src');

        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name, price, image, quantity: 1 });
        }

        updateCartUI();
        
        const shoppingCart = document.querySelector('.shopping-cart');
        if (shoppingCart) shoppingCart.classList.add('active');
    });
});

// Open Checkout Modal when clicking Checkout in Cart
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (cart.length === 0) {
            alert('Your cart is empty! Please add products before checking out.');
            return;
        }
        if (paymentModal) {
            paymentModal.classList.add('active');
        }
        const shoppingCart = document.querySelector('.shopping-cart');
        if (shoppingCart) shoppingCart.classList.remove('active');
    });
}

// Close Payment Modal
if (closePaymentBtn) {
    closePaymentBtn.addEventListener('click', () => {
        if (paymentModal) paymentModal.classList.remove('active');
    });
}

// Toggle payment sections based on selection
document.querySelectorAll('input[name="payment_method"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        const onlineSection = document.getElementById('onlineSection');
        const codSection = document.getElementById('codSection');
        if (e.target.value === 'online') {
            if (onlineSection) onlineSection.style.display = 'block';
            if (codSection) codSection.style.display = 'none';
        } else {
            if (onlineSection) onlineSection.style.display = 'none';
            if (codSection) codSection.style.display = 'block';
        }
    });
});

// Place Order & Process Checkout via PHP Backend
if (confirmOrderBtn) {
    confirmOrderBtn.addEventListener('click', async () => {
        const name = document.getElementById('cxName') ? document.getElementById('cxName').value.trim() : '';
        const phone = document.getElementById('cxPhone') ? document.getElementById('cxPhone').value.trim() : '';
        const email = document.getElementById('cxEmail') ? document.getElementById('cxEmail').value.trim() : '';
        const area = document.getElementById('cxArea') ? document.getElementById('cxArea').value.trim() : '';
        const house = document.getElementById('cxHouse') ? document.getElementById('cxHouse').value.trim() : '';
        const street = document.getElementById('cxStreet') ? document.getElementById('cxStreet').value.trim() : '';
        const cityPin = document.getElementById('cxCityPin') ? document.getElementById('cxCityPin').value.trim() : '';

        const selectedPayment = document.querySelector('input[name="payment_method"]:checked');
        const paymentMethod = selectedPayment ? selectedPayment.value : 'online';

        if (!name || !phone || !email || !area || !house || !street || !cityPin) {
            alert('Please fill out all required contact and shipping details (marked with *).');
            return;
        }

        if (cart.length === 0) {
            alert('Your cart is empty! Please add products before checking out.');
            return;
        }

        if (paymentMethod === 'online' && (!screenshotInput || !screenshotInput.files || screenshotInput.files.length === 0)) {
            alert('Please upload your payment screenshot to proceed with prepaid verification.');
            return;
        }

        const orderID = generateOrderID();
        
        // Format cart items into a readable string for the PHP backend
        let orderSummaryText = `Order ID: ${orderID}\nPayment Method: ${paymentMethod.toUpperCase()}\n\nItems:\n`;
        let totalAmount = 0;
        cart.forEach(item => {
            orderSummaryText += `- ${item.name} (Qty: ${item.quantity}) @ ₹${item.price} each\n`;
            totalAmount += item.price * item.quantity;
        });
        orderSummaryText += `\nTotal Amount: ₹${totalAmount}`;

        const fullAddress = `${house}, ${street}, Area: ${area}, ${cityPin}`;

        // Prepare form data payload for send_order.php
        const formData = new FormData();
        formData.append('name', name);
        formData.append('phone', phone);
        formData.append('email', email);
        formData.append('order', orderSummaryText);
        formData.append('address', fullAddress);

        confirmOrderBtn.disabled = true;
        confirmOrderBtn.innerText = 'Processing Order...';

        try {
            // Send data to PHP script
            const response = await fetch('send_order.php', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert(`🎉 Order Placed Successfully!\n\nOrder ID: ${orderID}\nConfirmation sent to: ${email}. We will call you soon.`);

                // Reset Form & Cart
                ['cxName', 'cxPhone', 'cxEmail', 'cxArea', 'cxHouse', 'cxStreet', 'cxSocietyname', 'cxCityPin'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.value = '';
                });
                if (screenshotInput) screenshotInput.value = '';

                cart = [];
                updateCartUI();
                if (paymentModal) paymentModal.classList.remove('active');
            } else {
                throw new Error('Server returned an error response.');
            }

        } catch (error) {
            console.error('Order error:', error);
            alert(`⚠️ Order Error: Could not connect to server.\n\nPlease order via WhatsApp instead(9051524692 or 7439501410).`);
        } finally {
            confirmOrderBtn.disabled = false;
            confirmOrderBtn.innerText = 'Place Order';
        }
    });
}