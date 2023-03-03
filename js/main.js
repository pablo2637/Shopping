document.addEventListener('DOMContentLoaded', () => {

    //VARIABLES
    const divGridContCat = document.querySelector('.divGridContCat')

    const objCategories = { url: 'https://dummyjson.com/products/categories', tipo: 'categorias' };
    const objID = { url: 'https://dummyjson.com/products/', tipo: 'id' };
    const objCategory = {
        url: 'https://dummyjson.com/products/category/',
        tipo: 'category',
        categoria: ''
    };

    const arrayCesta = JSON.parse(localStorage.getItem("arrayCesta")) || [];

    //EVENTOS

    //FUNCIONES
    const fetchData = async (data) => {
        try {
            let url;
            switch (data.tipo) {
                case 'categorias':
                    url = data.url;
                    break;
            }

            const peticion = await fetch(url);

            if (peticion.ok) {
                const resp = await peticion.json();
                return {
                    ok: true,
                    response: resp,
                };
            } else {
                throw {
                    ok: false,
                    response: `Error: status ${peticion.status}, resp ${resp}`,
                };
            }
        } catch (error) {
            return error;
        }
    };


    const crearCardCategoria = category => {
        const divCardCat = document.createElement('DIV');
        divCardCat.classList.add('divCardCat');
        divCardCat.id = category;

        const imgCat = document.createElement('IMG');
        imgCat.src = '/assets/viajes-1.jpg';
        imgCat.title = category;

        const h3Cat = document.createElement('H3');
        h3Cat.textContent = category;

        const pCat = document.createElement('P');
        pCat.textContent = 'Entrar';

        divCardCat.append(imgCat, h3Cat, pCat);
        return divCardCat;
    }


    const pintarCategorias = categories => {
        const fragment = document.createDocumentFragment();

        categories.forEach(category => {
            fragment.append(crearCardCategoria(category));
        });
        divGridContCat.append(fragment);
    }


    const fetchCategorias = async () => {
        const { ok, response } = await fetchData(objCategories);

        if (ok) {

            pintarCategorias(response);
        } else {
            console.log(`Error fetchCategorias: ${response}`);
        }

    }


    const init = () => {
        const url = location.search;
        const params = new URLSearchParams(url);

        if (params.has('')) { }
        else fetchCategorias();

    }

    init();

}) //Load