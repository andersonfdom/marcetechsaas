// ===== VARIÁVEL GLOBAL =====
const idMarceneiro = document.getElementById('IdMarceneiro')?.value || '';

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function () {
    InicializarPagina();
});

async function InicializarPagina() {
    Swal.fire({
        title: 'Carregando...',
        text: 'Buscando dados do item',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    // Listar categorias (popula combo)
    ListarDadosCategoria();

    const id = document.getElementById('id')?.value || '';
    if (id !== '') {
        CarregarDadosItemAmbienteOrcamento(id);
    }
}

function ListarDadosCategoria() {
    const idcategoria = document.getElementById('idcategoria');
    if (!idcategoria) return;

    const xmlhttp = new XMLHttpRequest();
    const theUrl = "/ListarDadosCategoria?idMarceneiro=" + idMarceneiro;

    xmlhttp.open("POST", theUrl, false);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4) {
            if (xmlhttp.status === 200) {
                const retornoApi = JSON.parse(xmlhttp.responseText);
                let options = "";

                retornoApi.forEach(function (dados) {
                    options += `<option value="${dados.id}">${escapeHtml(dados.nome)}</option>`;
                });

                idcategoria.innerHTML = options;

                // Se houver valor selecionado, carrega os itens da categoria
                if (idcategoria.value) {
                    CarregarDadosCategoria(idcategoria.value);
                } else {
                    Swal.close(); // Fecha loading se vazio
                }
            } else {
                Swal.fire("Erro", "Erro ao listar categorias", "error");
            }
        }
    };
    xmlhttp.send();
}

function CarregarDadosCategoria(idCategoria) {
    const iditemcategoria = document.getElementById('iditemcategoria');
    if (!iditemcategoria) return;

    const xmlhttp = new XMLHttpRequest();
    const theUrl = "/CarregarDadosCategoria?id=" + idCategoria;

    xmlhttp.open("POST", theUrl, false);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4) {
            if (xmlhttp.status === 200) {
                const retornoApi = JSON.parse(xmlhttp.responseText);
                let options = "";

                if (retornoApi.itens) {
                    retornoApi.itens.forEach(function (dados) {
                        options += `<option value="${dados.id}">${escapeHtml(dados.descricao)}</option>`;
                    });
                }

                iditemcategoria.innerHTML = options;

                executarCalculo();
                Swal.close(); // Fecha loading após última carga
            } else {
                Swal.fire("Erro", "Erro ao carregar itens", "error");
            }
        }
    };
    xmlhttp.send();
}

function CarregarDadosItemAmbienteOrcamento(id) {
    const xmlhttp = new XMLHttpRequest();
    const theUrl = "/CarregarDadosItemAmbienteOrcamento?id=" + id;

    xmlhttp.open("POST", theUrl, false);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            const retornoApi = JSON.parse(xmlhttp.responseText);

            document.getElementById('id').value = retornoApi.id || '';
            document.getElementById('idorcamentoambiente').value = retornoApi.idorcamentoambiente || '';
            document.getElementById('idorcamento').value = retornoApi.idorcamento || '';
            document.getElementById('idcategoria').value = retornoApi.idcategoria || '';
            document.getElementById('iditemcategoria').value = retornoApi.iditemcategoria || '';
            document.getElementById('largura').value = retornoApi.largura || '';
            document.getElementById('altura').value = retornoApi.altura || '';
            document.getElementById('qtde').value = retornoApi.qtde || '';
            document.getElementById('valorunitario').value = retornoApi.valorunitario || '';
            document.getElementById('valortotal').value = retornoApi.valortotal || '';

            CarregarDadosCategoria(document.getElementById('idcategoria').value);
        }
    };
    xmlhttp.send();
}

function executarCalculo() {
    const id = document.getElementById('id')?.value === '' ? "0" : document.getElementById('id').value;
    const IdItemCategoria = document.getElementById('iditemcategoria')?.value;
    const Largura = document.getElementById('largura')?.value;
    const Altura = document.getElementById('altura')?.value;
    const Qtde = document.getElementById('qtde')?.value;

    const dadosCalculoValores = {
        IdItemCategoria: parseInt(IdItemCategoria),
        FormulaCalculoCategoria: "",
        Largura: parseFloat(Largura?.replace(',', '.') || 0),
        Altura: parseFloat(Altura?.replace(',', '.') || 0),
        Qtde: parseInt(Qtde) || 0
    };

    const xmlhttp = new XMLHttpRequest();
    const theUrl = "/CalcularValores";

    xmlhttp.open("POST", theUrl, false);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            const retorno = JSON.parse(xmlhttp.responseText);
            const formulaCalculoCategoria = retorno.formulaCalculoCategoria;

            alternarEstadoCampo('valorunitario', true);
            alternarEstadoCampo('valortotal', true);

            document.getElementById('valorunitario').value = retorno.valorUnitario;
            document.getElementById('valortotal').value = retorno.valorTotal;

            alternarEstadoCampo('valorunitario', false);
            alternarEstadoCampo('valortotal', false);

            if (formulaCalculoCategoria === '(largura * altura) * valor') {
                alternarEstadoCampo('altura', true);
                alternarEstadoCampo('largura', true);

                document.getElementById('altura').value = retorno.alturaPadrao ?? 0;
                document.getElementById('largura').value = retorno.largura ?? 0;
                document.getElementById('qtde').value = 0;

                alternarEstadoCampo('qtde', false);
            } else {
                alternarEstadoCampo('altura', false);
                alternarEstadoCampo('largura', false);

                document.getElementById('altura').value = 0;
                document.getElementById('largura').value = 0;
                document.getElementById('qtde').value = retorno.qtde ?? 0;

                alternarEstadoCampo('qtde', true);
            }
        }
    };
    xmlhttp.send(JSON.stringify(dadosCalculoValores));
}

function handleSalvar() {
    const iditemorcamentoambiente = parseInt(document.getElementById('id')?.value, 10) || 0;
    const idorcamentoambiente = document.getElementById('idorcamentoambiente')?.value;
    const idorcamento = document.getElementById('idorcamento')?.value;
    const idcategoria = document.getElementById('idcategoria')?.value;
    const iditemcategoria = document.getElementById('iditemcategoria')?.value;
    const largura = document.getElementById('largura')?.value;
    const altura = document.getElementById('altura')?.value;
    const qtde = document.getElementById('qtde')?.value;
    const valorunitario = document.getElementById('valorunitario')?.value;
    const valortotal = document.getElementById('valortotal')?.value;

    const dto = {
        Id: iditemorcamentoambiente,
        Idorcamentoambiente: parseInt(idorcamentoambiente),
        Idorcamento: parseInt(idorcamento),
        Formulacalculocategoria: '',
        idcategoria: parseInt(idcategoria),
        Iditemcategoria: parseInt(iditemcategoria),
        Largura: largura,
        Altura: altura,
        Qtde: parseInt(qtde) || 0,
        Valorunitario: valorunitario,
        Valortotal: valortotal
    };

    const xmlhttp = new XMLHttpRequest();
    const theUrl = "/SalvarDadosItemAmbienteOrcamento";

    xmlhttp.open("POST", theUrl, false);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            const retorno = JSON.parse(xmlhttp.responseText);
            if (retorno.sucesso === true) {
                Swal.fire({
                    title: retorno.mensagem,
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = `/Orcamentos/AmbienteOrcamento?idOrcamento=${idorcamento}&idAmbienteOrcamento=${idorcamentoambiente}`;
                });
            } else {
                Swal.fire({ title: retorno.mensagem, icon: "error" });
            }
        }
    };
    xmlhttp.send(JSON.stringify(dto));
}

function alternarEstadoCampo(id, deveHabilitar) {
    const el = document.getElementById(id);
    if (el) el.disabled = !deveHabilitar;
}

function toDecimal(v) {
    if (!v) return 0;
    return parseFloat(v.toString().replace(/\./g, '').replace(',', '.')) || 0;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}