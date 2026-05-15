  class ProductManager {
            constructor() {
                this.products = [];
                this.currentEditId = null;
                this.init();
            }

            init() {
                this.loadProducts();
                this.setupEventListeners();
                this.updateStats();
            }


            addProduct(productData) {
                if (!productData.title || !productData.price) {
                    this.showNotification('Title and price are required!', 'error');
                    return false;
                }

                if (this.currentEditId) {
                    const index = this.products.findIndex(p => p.id === this.currentEditId);
                    if (index !== -1) {
                        this.products[index] = { ...this.products[index], ...productData };
                        this.showNotification('Product updated successfully!', 'success');
                    }
                    this.currentEditId = null;
                    document.getElementById('submitBtn').textContent = 'Add Product';
                    document.getElementById('formTitle').textContent = '➕ Add New Product';
                    document.getElementById('cancelBtn').style.display = 'none';
                } else {
                    const newProduct = {
                        id: Date.now(),
                        ...productData,
                        createdAt: new Date().toISOString()
                    };
                    this.products.push(newProduct);
                    this.showNotification('Product added successfully!', 'success');
                }

                this.saveProducts();
                this.renderProducts();
                this.updateStats();
                this.clearForm();
                return true;
            }

            editProduct(productId) {
                const product = this.products.find(p => p.id === productId);
                if (product) {
                    document.getElementById('title').value = product.title;
                    document.getElementById('price').value = product.price;
                    document.getElementById('image').value = product.image || '';
                    document.getElementById('category').value = product.category || 'other';
                    
                    this.currentEditId = productId;
                    document.getElementById('submitBtn').textContent = 'Update Product';
                    document.getElementById('formTitle').textContent = '✏️ Edit Product';
                    document.getElementById('cancelBtn').style.display = 'block';
                    
                    this.showNotification('Edit mode activated. Update and click "Update Product"', 'info');
                }
            }

            deleteProduct(productId) {
                if (confirm('Are you sure you want to delete this product?')) {
                    this.products = this.products.filter(p => p.id !== productId);
                    this.saveProducts();
                    this.renderProducts();
                    this.updateStats();
                    this.showNotification('Product deleted successfully!', 'success');
                }
            }


            saveProducts() {
                localStorage.setItem('products', JSON.stringify(this.products));
            }

            loadProducts() {
                const saved = localStorage.getItem('products');
                if (saved) {
                    this.products = JSON.parse(saved);
                    this.renderProducts();
                }
            }


            addProductToList(product) {
                const productList = document.getElementById('productList');
                const productCard = this.createProductCard(product);
                productList.appendChild(productCard);
            }

            createProductCard(product) {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.dataset.id = product.id;
                
                const defaultImage = '[images.unsplash.com](https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80)';
                
                card.innerHTML = `
                    <img src="${product.image || defaultImage}" alt="${product.title}" class="product-image" onerror="this.src='${defaultImage}'">
                    <div class="product-info">
                        <h3 class="product-title">${product.title}</h3>
                        <span class="product-category">${product.category}</span>
                        <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
                        <div class="product-actions">
                            <button class="btn btn-edit" onclick="productManager.editProduct(${product.id})">Edit</button>
                            <button class="btn btn-delete" onclick="productManager.deleteProduct(${product.id})">Delete</button>
                        </div>
                    </div>
                `;
                
                return card;
            }

            renderProducts(filteredProducts = null) {
                const productsToRender = filteredProducts || this.products;
                const productList = document.getElementById('productList');
                productList.innerHTML = '';
                
                if (productsToRender.length === 0) {
                    productList.innerHTML = `
                        <div style="text-align: center; padding: 40px; color: #7f8c8d; grid-column: 1 / -1;">
                            <h3>No products found</h3>
                            <p>Add your first product using the form on the left!</p>
                        </div>
                    `;
                    return;
                }
                
                productsToRender.forEach(product => {
                    this.addProductToList(product);
                });
            }


            filterProducts() {
                const searchTerm = document.getElementById('searchInput').value.toLowerCase();
                const categoryFilter = document.getElementById('categoryFilter').value;
                const sortValue = document.getElementById('sortSelect').value;
                
                let filtered = this.products.filter(product => {
                    const matchesSearch = product.title.toLowerCase().includes(searchTerm);
                    const matchesCategory = !categoryFilter || product.category === categoryFilter;
                    return matchesSearch && matchesCategory;
                });

                if (sortValue) {
                    const [field, order] = sortValue.split('-');
                    filtered.sort((a, b) => {
                        let aVal = a[field];
                        let bVal = b[field];
                        
                        if (field === 'price') {
                            aVal = parseFloat(aVal);
                            bVal = parseFloat(bVal);
                        } else {
                            aVal = aVal.toLowerCase();
                            bVal = bVal.toLowerCase();
                        }
                        
                        if (order === 'asc') {
                            return aVal > bVal ? 1 : -1;
                        } else {
                            return aVal < bVal ? 1 : -1;
                        }
                    });
                }
                
                this.renderProducts(filtered);
                this.updateStats(filtered);
            }


            updateStats(products = null) {
                const productsToCalculate = products || this.products;
                const totalProducts = productsToCalculate.length;
                const totalValue = productsToCalculate.reduce((sum, p) => sum + parseFloat(p.price || 0), 0);
                const avgPrice = totalProducts > 0 ? totalValue / totalProducts : 0;
                
                document.getElementById('totalProducts').textContent = totalProducts;
                document.getElementById('totalValue').textContent = `$${totalValue.toFixed(2)}`;
                document.getElementById('avgPrice').textContent = `$${avgPrice.toFixed(2)}`;
            }


            clearForm() {
                document.getElementById('productForm').reset();
            }


            showNotification(message, type = 'info') {
                const notification = document.getElementById('notification');
                notification.textContent = message;
                notification.className = `notification ${type} show`;
                
                setTimeout(() => {
                    notification.classList.remove('show');
                }, 3000);
            }


            setupEventListeners() {
                document.getElementById('productForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    
                    const productData = {
                        title: document.getElementById('title').value.trim(),
                        price: document.getElementById('price').value,
                        image: document.getElementById('image').value.trim(),
                        category: document.getElementById('category').value
                    };
                    
                    this.addProduct(productData);
                });

                document.getElementById('cancelBtn').addEventListener('click', () => {
                    this.currentEditId = null;
                    this.clearForm();
                    document.getElementById('submitBtn').textContent = 'Add Product';
                    document.getElementById('formTitle').textContent = ' Add New Product';
                    document.getElementById('cancelBtn').style.display = 'none';
                    this.showNotification('Edit cancelled', 'info');
                });

                document.getElementById('searchInput').addEventListener('input', () => {
                    this.filterProducts();
                });

                document.getElementById('categoryFilter').addEventListener('change', () => {
                    this.filterProducts();
                });

                document.getElementById('sortSelect').addEventListener('change', () => {
                    this.filterProducts();
                });
            }
        }

        const productManager = new ProductManager();