const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-btn');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');
// our cart
let cart = [];

// buttons
let btnsDOM = [];

// getting products
class Products {
    async getProducts() {
        try {
            let result = await fetch('products.json');
            let data = await result.json();

            let products = data.items;
            products = products.map(item => {
                const {
                    title,
                    price
                } = item.fields;
                const {
                    id
                } = item.sys;
                const image = item.fields.image.fields.file.url;

                return {
                    title,
                    price,
                    id,
                    image
                };
            });
            return products;
        } catch (error) {
            console.log(error);
            return new Error('Could not fetch products.');
        }
    }
}

// display products
class UI {
    displayProducts(products) {
        let result = '';
        products.forEach(product => {
            result += `
            <!-- single product -->
            <article class="product">
                <div class="img-container">
                    <img 
                        src="${product.image}" 
                        alt="${product.title}" 
                        class="product-img"
                    >
                    <button 
                        class="bag-btn" 
                        data-id="${product.id}"
                    >
                        <i class="fas fa-shopping-cart"></i>
                        add to bag
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>
            <!-- end of single product -->
            `;
        });
        productsDOM.innerHTML = result;
        console.table(products);
    }

    getBagBtns(){
        const btns = [...document.querySelectorAll('.bag-btn')];
        btnsDOM = btns;
        btns.forEach(btn => {
            let id = btn.dataset.id;
            let inCart = cart.find(item => item.id == id);
            if(inCart){
                btn.innerText = 'In Cart';
                btn.disabled = true;
            }
            btn.addEventListener('click', (event) => {
                event.target.innerText = 'In Cart';
                event.target.disabled = true;

                // get product from products based on id
                let cartItem = {...Storage.getProduct(id), amount: 1};
                // add product to the cart
                cart = [...cart, cartItem]
                // save the cart in local storage
                Storage.saveCart(cart);
                // set cart values
                this.setCartValues(cart);
                // display cart items
                this.addCartItem(cartItem);
                // show the cart
            });
        });
    }

    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }

    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
            <img src="${ item.image }" alt="${item.title}">
            <div>
                <h4>${ item.title }</h4>
                <h5>$${ item.price }</h5>
                <span class="remove-item" data-id="${ item.id }">remove</span>
            </div>
            <div>
                <i class="fas fa-chevron-up" data-id="${ item.id }"></i>
                <p class="item-amount" data-id="${ item.amount }"></p>
                <i class="fas fa-chevron-up" data-id="${ item.id }"></i>
            </div>
        `;
        cartContent.appendChild(div);
        console.log(cartContent);
    }
}

// local storage
class Storage {
    static saveProducts(products){
        localStorage.setItem('products', JSON.stringify(products));
    }

    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id == id);
    }

    static saveCart(cart){
        localStorage.setItem('cart', JSON.stringify(cart));
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();

    // get all products
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then( () => {
        ui.getBagBtns();
    }); 
});