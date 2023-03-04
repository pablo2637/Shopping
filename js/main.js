document.addEventListener('DOMContentLoaded', () => {

    //VARIABLES
    const body = document.querySelector('body');
    const divGridContCat = document.querySelector('.divGridContCat')
    const divGridContItem = document.querySelector('.divGridContItem');
    const secItems = document.querySelector('.secItems');
    const secCategorias = document.querySelector('.secCategorias');
    const divCesta = document.querySelector('#divCesta');
    // const iCesta = document.querySelector('#cesta');
    const tbody = document.querySelector('tbody');
    const tdFootPrecio = document.querySelector('tfoot td');
    const pStatus = document.querySelector('#pStatus span');
    const pReadyStatus = document.querySelector('#pReadyStatus span');
    const pError = document.querySelector('#pError')

    const objCategories = { url: 'https://dummyjson.com/products/categories', tipo: 'categories' };
    const objID = {
        url: 'https://dummyjson.com/products/',
        tipo: 'id',
        id: 0
    };
    const objCategory = {
        url: 'https://dummyjson.com/products/category/',
        tipo: 'category',
        categoria: ''
    };
    const objCategoryImg = {
        url: 'https://dummyjson.com/products/category/',
        tipo: 'categoryImg',
        categoria: '',
    };

    const arrayCesta = JSON.parse(localStorage.getItem("arrayCesta")) || [];

    //EVENTOS
    body.addEventListener('click', ({ target }) => {

        if (target.classList.contains("cesta")) {
            if (target.matches('i')) divCesta.classList.toggle('ocultar');

            if (target.matches('button')) {
                if (target.classList.contains('add')) addCartItem(target.parentNode.parentNode.id);
                else if (target.classList.contains('remove')) subCartItem(target.parentNode.parentNode.id);
                else if (target.classList.contains('empty')) removeCartItem(target.parentNode.parentNode.id);
                else if (target.id == 'btnVaciarCesta') emptyCart();
                else if (target.id == 'btnComprar') location.assign('cart.html?pag=2')
                else if (target.id == 'btnOcultar') divCesta.classList.toggle('ocultar');
            }
        }

        if (target.classList.contains('item')) {
            if (target.matches('button')) fetchID(target.parentNode.id);
        }

        if (target.classList.contains('categoria')) {
            if (target.id != '' &&
                target.parentNode.classList.contains('divGridContCat')) {
                msg(`ev click: target ${target.id}`)
                secItems.classList.toggle('ocultar');
                fetchItems(target.id);
            } else if (target.parentNode.id != '' &&
                target.parentNode.parentNode.classList.contains('divGridContCat')) {
                msg(`ev click: .parentNode ${target.parentNode.id}`)
                secItems.classList.toggle('ocultar');
                fetchItems(target.parentNode.id);
            }
        }
    })


    //FUNCIONES

    const getLocal = () => {
        return JSON.parse(localStorage.getItem("arrayCesta")) || [];
    }

    const setLocal = () => {
        localStorage.setItem("arrayCesta", JSON.stringify(arrayCesta));
    };


    /*Secundarias*/
    const statusChange = data => {
        pStatus.textContent = data.status + ' ' + data.statusText;
        pReadyStatus.innerText = data.ok
        msg(`URL: ${data.url}`);
    }

    const msg = mensaje => pError.textContent = mensaje;


    /*Principales*/
    const fetchData = async (data) => {
        try {
            let url;
            switch (data.tipo) {
                case 'categories':
                    url = data.url;
                    break;
                case 'categoryImg':
                    url = data.url + data.categoria + '?limit=1';
                    break;
                case 'category':
                    url = data.url + data.categoria;
                    break;
                case 'id':
                    url = data.url + data.id;
                    break;
            }

            const peticion = await fetch(url);
            statusChange(peticion)

            if (peticion.ok) {
                const resp = await peticion.json();
                return {
                    ok: true,
                    response: resp,
                };
            } else {
                throw {
                    ok: false,
                    response: `Error: status ${peticion.status}`,
                };
            }
        } catch (error) {
            return error;
        }
    };

    const emptyCart = () => {
        arrayCesta.splice(0);
        tdFootPrecio.textContent = 'Total: 0€';

        setLocal();
        paintCart();
    }

    const removeCartItem = id => {
        const indItem = arrayCesta.findIndex(item => item.id == id.replace('tr', ''))
        arrayCesta.splice(indItem, 1);

        setLocal();
        paintCart();
    }

    const subCartItem = id => {
        const indItem = arrayCesta.findIndex(item => item.id == id.replace('tr', ''))
        arrayCesta[indItem].cantidad -= 1;

        if (arrayCesta[indItem].cantidad == 1) {
            const btnRemove = document.querySelector(`#${id} .remove`)
            btnRemove.disabled = true;
        }
        setLocal();
        paintCart();
    }

    const addCartItem = id => {
        const indItem = arrayCesta.findIndex(item => item.id == id.replace('tr', ''))
        arrayCesta[indItem].cantidad += 1;

        if (arrayCesta[indItem].cantidad == 2) {
            const btnRemove = document.querySelector(`#${id} .remove`)
            btnRemove.disabled = false;
        }
        setLocal();
        paintCart();
    }

    const crearCardItem = item => {
        const divCardItem = document.createElement('DIV');
        divCardItem.classList.add('divCardItem');
        divCardItem.id = item.id;

        const imgItem = document.createElement('IMG');
        imgItem.src = item.images[2];
        imgItem.title = item.description;
        imgItem.alt = item.title;

        const h3Item = document.createElement('H3');
        h3Item.textContent = item.title;

        const pItem = document.createElement('P');
        pItem.classList.add('precio');
        pItem.innerHTML = `Precio: <span>${item.price}€</span>`;

        const divStars = document.createElement('DIV');
        divStars.classList.add('divStars');
        divStars.append(setStars(item.rating));

        const btnItem = document.createElement('BUTTON');
        btnItem.textContent = 'Añadir a la cesta';
        btnItem.classList.add('item');

        divCardItem.append(imgItem, h3Item, pItem, divStars, btnItem);
        return divCardItem;
    }

    const setStars = rating => {
        const fragment = document.createDocumentFragment();
        let nro = 5 - Math.round(rating);

        for (let i = 1; i <= 5; i++) {
            const imgStar = document.createElement('IMG');
            if (i <= 5 - nro) imgStar.src = '/assets/star1.png';
            else imgStar.src = '/assets/star2.png';
            imgStar.setAttribute('width', 9 + (i * 2));
            fragment.append(imgStar);
        }
        return fragment;
    }

    const crearCardCategoria = (category) => {
        const divCardCat = document.createElement('DIV');
        divCardCat.classList.add('divCardCat','categoria');
        divCardCat.id = category;

        const imgCat = document.createElement('IMG');
        imgCat.src = '';
        imgCat.title = category;
        imgCat.id = category + 'X';
        imgCat.classList.add('categoria');

        const h3Cat = document.createElement('H3');
        h3Cat.textContent = category;
        h3Cat.classList.add('categoria');

        const pCat = document.createElement('P');
        pCat.textContent = 'Entrar';
        pCat.classList.add('categoria');

        divCardCat.append(imgCat, h3Cat, pCat);
        return divCardCat;
    }


    const paintItems = items => {
        const fragment = document.createDocumentFragment();

        items.forEach(item => fragment.append(crearCardItem(item)));
        divGridContItem.append(fragment);
        secCategorias.classList.toggle('ocultar')
    }

    const paintCategories = (categories) => {
        const fragment = document.createDocumentFragment();
        categories.forEach((category) => fragment.append(crearCardCategoria(category)));
        divGridContCat.append(fragment);

        fetchCategoryImg(categories);
    }

    const paintCart = () => {
        const fragment = document.createDocumentFragment();
        const newArray = getLocal();
        let total = 0;

        newArray.forEach(item => {
            const trItem = document.createElement('TR');
            trItem.id = 'tr' + item.id;

            const tdImg = document.createElement('TD');
            tdImg.innerHTML = `<img src='${item.thumbnail}'>`;

            const tdDesc = document.createElement('TD');
            tdDesc.textContent = item.title;
            tdDesc.classList.add('producto');

            const tdPrecio = document.createElement('TD');
            tdPrecio.textContent = item.price + '€';

            const btnRemove = document.createElement('BUTTON');
            btnRemove.classList.add('remove', 'cesta');
            btnRemove.textContent = '-';
            if (item.cantidad == 1) btnRemove.disabled = true;

            const tdCant = document.createElement('TD');
            tdCant.append(btnRemove);
            tdCant.innerHTML += `${item.cantidad}<button class='add cesta'>+</button>`;
            tdCant.classList.add('cantidad');

            let subTotal = item.price * item.cantidad;
            total += subTotal;
            tdFootPrecio.textContent = `Total: ${total}€`

            const tdTotal = document.createElement('TD');
            tdTotal.textContent = subTotal + '€';

            const tdVaciar = document.createElement('TD');
            tdVaciar.innerHTML = `<button class='empty cesta'>X</button>`;

            trItem.append(tdImg, tdDesc, tdPrecio, tdCant, tdTotal, tdVaciar);
            fragment.append(trItem);
        })
        if (newArray.length == 0) {
            const trCestaVacia = document.createElement('TR');
            const tdCestaVacia = document.createElement('TD');
            tdCestaVacia.textContent = 'No hay productos en la cesta.';
            tdCestaVacia.setAttribute('colspan', '6');

            trCestaVacia.append(tdCestaVacia)
            fragment.append(trCestaVacia);
        }
        tbody.innerHTML = '';
        tbody.append(fragment);
    }

    const addToCart = async ({ id, title, price, thumbnail }) => {
        const objItem = arrayCesta.find(item => item.id == id);

        if (objItem) {
            const indItem = arrayCesta.findIndex(item => item.id == id)
            arrayCesta[indItem].cantidad += 1;
        } else arrayCesta.push({ id, title, price, thumbnail, cantidad: 1 });

        setLocal();
        paintCart();
    }

    const fetchID = async (id) => {
        objID.id = id;
        const { ok, response } = await fetchData(objID);

        if (ok) addToCart(response);
        else msg(`Error fetchID: ${response}`);
    }

    const fetchItems = async (category) => {
        objCategory.categoria = category;
        const { ok, response } = await fetchData(objCategory);

        if (ok) paintItems(response.products);
        else msg(`Error fetchItems: ${response}`);
    }

    const setCategoryImg = (category, src) => {
        const img = document.querySelector(`#${category}X`);
        img.src = src;
    }

    const fetchCategoryImg = async (categories) => {
        for (let i = 0; i < categories.length; i++) {
            objCategoryImg.categoria = categories[i];
            const { ok, response } = await fetchData(objCategoryImg);

            if (ok) {
                setCategoryImg(categories[i], response.products[0].thumbnail);
            } else {
                msg(`Error fetchCategoryImg: ${response}`);
            }
        }
    }

    const fetchCategories = async () => {
        secItems.classList.toggle('ocultar');
        divCesta.classList.toggle('ocultar');
        const { ok, response } = await fetchData(objCategories);

        if (ok) paintCategories(response)
        else msg(`Error fetchCategorias: ${response}`);
    }


    const init = () => {
        const url = location.search;
        const params = new URLSearchParams(url);

        if (params.has('pag')) {

        }
        else fetchCategories();

    }

    paintCart();
    init();

}) //Load