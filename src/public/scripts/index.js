const InitTables = {} // Esta constante contienen lso metodos que inicilizan las diferentes tablas de la aplicacion
$(document).ready(function() {

    // Search select fields 
    $('#IdUsuario').selectize({
        sortField: 'text'
    });

    InitTables.RecursosTable();
    initCharts();

    $('#colObra').hide();
    $('#colDepto').hide();
    $('#colCot').hide();

    $('#IdUsuario').hide();
    $('.hideUser').hide();

    $('#IdInputTipoAsignacion').on('change', function() {
        var optionValue = $(this).val();
        //var TipoAsignacion = $("#IdInputTipoAsignacion option:selected").text();
        //alert(TipoAsignacion)

        switch (optionValue) {
            case '1': //#IdInputTipoAsignacion
                // indirecto 
                $('#IdInputObra').val('0');
                $('#colObra').hide();
                /*
                $('#colDepto').show();

                $('#IdInputObra').val("0");
                $('#colObra').hide();
                $('#IdInputCotizacion').val("0");
                $('#colCot').hide();*/

                break;
            case '2':
                //Gastos de Obra
                $('#colObra').show();

                /*
                $('#IdInputDepto').val('0');
                $('#colDepto').hide();

                $('#IdInputCotizacion').val('0');
                $('#colCot').hide();*/
                break;
            case '3':
                // A usuario
                $('#IdInputObra').val('0');
                $('#colObra').hide();

                /*
                $('#IdInputDepto').val('0');
                $('#colDepto').hide();

                $('#IdInputCotizacion').val('0');
                $('#colCot').hide();*/
                break;

            case '4':
                //Generales
                $('#IdInputObra').val('0');
                $('#colObra').hide();

                /* $('#colCot').show();

                 $('#IdInputObra').val('0');
                 $('#colObra').hide();

                 $('#IdInputDepto').val('0');
                 $('#colDepto').hide();*/
                break;

            case '5':
                //Financiamiento

                $('#IdInputObra').val('0');
                $('#colObra').hide();

                /*            
                $('#colCot').show();

                $('#IdInputObra').val('0');
                $('#colObra').hide();

                $('#IdInputDepto').val('0');
                $('#colDepto').hide();*/
                break;

            default:
                break;
        }
    });
    $('#IdTipoComprobante').on('change', function() {
        var optionValue = $(this).val();

        switch (optionValue) {
            case '1':
                // Comprobación 
                $('#IdRubro').show();
                $('#IdContribuyente').show();
                $('#IdFolioNotaFactura').show();

                $('.hideCol').show();
                $('.hideUser').hide();

                $('#IdInputTipoAsignacion').val('0');
                $('#IdInputTipoAsignacion').removeAttr('required');

                $('#IdUsuario').val('0');
                $('#IdUsuario').removeAttr('required');
                break;
            case '2':
                //Reasignación    
                $('#IdRubro').val('0');
                $('#IdRubro').removeAttr('required');

                $('#IdContribuyente').val(null);
                $('#IdContribuyente').removeAttr('required');

                $('#IdFolioNotaFactura').val(null);
                $('#IdFolioNotaFactura').removeAttr('required');

                $('.hideCol').hide();
                $('.hideUser').show();

                $('#IdUsuario').show();
                break;

            default:
                break;
        }
    });
    $('#modalAsignaciones').click(function() {
        $('#table_Comprobar').ajax.reload();
    });

});

InitTables.RecursosTable = () => {
    const tableConfig = {
        //para cambiar el lenguaje a español
        language: {
            url: "//cdn.datatables.net/plug-ins/1.10.20/i18n/Spanish.json",
        },
        responsive: {
            details: {
                display: $.fn.dataTable.Responsive.display.modal({
                    header: function(row) {
                        var data = row.data();
                        return 'Details for ' + data[0] + ' ' + data[1];
                    }
                }),
                renderer: $.fn.dataTable.Responsive.renderer.tableAll({
                    tableClass: 'table'
                })
            }
        },
        dom: '<"container-fluid bg-dark  "<"text-center"B><"row p-0"<"col-sm-12 p-0 bg-table "fltip>>>',
        buttons: [
            'copy', 'csv', 'excel', 'pdf', 'print'
        ]
    }
    const appendedTable = {
        //Configuracion de tabla comprobaciones
        language: {
            url: "//cdn.datatables.net/plug-ins/1.10.20/i18n/Spanish.json",
        },
        "pageLength": 50,
        responsive: true,
        dom: '<"container-fluid pt-2 "<"text-center"B><"row p-0"<"col-sm-12 p-1 bg-table "lit>>>',
        buttons: [
            'copy', 'csv', 'excel', 'pdf', 'print'
        ]
    }
    const AsignacionesTable = {
        //Configuracion de tabla comprobaciones
        language: {
            url: "//cdn.datatables.net/plug-ins/1.10.20/i18n/Spanish.json",
        },
        "pageLength": 10,
        responsive: {
            details: {
                display: $.fn.dataTable.Responsive.display.modal({
                    header: function(row) {
                        var data = row.data();
                        return 'Detalles del id ' + data[0];
                    }
                }),
                renderer: $.fn.dataTable.Responsive.renderer.tableAll({
                    tableClass: 'bg-dark text-white'
                })
            }
        },
        dom: '<"container-fluid bg-dark  "<"text-center"B><"row p-0"<"col-sm-12 p-0 bg-table "fltip>>>',
        buttons: [
            'copy', 'csv', 'excel', 'pdf', 'print'
        ]
    }
    const asignacionesEmitidas = {
        //Configuracion de tabla modal Asignaciones emitidas
        language: {
            url: "//cdn.datatables.net/plug-ins/1.10.20/i18n/Spanish.json",
        },
        responsive: {
            details: {
                display: $.fn.dataTable.Responsive.display.modal({
                    header: function(row) {
                        var data = row.data();
                        return 'Detalles del Id: ' + data[0];
                    }
                }),
                renderer: $.fn.dataTable.Responsive.renderer.tableAll({
                    tableClass: 'bg-dark text-white'
                })
            }
        },
        dom: '<"container-fluid bg-dark"<"text-center"B><"row p-0 "<"col-sm-12 p-0 bg-table"fltip>>>',
        buttons: [
            'copy', 'csv', 'excel', 'pdf', 'print'
        ]
    }
    $('#table_asignarRecursos').DataTable(tableConfig);
    $('#table_comprobacionGastos').DataTable(tableConfig);
    $('#table_verAsignaciones').DataTable(AsignacionesTable);
    $('#table_asignacionesEmitidas').DataTable(asignacionesEmitidas);
    $('#table_Comprobar').DataTable(appendedTable);
};

function initCharts() {

    const DATA_COUNT = 5;
    const NUMBER_CFG = { count: DATA_COUNT, min: 0, max: 100 };

    const data = {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.9)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    }

    const config = {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Chart.js Pie Chart'
                }
            }
        },
    };
    var ctx = document.getElementById('myChart');
    var myChart = new Chart(ctx, config);
}


/*
// Example starter JavaScript for disabling form submissions if there are invalid fields
(function() {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
        .forEach(function(form) {
            form.addEventListener('submit', function(event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }

                form.classList.add('was-validated')
            }, false)
        })
})()*/

function hideRow() {
    $('#tableForm').attr("hidden", true);
}

function showRow() {
    $('#tableForm').removeAttr("hidden");
}