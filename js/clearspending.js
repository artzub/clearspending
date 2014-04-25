/**
 * Created by artzub on 14.03.14.
 *
 * API for http://clearspending.com
 * https://www.mashape.com/infoculture/clearspending-ru-as-russian-government-spending#!documentation
 */


//for nodejs
var XMLHttpRequest = XMLHttpRequest || require("./../nodejs/node_modules/XMLHttpRequest").XMLHttpRequest;

/**
 * Wrapper for Api ClearSpending.Com
 *
 * @type {{}}
 */
csaw = (function () {
    var csaw = {
        version: '1.1'
    };

    var host = 'https://clearspending.p.mashape.com'
        , version = 'v1'
        , entities = {
            contracts: {select: {}, get: {}, search: {}},
            customers: {select: {}, get: {}, search: {}},
            suppliers: {select: {}, get: {}, search: {}},
            opf: {select: {}},
            regions: {select: {}},
            placing: {select: {}},
            budgetLevels: {select: {}}
        }
        ;

    csaw.ApiKey = ''; // to get him https://www.mashape.com/keys

    function makeInterface(map) {
        for (var key in map) {
            if (!map.hasOwnProperty(key) || !map[key])
                continue;
            Object.keys(map[key]).forEach(addMethod(map[key], key));
        }
    }

    function getSearch(params) {
        var result = []
            , value
            ;
        for (var key in params) {
            if (!params.hasOwnProperty(key))
                continue;
            value = params[key];
            if (typeof value === "undefined"
                || value.toString().length < 1)
                continue;
            result.push(key + '=' + params[key]);
        }
        return result.join('&').toLowerCase();
    }

    function addMethod(obj, entity) {
        return function (action) {
            var url = [
                    host,
                    version,
                    entity,
                    action
                ].join('/')
                ;
            obj[action] = function (params, callback) {
                get(url + '/?' + getSearch(params), callback);
            }
        };
    }

    function respond(xhr, callback) {
        return function() {
            var status = xhr.status;
            if (!status && xhr.responseText || status >= 200 && status < 300 || status === 304) {
                callback(null, xhr);
            } else {
                callback(xhr);
            }
        };
    }

    function get(url, callback) {
        var d3 = d3;
        if(d3) {
            d3.xhr(url)
                .header("X-Mashape-Authorization", csaw.ApiKey)
                //.header("Content-Type", "text/html;charset=utf-8")
                .get(callback);
        }
        else if (XMLHttpRequest) {
            var xhr = new XMLHttpRequest();
            xhr.open('get', url, true);
            xhr.setRequestHeader("X-Mashape-Authorization", csaw.ApiKey);
            if (callback) {
                "onload" in xhr
                    ? xhr.onload = xhr.onerror = respond(xhr, callback)
                    : xhr.onreadystatechange = function() {
                        xhr.readyState > 3 && respond(xhr, callback)();
                    };
            }
            xhr.send();
        }
        else if (callback) {
            callback({message : "Operation don't supported."});
        }
    }

    makeInterface(entities);

    function Request(action, params) {
        var that = this;
        for (var key in params) {
            if (params.hasOwnProperty(key))
                that[key] = params[key];
        }
        function updateParams() {
            for (var key in params) {
                if (params.hasOwnProperty(key) && that.hasOwnProperty(key))
                    params[key] = that[key];
            }
        }
        this.get = function (callback) {
            updateParams();
            action(params, callback);
        };
    }

    /**
     * /v1/contracts/select/
     * Выборка контрактов
     * Список контрактов отфильтрованных по заданным параметрам
     *
     * @returns {Request} with properties {
     *      budgetLevel: string,
     *      customerInn: string,
     *      customerKpp: string,
     *      customerRegion: string,
     *      dateRange: string,
     *      okdp: string,
     *      page: string,
     *      perPage: string,
     *      placing: string,
     *      priceRange: string,
     *      regNum: string,
     *      returnFields: string,
     *      sort: string,
     *      supplierInn: string,
     *      supplierKpp: string
     * }
     * @constructor
     */
    csaw.RequestContractsSelect = function () {
        return new Request(entities.contracts.select, {
            budgetLevel: "", // Уровень бюджета 	Example: 02
            customerInn: "", // ИНН заказчика 	Example: 6504020670
            customerKpp: "", // КПП заказчика 	Example: 650401001
            customerRegion: "", // Код региона заказчика 	Example: 65
            dateRange: "", // Диапазон дат заключения контракта 	Example: 27.01.2011-01.02.2011
            okdp: "", // Код продукции по ОКДП 	Example: 1520110
            page: "", // Номер страницы выборки 	Example: 1
            perPage: "", // Число элементов выводимых за раз 	Example: 50
            placing: "", // Код способа размещения заказа 	Example: 5
            priceRange: "", // Диапазон сумм контракта 	Example: 300000-400000
            regNum: "", // Номер реестровой записи контракта 	Example: 0361300001711000053
            returnFields: "", // Список вида '[field1, field2, …, fieldN]', ограничивающий перечень полей в возвращаемых в ответ на запрос документах 	Example: [price,regNum,products]
            sort: "", // Сортировка списка документов по возрастанию и убыванию. Допустимые значения: price, -price, signDate, -signDate 	Example: price
            supplierInn: "", // ИНН поставщика 	Example: 6504016811
            supplierKpp: "" // КПП поставщика 	Example: 650401001
        });
    };

    /**
     * /v1/contracts/search/
     * Информация о контакте
     * Получение подробной информации о контракте по его номеру реестровой записи
     *
     * @returns {Request} with properties {regNum: string}
     * @constructor
     */
    csaw.RequestContractsGet = function () {
        return new Request(entities.contracts.get, {
            regNum: "" // Номер реестровой записи контракта Example: 0356200021512000012
        });
    };

    /**
     * /v1/contracts/search/
     * Поиск контрактов
     * Список контрактов отфильтрованных по заданным параметрам
     *
     * @returns {Request} with properties {budgetLevel: string, customerInn: string, customerKpp: string, customerRegion: string, dateRange: string, okdp: string, page: string, perPage: string, placing: string, priceRange: string, productSearch: string, regNum: string, returnFields: string, supplierInn: string, supplierKpp: string}
     * @constructor
     */
    csaw.RequestContractsSearch = function () {
        return new Request(entities.contracts.search, {
            budgetLevel: "", // Уровень бюджета 	Example: 02
            customerInn: "", // ИНН заказчика 	Example: 6504020670
            customerKpp: "", // КПП заказчика 	Example: 650401001
            customerRegion: "", // Код региона заказчика 	Example: 59
            dateRange: "", // Диапазон дат заключения контракта 	Example: 27.01.2011-01.02.2011
            okdp: "", // Код продукции по ОКДП 	Example: 1520110
            page: "", // Номер страницы выборки 	Example: 1
            perPage: "", // Число элементов выводимых за раз 	Example: 50
            placing: "", // Способ размещения заказа 	Example: 5
            priceRange: "", // Диапазон сумм контракта 	Example: 300000-400000
            productSearch: "", // Текст для поиска по предмету контракта 	Example: молоко
            regNum: "", // Номер реестровой записи контракта 	Example: 0361300001711000053
            returnFields: "", // Список вида '[field1, field2, …, fieldN]', ограничивающий перечень полей в возвращаемых в ответ на запрос документах 	Example: [price,regNum,products]
            supplierInn: "", // ИНН поставщика 	Example: 6504016811
            supplierKpp: "" // КПП поставщика 	Example: 650401001
        });
    };

    /**
     * /v1/customers/select/
     * Выборка заказчиков
     * Список заказчиков отфильтрованных по заданным параметрам
     *
     * @returns {Request} with properties {inn: string, kladRegion: string, kpp: string, name: string, ogrn: string, okato: string, okogu: string, okpo: string, okved: string, orgType: string, page: string, perPage: string, regionCode: string, returnFields: string, spzRegNum: string, subordination: string}
     * @constructor
     */
    csaw.RequestCustomersSelect = function () {
        return new Request(entities.customers.select, {
            inn: "", //ИНН заказчика Example: 1811003621",
            kladRegion: "", //Код региона по КЛАДР Example: 18000000000",
            kpp: "", //КПП заказчика Example: 183801001",
            name: "", //Полное и точное назавание заказчика Example: Муниципальное бюджетное общеобразовательное учреждение 'Арзамасцевская средняя общеобразовательная школа'",
            ogrn: "", //ОГРН заказчика Example: 1021800860487",
            okato: "", //ОКАТО заказчика Example: 94222811000",
            okogu: "", //Код ОКОГУ заказчика Example: 4210007",
            okpo: "", //ОКПО заказчика Example: 54469414",
            okved: "", //ОКВЭД заказчика Example: 80.21.2",
            orgType: "", //Код организационной форма, типа организации Example: 3",
            page: "", //Номер страницы выборки Example: 1",
            perPage: "", //Число элементов выводимых за раз Example: 50",
            regionCode: "", //Код региона Example: 18",
            returnFields: "", //Список вида '[field1, field2, …, fieldN]', ограничивающий перечень полей в возвращаемых в ответ на запрос документах Example: [inn,kpp]",
            spzRegNum: "", //Уникальный идентификатор заказчика (из СПЗ — сводного перечня заказчиков) Example: 03133001560",
            subordination: "" //Код уровня заказчика: федеральный, субъекта федерации, местное самоуправление Example: 3"
        });
    };

    /**
     * /v1/customers/get/
     * Информация о заказчике
     * Получение подробной информации о заказчике по его уникальному коду
     *
     * @returns {Request} with properties {spzRegNum: string}
     * @constructor
     */
    csaw.RequestCustomersGet = function () {
        return new Request(entities.customers.get, {
            spzRegNum: "" //Уникальный идентификатор заказчика (из СПЗ — сводного перечня заказчиков) Example: 01693000143"
        });
    };

    /**
     * /v1/customers/search/
     * Поиск заказчиков
     * Список заказчиков отфильтрованных по заданным параметрам
     *
     * @returns {Request} with properties {inn: string, kladRegion: string, kpp: string, name: string, nameSearch: string, ogrn: string, okato: string, okogu: string, okpo: string, okved: string, orgType: string, page: string, perPage: string, regionCode: string, returnFields: string, spzRegNum: string, subordination: string}
     * @constructor
     */
    csaw.RequestCustomersSearch = function () {
        return new Request(entities.customers.search, {
            inn: "", //ИНН заказчика Example: 1811003621"
            kladRegion: "", //Код региона по КЛАДР Example: 18000000000"
            kpp: "", //КПП заказчика Example: 183801001"
            name: "", //Полное и точное назавание заказчика Example: Муниципальное бюджетное общеобразовательное учреждение 'Арзамасцевская средняя общеобразовательная школа'"
            nameSearch: "", //Текст для поиска по названию Example: больница"
            ogrn: "", //ОГРН заказчика Example: 1021800860487"
            okato: "", //ОКАТО заказчика Example: 94222811000"
            okogu: "", //Код ОКОГУ заказчика Example: 4210007"
            okpo: "", //ОКПО заказчика Example: 54469414"
            okved: "", //ОКВЭД заказчика Example: 80.21.2"
            orgType: "", //Код организационной форма, типа организации Example: 3"
            page: "", //Номер страницы выборки Example: 1"
            perPage: "", //Число элементов выводимых за раз Example: 50"
            regionCode: "", //Код региона Example: 18"
            returnFields: "", //Список вида '[field1, field2, …, fieldN]', ограничивающий перечень полей в возвращаемых в ответ на запрос документах	 Example: [inn,kpp]"
            spzRegNum: "", //Уникальный идентификатор заказчика (из СПЗ — сводного перечня заказчиков) Example: 03133001560"
            subordination: "" //Код уровня заказчика: федеральный, субъекта федерации, местное самоуправление Example: 3"
        });
    };

    /**
     * /v1/opf/select/
     * Список организационно-правовых форм
     * Перечень кодов организационно-правовых форм, втрецающихся в данных
     *
     * @returns {Request} with properties {opf: string}
     * @constructor
     */
    csaw.RequestOpfSelect = function () {
        return new Request(entities.opf.select, {
            opf: "" //Example: all
        });
    };

    /**
     * /v1/region/select/
     * Справочник регионов
     * Выборака регионов по различным кодам
     *
     * @returns {Request} with properties {kladr: string, okato: string, regionCode: string}
     * @constructor
     */
    csaw.RequestRegionSelect = function () {
        return new Request(entities.regions.select, {
            kladr: "", //Код КЛАДР для региона Example: 7700000000000
            okato: "", //Код ОКАТО для региона Example: 45000000
            regionCode: "all" //Код региона или 'all' для получения полного списка регионов Example: all
        });
    };

    /**
     * /v1/placing/select/
     * Справочник типов размещения контракта
     * Выборка типа размещения контракта по коду
     *
     * @returns {Request} with properties {code: string}
     * @constructor
     */
    csaw.RequestPlacingSelect = function () {
        return new Request(entities.placing.select, {
            code: "" //Example: all
        });
    };

    /**
     * /v1/budgetlevels/select/
     * Справочник уровней бюджета
     * Выборка уровеня бюджета по коду
     *
     * @returns {Request} with properties {level: string}
     * @constructor
     */
    csaw.RequestBudgetLevelsSelect = function () {
        return new Request(entities.budgetLevels.select, {
            level: "" //Код уровня бюджета или "all" для получения полного списка уровней бюджета Example: all
        });
    };

    /**
     * /v1/suppliers/select/
     * Выборка подрядчиков
     * Список подрядчиков отфильтрованных по заданным параметрам
     *
     * @returns {Request} with properties {inBlackList: string, inn: string, kpp: string, orgForm: string, page: string, perPage: string, regionCode: string, returnFields: string}
     * @constructor
     */
    csaw.RequestSuppliersSelect = function () {
        return new Request(entities.suppliers.select, {
            inBlackList: "", //Наличие поставщика в реестре недобросовестных поставщиков Example: false"
            inn: "", //ИНН поставщика Example: 2320143971"
            kpp: "", //КПП поставщика Example: 231901001"
            orgForm: "", //Организационаая форма поставщика Example: OOO"
            page: "", //Номер страницы выборки Example: 1"
            perPage: "", //Число элементов выводимых за раз"
            regionCode: "", //Код региона Example: 23"
            returnFields: "" //Список вида '[field1, field2, …, fieldN]', ограничивающий перечень полей в возвращаемых в ответ на запрос документах Example: [inn,kpp]"
        });
    };

    /**
     * /v1/suppliers/get/
     * Информация о подрядчике
     * Получение подробной информации о заказчике по его ИНН и КПП
     *
     * @returns {Request} with properties {inn: string, kpp: string}
     * @constructor
     */
    csaw.RequestSuppliersGet = function () {
        return new Request(entities.suppliers.get, {
            inn: "", //ИНН поставщика Example: 2320143971"
            kpp: "" //КПП поставщика Example: 231901001"
        });
    };

    /**
     * /v1/suppliers/search/
     * Поиск подрядчиков
     * Список подрядчиков отфильтрованных по заданным параметрам
     *
     * @returns {Request} with properties {inBlackList: string, inn: string, kpp: string, nameSearch: string, orgForm: string, page: string, perPage: string, regionCode: string, returnFields: string}
     * @constructor
     */
    csaw.RequestSuppliersSearch = function () {
        return new Request(entities.suppliers.search, {
            inBlackList: "", //Наличие поставщика в реестре недобросовестных поставщиков Example: false"
            inn: "", //ИНН поставщика Example: 2320143971"
            kpp: "", //КПП поставщика Example: 231901001"
            nameSearch: "", //Текст для поиска по названию Example: сервис"
            orgForm: "", //Организационаая форма поставщика Example: OOO"
            page: "", //Номер страницы выборки Example: 1"
            perPage: "", //Число элементов выводимых за раз Example: 50"
            regionCode: "", //Код региона Example: 23"
            returnFields: "" //Список вида '[field1, field2, …, fieldN]', ограничивающий перечень полей в возвращаемых в ответ на запрос документах Example: [inn,kpp]"
        });
    };
    return csaw;
})();

module &&
    (module.exports = csaw);