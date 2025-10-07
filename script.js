document.addEventListener('DOMContentLoaded', () => {
    let products = [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const initialProducts = [
        { id: 1, name: "বাঁশের পানির বোতল", price: 550, originalPrice: 700, discount: 21, image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&h=300&fit=crop", stock: 25, category: "বোতল", description: "টেকসই বাঁশের পানির বোতল।" },
        { id: 2, name: "অর্গানিক কটন টোট ব্যাগ", price: 450, originalPrice: 600, discount: 25, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop", stock: 40, category: "ব্যাগ", description: "পুনর্ব্যবহারযোগ্য শপিং ব্যাগ।" },
        { id: 3, name: "সোলার ফোন চার্জার", price: 1200, originalPrice: 1500, discount: 20, image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=300&h=300&fit=crop", stock: 15, category: "ইলেকট্রনিক্স", description: "পোর্টেবল সোলার-চালিত ফোন চার্জার।" },
        { id: 4, name: "মোমের খাবার মোড়ক (৩টি)", price: 300, originalPrice: 400, discount: 25, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop", stock: 60, category: "অন্যান্য", description: "প্লাস্টিক মোড়কের প্রাকৃতিক বিকল্প।" }
    ];

    function initializeProducts() {
        const storedProducts = localStorage.getItem('products');
        if (!storedProducts || JSON.parse(storedProducts).length === 0) {
            localStorage.setItem('products', JSON.stringify(initialProducts));
            products = initialProducts;
        } else {
            products = JSON.parse(storedProducts);
        }
        loadProducts();
    }

    function loadProducts(filteredProducts = products) {
        const productsGrid = document.getElementById('products-grid');
        productsGrid.innerHTML = filteredProducts.map(product => `
            <div class="product-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div class="relative">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-40 object-cover">
                    <div class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">${product.discount}% ছাড়</div>
                    <span class="absolute bottom-2 left-2 bg-gray-800 text-white px-2 py-1 rounded text-xs">${product.category}</span>
                </div>
                <div class="p-4">
                    <h3 class="text-lg font-semibold mb-2 line-clamp-2">${product.name}</h3>
                    <div>
                        <span class="text-xl font-bold text-green-600">৳${product.price}</span>
                        <span class="text-sm text-gray-500 line-through ml-2">৳${product.originalPrice}</span>
                    </div>
                    <button onclick="addToCart(${product.id})" class="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors">কার্টে যোগ করুন</button>
                </div>
            </div>
        `).join('');
    }

    window.addToCart = function(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCartUI();
        alert(`'${product.name}' কার্টে যোগ করা হয়েছে!`);
    };

    function updateCartUI() {
        const cartCount = document.getElementById('cart-count');
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartCount.textContent = totalItems;
        cartTotal.textContent = totalPrice;
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="text-gray-500 text-center">আপনার কার্ট খালি</p>';
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="flex justify-between items-center text-sm">
                    <img src="${item.image}" class="w-12 h-12 rounded object-cover mr-2">
                    <div class="flex-grow">
                        <h4 class="font-semibold">${item.name}</h4>
                        <p class="text-gray-600">৳${item.price} x ${item.quantity}</p>
                    </div>
                    <button onclick="removeFromCart(${item.id})" class="text-red-500 hover:text-red-700">🗑️</button>
                </div>
            `).join('');
        }
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    window.removeFromCart = function(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCartUI();
    };

    document.getElementById('cart-btn').addEventListener('click', () => {
        document.getElementById('cart-modal').classList.remove('hidden');
    });
    document.getElementById('close-cart').addEventListener('click', () => {
        document.getElementById('cart-modal').classList.add('hidden');
    });

    document.getElementById('checkout-btn').addEventListener('click', () => {
        if (cart.length === 0) {
            alert('আপনার কার্ট খালি!');
            return;
        }
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const newOrder = {
            orderId: 'ECO-' + Date.now(),
            items: cart,
            totalAmount: totalAmount,
            orderDate: new Date().toLocaleString("bn-BD"),
            status: 'Pending'
        };
        orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));
        alert(`আপনার অর্ডারটি সফল হয়েছে!\nঅর্ডার আইডি: ${newOrder.orderId}`);
        cart = [];
        updateCartUI();
        document.getElementById('cart-modal').classList.add('hidden');
    });

    initializeProducts();
    updateCartUI();
});