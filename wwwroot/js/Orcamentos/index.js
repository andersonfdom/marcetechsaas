// === Variáveis globais ===
let orcamentos = [];
let idMarceneiro = null;

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function () {
    // Obtém o valor do campo IdMarceneiro
    const idMarceneiroInput = document.getElementById('IdMarceneiro');
    if (idMarceneiroInput) {
        idMarceneiro = idMarceneiroInput.value;
    }

    // Adiciona evento de filtro ao campo de busca
    const filtroInput = document.getElementById('filtroOrcamentos');
    if (filtroInput) {
        filtroInput.addEventListener('keyup', filtrarOrcamentos);
    }

    // Carrega a lista inicial
    carregarOrcamentos();
});

// ===== CARREGAR LISTA COM LOADING =====
async function carregarOrcamentos() {
    if (!idMarceneiro) return;

    Swal.fire({
        title: 'Carregando...',
        text: 'Buscando lista de orçamentos',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        const response = await fetch(`/ListarDadosOrcamento?idMarceneiro=${idMarceneiro}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        orcamentos = Array.isArray(data) ? data : (data.data || []);
        renderizarTabela(orcamentos);
        Swal.close();
    } catch (error) {
        console.error("Erro ao carregar orçamentos:", error);
        Swal.fire('Erro', 'Não foi possível carregar os dados.', 'error');
        renderizarTabela([]);
    }
}

// ===== RENDERIZAR TABELA =====
function renderizarTabela(lista) {
    const tabelaOrcamentos = document.getElementById('tabelaOrcamentos');
    if (!tabelaOrcamentos) return;

    let dadosTabelaOrcamentos = "";

    lista.forEach(function (item) {
        dadosTabelaOrcamentos += "<tr>";
        dadosTabelaOrcamentos += "<td>" + item.cliente + "</td>";
        dadosTabelaOrcamentos += "<td>" + item.vendedor + "</td>";
        dadosTabelaOrcamentos += "<td>" + item.loja + "</td>";
        dadosTabelaOrcamentos += "<td>" + item.dataOrcamento + "</td>";
        dadosTabelaOrcamentos += "<td>" + item.valorTotal + "</td>";
        dadosTabelaOrcamentos += "<td>" + item.status + "</td>";
        dadosTabelaOrcamentos += "<td>";

        dadosTabelaOrcamentos += "<button class='btn btn-info btn-sm' onclick='VisualizarOrcamento(" + item.id + ");' title='Visualizar'><i class='fas fa-eye botaoItemDados'></i></button>";

        dadosTabelaOrcamentos += "<button class='btn btn-primary btn-sm' onclick='CarregarDadosOrcamento(" + item.id + ");' title='Editar'><i class='fas fa-edit botaoItemDados'></i></button>";

        dadosTabelaOrcamentos += "<button class='btn btn-danger btn-sm' onclick='excluirOrcamento(" + item.id + ")' title='Excluir'><i class='fas fa-trash botaoItemDados'></i></button>";

        dadosTabelaOrcamentos += "</td>";
        dadosTabelaOrcamentos += "</tr>";
    });

    tabelaOrcamentos.innerHTML = dadosTabelaOrcamentos;
}

// ===== FUNÇÕES AUXILIARES =====

function VisualizarOrcamento(id) {
    Swal.fire({
        title: 'Aguarde...',
        text: 'Carregando Visualização Orçamento',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });
    window.location.href = "/Orcamentos/Visualizar?id=" + id;
    // Swal.close() não será executado devido ao redirecionamento imediato
}

function CarregarDadosOrcamento(id) {
    Swal.fire({
        title: 'Aguarde...',
        text: 'Carregando Dados Orçamento',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });
    window.location.href = "/Orcamentos/Cadastro?id=" + id;
}

// ===== FILTRAR ORÇAMENTOS =====
function filtrarOrcamentos() {
    const filtroInput = document.getElementById('filtroOrcamentos');
    const filtro = filtroInput ? filtroInput.value.toUpperCase() : '';
    const filtrados = orcamentos.filter(o =>
        (o.cliente || '').toUpperCase().includes(filtro) ||
        (o.vendedor || '').toUpperCase().includes(filtro) ||
        (o.loja || '').toUpperCase().includes(filtro) ||
        (o.status || '').toUpperCase().includes(filtro)
    );
    renderizarTabela(filtrados);
}

// ===== EXCLUIR ORÇAMENTO COM CONFIRMAÇÃO E LOADING =====
function excluirOrcamento(id) {
    Swal.fire({
        title: 'Excluir Orçamento?',
        text: "Esta ação não pode ser desfeita!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Excluindo...',
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => Swal.showLoading()
            });

            try {
                const response = await fetch(`/ExcluirDadosOrcamento?id=${id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await response.json();

                if (data.sucesso) {
                    await Swal.fire({
                        title: 'Excluído!',
                        text: data.mensagem || 'Orçamento excluído com sucesso!',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    carregarOrcamentos();
                } else {
                    Swal.fire('Erro', data.mensagem || 'Erro ao excluir orçamento', 'error');
                }
            } catch (error) {
                Swal.fire('Erro', 'Erro ao processar exclusão.', 'error');
            }
        }
    });
}