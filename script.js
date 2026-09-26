// Dữ liệu ban đầu (Initial Products)
const initialProducts = [
    {
        id: 1,
        name: "AURA Emperor PC - RTX 4090",
        brand: "Asus ROG",
        price: 125000000,
        oldPrice: 140000000,
        image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80",
        specs: "Intel i9 14900KS / 64GB DDR5 / RTX 4090 24GB / 2TB NVMe",
        stock: 5
    },
    {
        id: 2,
        name: "MacBook Pro 16 M3 Max Luxury Gold",
        brand: "Apple",
        price: 99000000,
        oldPrice: 105000000,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
        specs: "Apple M3 Max 16-core / 48GB Unified Memory / 1TB SSD",
        stock: 8
    },
    {
        id: 3,
        name: "Razer Blade 18 Mercury Edition",
        brand: "Razer",
        price: 110000000,
        oldPrice: 0,
        image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80",
        specs: "Intel i9 14900HX / 32GB RAM / RTX 4090 / 240Hz QHD+",
        stock: 3
    },
    {
        id: 4,
        name: "Alienware Aurora R16 Dark Matter",
        brand: "Alienware",
        price: 85000000,
        oldPrice: 92000000,
        image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=600&q=80",
        specs: "Intel i7 14700KF / 32GB DDR5 / RTX 4080 Super / Liquid Cooling",
        stock: 12
    }
];

// Khởi tạo LocalStorage
function initStorage() {
    if (!localStorage.getItem('aura_products')) {
        localStorage.setItem('aura_products', JSON.stringify(initialProducts));
    }
    if (!localStorage.getItem('aura_cart')) {
        localStorage.setItem('aura_cart', JSON.stringify([]));
    }
    if (!localStorage.getItem('aura_history')) {
        localStorage.setItem('aura_history', JSON.stringify([]));
    }
}

// Get Data Helper
const getProducts = () => JSON.parse(localStorage.getItem('aura_products')) || [];
const setProducts = (data) => localStorage.setItem('aura_products', JSON.stringify(data));
const getCart = () => JSON.parse(localStorage.getItem('aura_cart')) || [];
const setCart = (data) => {
    localStorage.setItem('aura_cart', JSON.stringify(data));
    updateCartBadge();
};
const getHistory = () => JSON.parse(localStorage.getItem('aura_history')) || [];
const setHistory = (data) => localStorage.setItem('aura_history', JSON.stringify(data));

// Format Tiền VNĐ
const formatMoney = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// Toast Helper
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Chuyển Đổi View
function switchView(viewId, navElement) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    document.getElementById(viewId).classList.add('active');
    if (navElement) navElement.classList.add('active');

    if (viewId === 'home-view') renderProducts();
    if (viewId === 'admin-view') renderAdminTable();
    if (viewId === 'history-view') renderHistoryTable();
}

/* ==========================================
   RENDER SẢN PHẨM & BỘ LỌC
   ========================================== */
function renderProducts(productsToRender = null) {
    const container = document.getElementById('product-list');
    const products = productsToRender || getProducts();

    if (products.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Không tìm thấy sản phẩm phù hợp.</p>`;
        return;
    }

    container.innerHTML = products.map(p => `
        <div class="product-card">
            <img src="${p.image}" alt="${p.name}" class="product-img" onclick="openDetailModal(${p.id})">
            <div class="product-info">
                <div class="product-title" onclick="openDetailModal(${p.id})" style="cursor:pointer">${p.name}</div>
                <div class="product-specs">${p.specs}</div>
                <div class="product-bottom">
                    <div class="price-box">
                        <span class="price">${formatMoney(p.price)}</span>
                        ${p.oldPrice ? `<span class="old-price">${formatMoney(p.oldPrice)}</span>` : ''}
                    </div>
                    <button class="btn" onclick="addToCart(${p.id})">+ Giỏ</button>
                </div>
            </div>
        </div>
    `).join('');
}

function applyFilters() {
    const search = document.getElementById('search-input').value.toLowerCase();
    const brand = document.getElementById('brand-filter').value;
    const sort = document.getElementById('sort-filter').value;

    let filtered = getProducts().filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search) || p.specs.toLowerCase().includes(search);
        const matchesBrand = brand === "" || p.brand === brand;
        return matchesSearch && matchesBrand;
    });

    if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);

    renderProducts(filtered);
}

/* ==========================================
   QUẢN LÝ GIỎ HÀNG & THANH TOÁN
   ========================================== */
function updateCartBadge() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById('cart-count').innerText = count;
}

function addToCart(productId) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    let cart = getCart();
    const existItem = cart.find(item => item.id === productId);

    if (existItem) {
        existItem.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    setCart(cart);
    showToast(`Đã thêm "${product.name}" vào giỏ!`);
}

function toggleCartModal() {
    const modal = document.getElementById('cart-modal');
    modal.classList.toggle('active');
    if (modal.classList.contains('active')) renderCartItems();
}

function renderCartItems() {
    const cart = getCart();
    const container = document.getElementById('cart-items');

    if (cart.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: var(--text-muted);">Giỏ hàng đang trống.</p>`;
        document.getElementById('cart-total').innerText = '0 ₫';
        return;
    }

    let total = 0;
    container.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;">
                <div>
                    <div style="font-weight: bold;">${item.name}</div>
                    <div style="color: var(--accent-gold); font-size: 14px;">${formatMoney(item.price)} x ${item.qty}</div>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <button class="btn-outline" style="padding: 2px 8px;" onclick="changeQty(${item.id}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button class="btn-outline" style="padding: 2px 8px;" onclick="changeQty(${item.id}, 1)">+</button>
                    <button style="background: none; color: var(--danger); font-size: 18px;" onclick="removeFromCart(${item.id})">&times;</button>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('cart-total').innerText = formatMoney(total);
}

function changeQty(id, delta) {
    let cart = getCart();
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
        setCart(cart);
        renderCartItems();
    }
}

function removeFromCart(id) {
    let cart = getCart().filter(i => i.id !== id);
    setCart(cart);
    renderCartItems();
}

function openCheckoutModal() {
    if (getCart().length === 0) {
        showToast("Giỏ hàng của bạn đang trống!");
        return;
    }
    toggleCartModal();
    document.getElementById('checkout-modal').classList.add('active');
}

function closeCheckoutModal() {
    document.getElementById('checkout-modal').classList.remove('active');
}

function processCheckout(event) {
    event.preventDefault();
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const order = {
        id: 'AURA-' + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleDateString('vi-VN'),
        customer: document.getElementById('cust-name').value,
        items: cart.map(i => `${i.name} (x${i.qty})`).join(', '),
        total: total,
        status: 'Đã Xác Nhận'
    };

    const history = getHistory();
    history.unshift(order);
    setHistory(history);

    setCart([]);
    closeCheckoutModal();
    showToast("Đặt hàng thành công! Mã đơn: " + order.id);
}

/* ==========================================
   CHI TIẾT SẢN PHẨM MODAL
   ========================================== */
function openDetailModal(productId) {
    const product = getProducts().find(p => p.id === productId);
    if (!product) return;

    const content = document.getElementById('detail-content');
    content.innerHTML = `
        <img src="${product.image}" style="width: 100%; height: 280px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: var(--accent-gold);">${product.name}</h2>
        <p style="color: var(--text-muted); margin: 10px 0;">Thương hiệu: ${product.brand}</p>
        <div style="font-size: 22px; font-weight: bold; color: var(--accent-gold); margin-bottom: 15px;">${formatMoney(product.price)}</div>
        <div style="background-color: var(--bg-primary); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <strong style="color: var(--accent-gold);">Cấu hình chi tiết:</strong>
            <p style="margin-top: 5px; color: var(--text-main);">${product.specs}</p>
            <p style="margin-top: 10px; color: var(--text-muted);">Tồn kho khả dụng: ${product.stock} máy</p>
        </div>
        <button class="btn" style="width: 100%;" onclick="addToCart(${product.id}); closeDetailModal();">Thêm Vào Giỏ Hàng</button>
    `;
    document.getElementById('detail-modal').classList.add('active');
}

function closeDetailModal() {
    document.getElementById('detail-modal').classList.remove('active');
}

/* ==========================================
   QUẢN TRỊ ADMIN (CRUD)
   ========================================== */
function renderAdminTable() {
    const products = getProducts();
    const container = document.getElementById('admin-table-body');

    container.innerHTML = products.map(p => `
        <tr>
            <td><img src="${p.image}" style="width: 50px; height: 35px; object-fit: cover; border-radius: 4px;"></td>
            <td><strong>${p.name}</strong></td>
            <td>${p.brand}</td>
            <td style="color: var(--accent-gold);">${formatMoney(p.price)}</td>
            <td>${p.stock}</td>
            <td>
                <button class="btn-outline" style="padding: 4px 8px; margin-right: 5px;" onclick="editProduct(${p.id})">Sửa</button>
                <button style="background: var(--danger); color: white; padding: 4px 8px; border-radius: 4px;" onclick="deleteProduct(${p.id})">Xóa</button>
            </td>
        </tr>
    `).join('');
}

function openProductModal() {
    document.getElementById('product-form').reset();
    document.getElementById('prod-id').value = '';
    document.getElementById('modal-product-title').innerText = "Thêm Sản Phẩm Mới";
    document.getElementById('product-modal').classList.add('active');
}

function closeProductModal() {
    document.getElementById('product-modal').classList.remove('active');
}

function editProduct(id) {
    const product = getProducts().find(p => p.id === id);
    if (!product) return;

    document.getElementById('prod-id').value = product.id;
    document.getElementById('prod-name').value = product.name;
    document.getElementById('prod-brand').value = product.brand;
    document.getElementById('prod-price').value = product.price;
    document.getElementById('prod-old-price').value = product.oldPrice || 0;
    document.getElementById('prod-image').value = product.image;
    document.getElementById('prod-specs').value = product.specs;
    document.getElementById('prod-stock').value = product.stock;

    document.getElementById('modal-product-title').innerText = "Chỉnh Sửa Sản Phẩm";
    document.getElementById('product-modal').classList.add('active');
}

function saveProduct(event) {
    event.preventDefault();
    let products = getProducts();
    const id = document.getElementById('prod-id').value;

    const productData = {
        id: id ? parseInt(id) : Date.now(),
        name: document.getElementById('prod-name').value,
        brand: document.getElementById('prod-brand').value,
        price: parseFloat(document.getElementById('prod-price').value),
        oldPrice: parseFloat(document.getElementById('prod-old-price').value) || 0,
        image: document.getElementById('prod-image').value,
        specs: document.getElementById('prod-specs').value,
        stock: parseInt(document.getElementById('prod-stock').value)
    };

    if (id) {
        products = products.map(p => p.id === parseInt(id) ? productData : p);
        showToast("Cập nhật sản phẩm thành công!");
    } else {
        products.push(productData);
        showToast("Thêm sản phẩm mới thành công!");
    }

    setProducts(products);
    closeProductModal();
    renderAdminTable();
}

function deleteProduct(id) {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
        let products = getProducts().filter(p => p.id !== id);
        setProducts(products);
        renderAdminTable();
        showToast("Đã xóa sản phẩm!");
    }
}

/* ==========================================
   LỊCH SỬ MUA HÀNG
   ========================================== */
function renderHistoryTable() {
    const history = getHistory();
    const container = document.getElementById('history-table-body');

    if (history.length === 0) {
        container.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Chưa có lịch sử đơn hàng nào.</td></tr>`;
        return;
    }

    container.innerHTML = history.map(h => `
        <tr>
            <td><strong>${h.id}</strong></td>
            <td>${h.date}</td>
            <td style="max-width: 300px;">${h.items}</td>
            <td style="color: var(--accent-gold);">${formatMoney(h.total)}</td>
            <td><span style="background: rgba(42, 157, 143, 0.2); color: var(--success); padding: 4px 8px; border-radius: 4px; font-size: 12px;">${h.status}</span></td>
        </tr>
    `).join('');
}

// Tự động khởi chạy ứng dụng khi tải trang
window.onload = function () {
    initStorage();
    renderProducts();
    updateCartBadge();
};