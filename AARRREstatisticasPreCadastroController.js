eAssinatura.controller('AARRREstatisticasPreCadastroController', ['$scope', '$http', 'blockService', 'notifyService', '$filter', 'ngTableParams', '$rootScope',
    function ($scope, $http, blockService, notifyService, $filter, ngTableParams, $rootScope) {

        //FUNCTIONS
        $scope.DadosEncontrados = function (dados) {
            return (dados && dados.length > 0);
        };

        $scope.GetFiltroPadrao = function () {
            return {
                inicio: moment().lang('pt-br').subtract('months', 1).calendar(),
                fim: moment().lang('pt-br').format('L')
            };
        };

        $scope.ObtemTotalPorTipoPFPJ = function (linq) {
            var agrupado =linq.GroupBy("$.tipo", "", "k,e => { tipo:k, total:e.Sum('$.total|0') }");

            var dataPFPJEInvalido = [
                { tipo: "PF", total: agrupado.FirstOrDefault({ total: 0 }, "$.tipo=='PF'").total },
                { tipo: "PJ", total: agrupado.FirstOrDefault({ total: 0 }, "$.tipo=='PJ'").total }
            ];

            if (agrupado.FirstOrDefault({ total: 0 }, "$.tipo=='Incorreto'").total > 0) {
                dataPFPJEInvalido.push({ tipo: "Incorreto", total: agrupado.FirstOrDefault({ total: 0 }, "$.tipo=='Incorreto'").total });
            }

            return dataPFPJEInvalido;
        }

        $scope.ObtemTotalPorAC = function (linq) {
            return linq.GroupBy("$.ac", "", "k,e => { ac:k, total:e.Sum('$.total|0') }").ToArray();
        }

        $scope.RefreshEstatisticasPreCadastro = function () {
            blockService.block('estatisticas-precadastro');

            $http.get('/API/Estatistica/PreCadastro?inicio=' + $scope.filtro.inicio + '&fim=' + $scope.filtro.fim)
                .success(function (data) {

                    var linq = Enumerable.From(data.preCadastros);

                    $scope.dataPFPJEInvalido = $scope.ObtemTotalPorTipoPFPJ(linq);
                    $scope.dataAC = $scope.ObtemTotalPorAC(linq);

                    //$scope.dataEstatisticasPreCadastro = result;


                    //TODO!!! 
                    //"D:\Renato\Dropbox\Inspira\Projetos\Certisign\EAS-1898\js_linq.js"


                    if ($scope.tableEstatisticasPreCadastroAC !== null) {
                        $scope.tableEstatisticasPreCadastroAC.reload();
                    }

                    blockService.unblock('estatisticas-precadastro');
                }).error(function (data, status) {
                    blockService.unblock('estatisticas-precadastro');
                    notifyService.errorModel(data, 'Erro ao recuperar estatisticas de PreCadastro.', status);
                });

        }

        $scope.GetTotalResultados = function () {
            //var total = 0;
            //for (var i = 0; i < $scope.dataEstatisticasResultados.length; i++) {
            //    var status = $scope.dataEstatisticasResultados[i];
            //    total += status.total;
            //}
            //return total;
        }

        //ACTION
        $scope.ListarEstatisticas = function () {
            $scope.RefreshEstatisticasPreCadastro();
        };


        //CLICK
        $scope.FiltrarClick = function () {
            $scope.RefreshEstatisticasPreCadastro();
        };

        //SHOW

        //INIT
        $scope.dataEstatisticasPreCadastro = [];
        $scope.dataPFPJEInvalido = [];

        $scope.dataAC = [];
        $scope.getDataAC = function () { return $scope.dataAC; }

        $scope.filtro = $scope.GetFiltroPadrao();
        $scope.FiltrarClick();


        $scope.CreateNgTable = function (getDataObj, page, count, sorting) {
            page = defaultFor(page, 1);
            return new ngTableParams({ page: page, count: count, sorting: sorting }, {
                counts: [],
                total: getDataObj().length,
                getData: function ($defer, params) {
                    var orderedData = params.sorting() ? $filter('orderBy')(getDataObj(), params.orderBy()) : getDataObj();
                    orderedData = params.filter() ? $filter('filter')(orderedData, params.filter()) : orderedData;
                    params.total(orderedData.length);
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            });
        }

        $scope.tableEstatisticasPreCadastroAC = $scope.CreateNgTable($scope.getDataAC, count= 99999, null);


        //$scope.getDataAC = function () {
        //    return $scope.dataAC;
        //}

        //$scope.CreateNgTable = function (count, data) {
        //    return new ngTableParams({ count: count }, {
        //        counts: [],
        //        total: data().length,
        //        getData: function ($defer, params) {
        //            var orderedData = params.sorting() ? $filter('orderBy')(data(), params.orderBy()) : data();
        //            orderedData = params.filter() ? $filter('filter')(orderedData, params.filter()) : orderedData;
        //            params.total(orderedData.length);
        //            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        //        }
        //    });
        //}

        //$scope.tableEstatisticasPreCadastroAC = $scope.CreateNgTable(99999, $scope.getDataAC);


        //    new ngTableParams({ count: 99999 }, {
        //    counts: [],
        //    total: $scope.dataEstatisticasPreCadastro.length,
        //    getData: function ($defer, params) {
        //        var orderedData = params.sorting() ? $filter('orderBy')($scope.dataEstatisticasPreCadastro, params.orderBy()) : $scope.dataEstatisticasPreCadastro;
        //        orderedData = params.filter() ? $filter('filter')(orderedData, params.filter()) : orderedData;
        //        params.total(orderedData.length);
        //        $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        //    }
        //});



        //$scope.ListarEstatisticas();

    }
]);

