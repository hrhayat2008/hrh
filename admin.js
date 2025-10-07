document.addEventListener('DOMContentLoaded', () => {
    // --- Page Navigation Elements ---
    const adminNav = document.getElementById('admin-nav');
    const adminViews = document.querySelectorAll('.admin-view');
    
    // --- Form & List Elements ---
    const addForm = document.getElementById('add-product-form');
    const productList = document.getElementById('product-list');
    const orderList = document.getElementById('order-list');
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('image-preview');

    // --- Dashboard Stat Elements ---
    const totalProductsEl = document.getElementById('total-products');
    const pendingOrdersEl = document.getElementById('pending-orders');
    const totalRevenueEl = document.getElementById('total-revenue');
    const cancelledOrdersEl = document.getElementById('cancelled-orders');
    const cancelledRevenueEl = document.getElementById('cancelled-revenue');

    // --- Modal Elements ---
    const orderModal = document.getElementById('order-details-modal');
    const closeModalBtn = document.getElementById('close-order-modal');
    const modalContent = document.getElementById('modal-order-content');

    // --- Data from localStorage ---
    let products = JSON.parse(localStorage.getItem('products')) || [];
    let orders = JSON.parse(localStorage.getItem('orders')) || [];

    // --- Page Navigation Logic ---
    function switchView(viewId) {
        adminViews.forEach(view => view.classList.add('hidden'));
        document.getElementById(`view-${viewId}`).classList.remove('hidden');

        adminNav.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === viewId) {
                btn.classList.add('active');
            }
        });
    }

    adminNav.addEventListener('click', (e) => {
        if (e.target.matches('.nav-btn')) {
            switchView(e.target.dataset.view);
        }
    });
    
    // --- Utility Functions ---
    function saveProducts() { localStorage.setItem('products', JSON.stringify(products)); renderAll(); }
    function saveOrders() { localStorage.setItem('orders', JSON.stringify(orders)); renderAll(); }

    // --- Render Functions ---
    function renderDashboardStats() {
        totalProductsEl.textContent = products.length;
        const pendingOrders = orders.filter(o => o.status === 'Pending');
        const confirmedOrders = orders.filter(o => o.status === 'Confirmed');
        const cancelledOrders = orders.filter(o => o.status === 'Cancelled');
        pendingOrdersEl.textContent = pendingOrders.length;
        cancelledOrdersEl.textContent = cancelledOrders.length;
        const totalRevenue = confirmedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const cancelledRevenue = cancelledOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        totalRevenueEl.textContent = `৳${totalRevenue}`;
        cancelledRevenueEl.textContent = `৳${cancelledRevenue}`;
    }

    function renderProducts() {
        productList.innerHTML = products.map(product => `
            <tr class="border-b"><td class="p-3">${product.name}</td><td class="p-3">${product.category}</td><td class="p-3">৳${product.price}</td><td class="p-3">${product.stock}</td><td class="p-3"><button class="delete-btn bg-red-500 text-white px-2 py-1 rounded text-xs" data-id="${product.id}">Delete</button></td></tr>
        `).join('');
    }

    function renderOrders() {
        orderList.innerHTML = orders.map(order => {
            let statusClass = '', actionButtons = '';
            if (order.status === 'Pending') {
                statusClass = 'text-orange-500';
                actionButtons = `<button class="confirm-btn bg-green-500 text-white px-2 py-1 rounded text-xs" data-id="${order.orderId}">Confirm</button><button class="cancel-btn bg-red-500 text-white px-2 py-1 rounded text-xs" data-id="${order.orderId}">Cancel</button>`;
            } else if (order.status === 'Confirmed') {
                statusClass = 'text-green-500';
                actionButtons = '<span class="text-gray-400 text-xs">No Action</span>';
            } else if (order.status === 'Cancelled') {
                statusClass = 'text-red-500';
                actionButtons = '<span class="text-gray-400 text-xs">No Action</span>';
            }
            return `<tr class="border-b"><td class="p-3 font-mono text-xs">${order.orderId}</td><td class="p-3 font-semibold ${statusClass}">${order.status}</td><td class="p-3 space-x-1"><button class="view-btn bg-blue-500 text-white px-2 py-1 rounded text-xs" data-id="${order.orderId}">Details</button>${actionButtons}</td></tr>`;
        }).join('');
    }
    
    function renderAll() {
        renderDashboardStats();
        renderProducts();
        renderOrders();
    }

    // --- Event Listeners ---
    addForm.addEventListener('submit', (e) => { e.preventDefault(); const newProduct = { id: Date.now(), name: document.getElementById('name').value, category: document.getElementById('category').value, price: parseInt(document.getElementById('price').value), originalPrice: parseInt(document.getElementById('originalPrice').value), stock: parseInt(document.getElementById('stock').value), discount: parseInt(document.getElementById('discount').value), image: document.getElementById('image').value }; products.push(newProduct); saveProducts(); addForm.reset(); imagePreview.src = 'https://via.placeholder.com/150'; });
    imageInput.addEventListener('input', () => { imagePreview.src = imageInput.value || 'https://via.placeholder.com/150'; });
    productList.addEventListener('click', (e) => { if (e.target.classList.contains('delete-btn')) { const id = parseInt(e.target.dataset.id); if (confirm('Are you sure you want to delete this product?')) { products = products.filter(p => p.id !== id); saveProducts(); } } });
    
    orderList.addEventListener('click', (e) => {
        const orderId = e.target.dataset.id;
        if (!orderId) return;

        if (e.target.classList.contains('confirm-btn')) {
            const orderIndex = orders.findIndex(o => o.orderId === orderId);
            if (orderIndex > -1) {
                orders[orderIndex].status = 'Confirmed';
                saveOrders();
            }
        }
        
        if (e.target.classList.contains('cancel-btn')) {
            if (confirm(`Are you sure you want to cancel order #${orderId}?`)) {
                const orderIndex = orders.findIndex(o => o.orderId === orderId);
                if (orderIndex > -1) {
                    orders[orderIndex].status = 'Cancelled';
                    saveOrders();
                }
            }
        }

        if (e.target.classList.contains('view-btn')) {
            const order = orders.find(o => o.orderId === orderId);
            modalContent.innerHTML = `<p><strong>Order ID:</strong> ${order.orderId}</p><p><strong>Date:</strong> ${order.orderDate}</p><p><strong>Status:</strong> ${order.status}</p><p><strong>Total Amount:</strong> ৳${order.totalAmount}</p><h4 class="font-bold mt-2 border-t pt-2">Products:</h4><div class="space-y-2 max-h-40 overflow-y-auto">${order.items.map(item => `<div class="flex items-center gap-2 text-sm"><img src="${item.image}" class="w-10 h-10 rounded object-cover"><span>${item.name} (x${item.quantity})</span></div>`).join('')}</div>`;
            orderModal.classList.remove('hidden');
            orderModal.classList.add('flex');
        }
    });

    closeModalBtn.addEventListener('click', () => {
        orderModal.classList.add('hidden');
        orderModal.classList.remove('flex');
    });

    // --- Initial Load ---
    renderAll();
    switchView('dashboard');
});