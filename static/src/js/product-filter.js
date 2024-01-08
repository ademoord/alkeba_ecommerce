$(document).ready(function () {
    let getUrlParameter = function getUrlParameter(sParam) {
        let sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
        return false;
    };

    let removeId = function removeId(arr) {
        let what, a = arguments, L = a.length, ax;
        while (L > 1 && arr.length) {
            what = a[--L];
            while ((ax = arr.indexOf(what)) !== -1) {
                arr.splice(ax, 1);
            }
        }
        return arr;
    }

    let page = getUrlParameter('page');
    let limit = getUrlParameter('limit');
    let sort = getUrlParameter('sort');
    let brand = getUrlParameter('brand');
    let categ = getUrlParameter('categ');
    let kword = getUrlParameter('search')   // add new var to handle keywords

    if (brand !== false) {
        if (brand === 'all') {
            let brandCheckBox = $('input.brand-checkbox');
            brandCheckBox.each(function (i, el) {
                $(this).prop('checked', true);
            });
        } else {
            let splittedBrands = brand.split(',');
            for (let i = 0; i <= splittedBrands.length; i++) {
                $('input[data-brand="' + splittedBrands[i] + '"]').prop('checked', true);
            }
        }
    }

    if (categ !== false) {
        if (categ === 'all') {
            let categCheckBox = $('input.categ-checkbox');
            categCheckBox.each(function (i, el) {
                $(this).prop('checked', true);
            });
        } else {
            let categories = categ.split(',');
            for (let i = 0; i <= categories.length; i++) {
                $('input[data-categ="' + categories[i] + '"]').prop('checked', true);
            }
        }
    }

    if (page === false) {
        page = 1;
    }
    if (limit === false) {
        limit = 20;
    }
    if (sort === false) {
        sort = 'latest';
    }
    if (brand === false) {
        brand = 'all';
    }
    if (categ === false) {
        categ = 'all';
    }

    let url = '';

    // Sorting
    $('li#alkebaSortByLatest').on('click', function () {
        sort = 'latest'
    });
    $('li#alkebaSortByNameAsc').on('click', function () {
        sort = 'name_az'
    });
    $('li#alkebaSortByNameDesc').on('click', function () {
        sort = 'name_za'
    });
    $('li#alkebaSortPriceLowToHigh').on('click', function () {
        sort = 'price_lh'
    });
    $('li#alkebaSortPriceHighToLow').on('click', function () {
        sort = 'price_hl'
    });

    // Limit Data
    $('li#showTwenty').on('click', function () {
        limit = 20
    });
    $('li#showThirty').on('click', function () {
        limit = 30
    });
    $('li#showFourty').on('click', function () {
        limit = 40
    });

    // By Page Number
    $('input#showByPage').on('keyup mouseup', function () {
        page = $(this).val();
        url = url + `page=${page}&limit=${limit}&sort=${sort}`;
        window.location.href = url;
    });

    // Filtering Brand
    $('input#checkboxAllBrand').change(function () {
        brand = 'all';
    });

    $('input.brand-checkbox').change(function () {
        let brandQueryParam = brand;
        let brands = [];
        if (brandQueryParam !== false && brandQueryParam !== 'all') {
            brands = brandQueryParam.split(',');
        }
        let brandId = $(this).data("brand");

        const index = brands.indexOf(brandId);
        if (this.checked === true) {
            brands.push(brandId);
        } else {
            // brands = removeId(brands, brandId);
            // brands = [];
            brand = brands.splice(index, 1);
        }

        brand = brands.join(',');
    });

    // Filtering Category
    $('input#checkAllCateg').change(function () {
        categ = 'all';
    });
    $('input.categ-checkbox').change(function () {
        let categQueryParam = categ;
        let categs = [];
        if (categQueryParam !== false && categQueryParam !== 'all') {
            categs = categQueryParam.split(',');
        }
        let categId = $(this).data("categ");

        const index_categ = categs.indexOf(categId);
        if (this.checked) {
            categs.push(categId);
        } else {
            // categs = removeId(categs, categId);
            // categs = [];
            categ = categs.splice(index_categ, 1);
        }
        categ = categs.join(',');
    });

    // search box
    let searchBox = $('input#searchBox');
    $('button#searchBtn').on('click', function () {
        console.log(searchBox.val())
        let searchValue = searchBox.val();
        // directly adding the whole url to keep it match with the search box result
        url = `/products?search=${searchValue}&page=${page}&limit=${limit}&sort=${sort}&brand=${brand}&categ=${categ}`;
        window.location.href = url;
    });
    

    searchBox.on('keyup', function (e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            let searchValue = $(this).val();
            // same as the first block
            url = `/products?search=${searchValue}&page=${page}&limit=${limit}&sort=${sort}&brand=${brand}&categ=${categ}`;
            window.location.href = url;
        }
    });

    // searchbox value handler
    if (kword.length != 0 && kword != false) {
        if (window.location.pathname !== '/products') {
            $("#searchOrder").attr("value", kword);
        } else {
            $("#searchBox").attr("value", kword);
        }
    }
    
    $('li#alkebaSortByLatest, li#alkebaSortByNameAsc, li#alkebaSortByNameDesc, li#alkebaSortPriceLowToHigh, li#alkebaSortPriceHighToLow, li#showTwenty, li#showThirty, li#showFourty').on('click', function () {
        // adding new logic to handle the results
        // firstly, check if the keyword is exists
        if (kword.length != 0) {
            // then check if the value of keyword is false
            if (kword == false) {
                // if the value is a false boolean, just put the basic url
                url = `/products?page=${page}&limit=${limit}&sort=${sort}&brand=${brand}&categ=${categ}`;
                window.location.href = url;    
                // exit the if block with return 
                return;
            }
            // if the value is not a boolean or actual string, then put it as a whole
            url = `/products?search=${kword}&page=${page}&limit=${limit}&sort=${sort}&brand=${brand}&categ=${categ}`;
            window.location.href = url;
        } 
    });

    $('input#checkboxAllBrand, input.brand-checkbox, input#checkAllCateg, input.categ-checkbox').change(function () {
        url = `/products?page=${page}&limit=${limit}&sort=${sort}&brand=${brand}&categ=${categ}`;
        window.location.href = url;
    });

    // Filtering Terlaris
    $('input#checkProdukTerlaris').change(function () {
        let terlaris = $(this).data("terlaris");

        url = `/products?terlaris=${terlaris}&limit=${limit}&sort=${sort}`;
        window.location.href = url;
    });

    $('input#checkPromoDiskon').change(function () {
        url = `/products-promo?page=${page}&limit=${limit}&sort=${sort}&brand=${brand}&categ=${categ}`;
        window.location.href = url;
    });
});