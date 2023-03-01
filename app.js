//variavel
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
//carrinho
let cart = [];
//butoes
let buttonsDOM = [];
//function

//CLass´s
//pegando produtos
class Products {
    async getProducts() {
        try {
            const result = await fetch('products.json')
            const data = await result.json()
            let products = data.items;
            products = products.map(item => {
                const { title, price } = item.fields;// destructuring valores do array item
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { title, price, id, image }
            })
            return products;
        } catch (error) {
            console.log(error);
        }
    }
};

//User Interface
class UI {

    displayProducts(products) {
        let result = '';
        products.forEach(product => {
            result += `
            <article class="product">
            <div class="img-container">
                <img src=${product.image} alt="product" class="product-img">
                <button class="bag-btn" data-id=${product.id}>
                    <i class="fas fa-shopping-cart"></i>
                    Adicionar no Carrinho
                </button>
            </div>
            <h3>${product.title}</h3>
            <h4>R$${product.price}</h4>
        </article>
            `
        });
        productsDOM.innerHTML = result;
    }

    getBagButtons() {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;//ARMZENAR eles em uma variavel fará que com que possa ser adcionados ,ao ser removidos do carrinho
        buttons.forEach(button => {
            let id = button.dataset.id
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                button.innerText = "Adicionado";
                button.disabled = true;
            }
            button.addEventListener('click', (event) => {
                event.target.innerText = "Adicionado";
                event.target.disabled = true;
                //get product from products
                let cartItem = { ...Storage.getProducts(id), amout: 1 };//foi preciso usar spread,porque agora se tornou um objeto
                //add product to the cart 
                cart = [...cart, cartItem];
                //save cart in local storage
                Storage.saveCart(cart);
                //set cart values
                this.setCartValues(cart);//função da atual class
                //display cart itens
                this.addCartItem(cartItem)//função da atual class
                //show the cart 
                this.showCart();
            })

        })
    };

    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amout;//valor x quantidade
            itemsTotal += item.amout;//qunatida para o carrinho
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2))//valor total
        cartItems.innerText = itemsTotal;//Adicionando valor ao numero do carrinho
    }

    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
            <img src=${item.image} 
            alt="product">
            <div>
                <h4>${item.title}</h4>
                <h5>R$${item.price}</h5>
                <span class="remove-item" data-id=${item.id}>remover</span>
            </div> 
            <div>
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
                <p class="item-amount">${item.amout}</p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>
   
        `
        cartContent.appendChild(div)
    }

    showCart() {
        cartOverlay.classList.add('transparentBcg')
        cartDOM.classList.add('showCart')
    }

    setupAPP() {
        cart = Storage.getCart();//Vericando itens do carrinho da sessão anterios
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart)
        closeCartBtn.addEventListener('click', this.hideCart)
    }

    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }

    hideCart() {
        cartOverlay.classList.remove('transparentBcg')
        cartDOM.classList.remove('showCart')
    }

    cartLogic() {
        //limpando carrinho
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();// pointer to UI class
        })

        cartContent.addEventListener("click", event => {//
            if (event.target.classList.contains('remove-item'))//verificando se clicou na class "remove-item"
            {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement)
                this.removeItem(id);
            } else if (event.target.classList.contains("fa-chevron-up")) {//AUMENTA AMOUNT
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id)
                tempItem.amout = tempItem.amout + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amout;//é preciso nextElementSibling para retorna o elemento no mesmo momento
            } else if (event.target.classList.contains("fa-chevron-down")) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id
                let tempItem = cart.find(item => item.id === id);
                tempItem.amout = tempItem.amout - 1;
                if (tempItem.amout > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amout
                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement)
                    this.removeItem(id)
                }
            }


        })
    }

    clearCart() {
        //
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        console.log(cartContent.children)
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0])//removendo filhos calss cartContent 
        }//removendo todo os itens do carrinhow
        this.hideCart()
    }

    removeItem(id) {
        cart = cart.filter(item => item.id !== id);//escolhendo itens que não seja o id selecionado
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;//ativando o botão de comprar novamente e adicionar o icone de comprar
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>Adicionar ao carrinho `
    }

    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id)//escolhendo produto exato clicado atraves do id do butão ,send oesse id o mesmo do produto
    };

};

//armazenamento
class Storage {
    static saveProduct(products) {
        localStorage.setItem("produtos", JSON.stringify(products));
    }
    static getProducts(id) {
        let products = JSON.parse(localStorage.getItem('produtos'));
        return products.find(products => products.id === id);// esse metetodo é bom para grande lista de produtos?
    }

    static saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));//
    }

    static getCart() {
        return localStorage.getItem('cart') ?
            JSON.parse(localStorage.getItem('cart'))
            :
            []
        //verificando os itens anteriores do carrinho
    }
};


//SETUP

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();
    ui.setupAPP()
    //get products
    products.getProducts().then(data => {
        ui.displayProducts(data);
        Storage.saveProduct(data);
    }).then(() => {
        ui.getBagButtons();//é preciso pegar os buttons depois do itens serem inseridos no then acima
        ui.cartLogic()
    })
});