// ===== INICIALIZAÇÃO APÓS DOM CARREGADO =====
document.addEventListener('DOMContentLoaded', function () {
    Swal.fire({
        title: 'Carregando...',
        text: 'Buscando dados do ambiente',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    const idAmbienteOrcamento = document.getElementById('idAmbienteOrcamento')?.value || '';
    const IdMarceneiro = document.getElementById('IdMarceneiro')?.value || '';

    ListarDadosAmbiente(IdMarceneiro);

    if (idAmbienteOrcamento !== '') {
        alternarEstadoCampo('idambiente', false);
        CarregarDadosAmbienteOrcamento(idAmbienteOrcamento);
        ListarDadosItemAmbienteOrcamento(idAmbienteOrcamento);
    } else {
        alternarEstadoCampo('idambiente', true);
    }

    Swal.close();
});

// ===== LISTAR AMBIENTES (COMBO) =====
function ListarDadosAmbiente(IdMarceneiro) {
    const idambiente = document.getElementById('idambiente');
    if (!idambiente) return;

    let dadosidambiente = "";
    idambiente.innerHTML = dadosidambiente;

    const xmlhttp = new XMLHttpRequest();
    const theUrl = "/ListarDadosAmbiente?idMarceneiro=" + IdMarceneiro;

    xmlhttp.open("POST", theUrl, false);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4) {
            if (xmlhttp.status === 200) {
                const retornoApi = JSON.parse(xmlhttp.responseText);
                retornoApi.forEach(function (dados) {
                    dadosidambiente += `<option value="${dados.id}">${escapeHtml(dados.nome)}</option>`;
                });
                idambiente.innerHTML = dadosidambiente;
            } else {
                Swal.fire("Erro", "Erro ao carregar itens", "error");
            }
        }
    };
    xmlhttp.send();
}

// ===== HABILITAR/DESABILITAR CAMPO =====
function alternarEstadoCampo(id, deveHabilitar) {
    const el = document.getElementById(id);
    if (el) el.disabled = !deveHabilitar;
}

// ===== CARREGAR DADOS DO AMBIENTE ORÇAMENTO =====
function CarregarDadosAmbienteOrcamento(idAmbienteOrcamento) {
    const xmlhttp = new XMLHttpRequest();
    const theUrl = "/CarregarDadosAmbienteOrcamento?id=" + idAmbienteOrcamento;

    xmlhttp.open("POST", theUrl, false);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            const retornoApi = JSON.parse(xmlhttp.responseText);
            document.getElementById('idambiente').value = retornoApi.idambiente || '';
            document.getElementById('idAmbienteOrcamento').value = retornoApi.id || '';
            document.getElementById('descricao').value = retornoApi.descricao || '';
        }
    };
    xmlhttp.send();
}

// ===== LISTAR ITENS DO AMBIENTE ORÇAMENTO (TABELA) =====
function ListarDadosItemAmbienteOrcamento(idAmbienteOrcamento) {
    const tabelaItensAmbiente = document.getElementById('tabelaItensAmbiente');
    if (!tabelaItensAmbiente) return;

    let dadostabelaItensAmbiente = "";
    tabelaItensAmbiente.innerHTML = dadostabelaItensAmbiente;

    const xmlhttp = new XMLHttpRequest();
    const theUrl = "/ListarDadosItemAmbienteOrcamento?idAmbienteOrcamento=" + idAmbienteOrcamento;

    xmlhttp.open("POST", theUrl, false);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            const retornoApi = JSON.parse(xmlhttp.responseText);
            retornoApi.forEach(function (dados) {
                dadostabelaItensAmbiente += `
                    <tr>
                        <td>${escapeHtml(dados.categoriaItem)}</td>
                        <td>${escapeHtml(dados.item)}</td>
                        <td>${escapeHtml(dados.largura)}</td>
                        <td>${escapeHtml(dados.altura)}</td>
                        <td>${escapeHtml(dados.qtde)}</td>
                        <td>${escapeHtml(dados.valorUnitario)}</td>
                        <td>${escapeHtml(dados.valorTotal)}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="CarregarDadosItemAmbienteOrcamento(${dados.id})" title="Editar"><i class="fas fa-edit botaoItemDados"></i></button>
                            <button class="btn btn-danger btn-sm" onclick="ExcluirDadosItemAmbienteOrcamento(${dados.id})" title="Excluir"><i class="fas fa-trash botaoItemDados"></i></button>
                        </td>
                    </tr>
                `;
            });
            tabelaItensAmbiente.innerHTML = dadostabelaItensAmbiente;
        }
    };
    xmlhttp.send();
}

// ===== SALVAR/ATUALIZAR AMBIENTE ORÇAMENTO =====
function handleSalvar(isFinalizar) {
    const idAmbienteOrcamento = document.getElementById('idAmbienteOrcamento')?.value || '';
    const idOrcamento = document.getElementById('idOrcamento')?.value || '';
    const idambiente = document.getElementById('idambiente')?.value || '';
    const descricao = document.getElementById('descricao')?.value || '';

    const dto = {
        Id: idAmbienteOrcamento === '' ? 0 : parseInt(idAmbienteOrcamento),
        Idorcamento: parseInt(idOrcamento),
        Idambiente: parseInt(idambiente),
        Descricao: descricao
    };

    const xmlhttp = new XMLHttpRequest();
    const theUrl = "/SalvarDadosAmbienteOrcamento";

    xmlhttp.open("POST", theUrl, false);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            const retornoApi = JSON.parse(xmlhttp.responseText);
            if (retornoApi.sucesso === true) {
                if (isFinalizar === true) {
                    Swal.fire({
                        title: "Sucesso!",
                        text: retornoApi.mensagem || 'Ambiente salvo com sucesso',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    }).then(() => {
                        const idOrcamentoVal = document.getElementById('idOrcamento')?.value || '';
                        window.location.href = '/Orcamentos/Cadastro?id=' + idOrcamentoVal;
                    });
                } else {
                    document.getElementById('idAmbienteOrcamento').value = retornoApi.id;
                }
            }
        }
    };
    xmlhttp.send(JSON.stringify(dto));
}

// ===== INCLUIR NOVO ITEM (REDIRECIONA) =====
function handleIncluirItem() {
    Swal.fire({
        title: 'Aguarde...',
        text: 'Atualizando dados ambiente orçamento',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });
    handleSalvar(false);
    const idOrcamento = document.getElementById('idOrcamento')?.value || '';
    const idAmbienteOrcamento = document.getElementById('idAmbienteOrcamento')?.value || '';
    window.location.href = `/Orcamentos/ItemAmbienteOrcamento?idOrcamento=${idOrcamento}&idAmbienteOrcamento=${idAmbienteOrcamento}`;
    Swal.close();
}

// ===== EDITAR ITEM (REDIRECIONA) =====
function CarregarDadosItemAmbienteOrcamento(id) {
    Swal.fire({
        title: 'Aguarde...',
        text: 'Atualizando dados ambiente orçamento',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });
    handleSalvar(false);
    const idOrcamento = document.getElementById('idOrcamento')?.value || '';
    const idAmbienteOrcamento = document.getElementById('idAmbienteOrcamento')?.value || '';
    window.location.href = `/Orcamentos/ItemAmbienteOrcamento?idOrcamento=${idOrcamento}&idAmbienteOrcamento=${idAmbienteOrcamento}&idItemAmbienteOrcamento=${id}`;
    Swal.close();
}

// ===== EXCLUIR ITEM =====
function ExcluirDadosItemAmbienteOrcamento(id) {
    Swal.fire({
        title: "Exclusão de Item do Ambiente Orçamento",
        text: "Tem certeza que deseja excluir este item?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim",
        cancelButtonText: "Não"
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Aguarde...',
                text: 'Excluindo item',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const xmlhttp = new XMLHttpRequest();
            const theUrl = "/ExcluirDadosItemAmbienteOrcamento?id=" + id;
            xmlhttp.open("POST", theUrl, true);
            xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                    Swal.close();
                    const retornoApi = JSON.parse(xmlhttp.responseText);
                    const titulo = retornoApi.sucesso ? retornoApi.mensagem : retornoApi.mensagem;
                    const icone = retornoApi.sucesso ? "success" : "error";
                    Swal.fire({ title: titulo, icon: icone, timer: 2000, showConfirmButton: false })
                        .then(() => window.location.reload());
                }
            };
            xmlhttp.send();
        }
    });
}

// ===== FUNÇÃO AUXILIAR PARA ESCAPE HTML =====
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}