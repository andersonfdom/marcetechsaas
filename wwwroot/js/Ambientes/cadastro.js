
const idMarceneiro = $('#IdMarceneiro').val();
let specsVinculadas = [];

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const idUrl = params.get('id');

    inicializarDados(idUrl);
});

async function inicializarDados(id) {
    await carregarOpcoesSelect();
    if (id) {
        await carregarAmbiente(id);
    }
}

// ===== CARREGAR OPÇÕES DO SELECT COM LOADING =====
async function carregarOpcoesSelect() {
    const select = document.getElementById('idEspecificacao');
    select.innerHTML = '<option value="">Carregando especificações...</option>';
    select.disabled = true;

    try {
        const response = await fetch('/ListarDadosEspecificacao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const dados = await response.json();

        // Verificar padrão de retorno
        let especificacoes = [];
        if (dados.codigo === 0 && dados.dados) {
            especificacoes = dados.dados;
        } else if (Array.isArray(dados)) {
            especificacoes = dados;
        } else if (dados.codigo === 1) {
            Swal.fire('Erro', dados.mensagem || 'Erro ao carregar especificações', 'error');
            especificacoes = [];
        } else {
            especificacoes = [];
        }

        if (especificacoes.length === 0) {
            select.innerHTML = '<option value="">Nenhuma especificação disponível</option>';
        } else {
            select.innerHTML = especificacoes.map(opt =>
                `<option value="${opt.id}">${opt.descricao}</option>`
            ).join('');
        }
        select.disabled = false;
    } catch (error) {
        console.error("Erro ao carregar lista de especificações", error);
        select.innerHTML = '<option value="">Erro ao carregar especificações</option>';
        select.disabled = false;
        Swal.fire('Erro', 'Erro ao carregar lista de especificações', 'error');
    }
}

// ===== CARREGAR AMBIENTE COM LOADING =====
async function carregarAmbiente(id) {
    // Mostrar loading
    Swal.fire({
        title: 'Carregando...',
        text: 'Buscando dados do ambiente',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const response = await fetch(`/CarregarDadosAmbiente?id=${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        Swal.close();

        if (data && data.codigo !== 1) {
            document.getElementById('idAmbiente').value = data.id || 0;
            document.getElementById('nome').value = data.nome || '';
            specsVinculadas = Array.isArray(data.especificacoes) ? data.especificacoes : [];
            renderizarTabelaSpecs();

            if (specsVinculadas.length > 0) {
                Swal.fire({
                    title: 'Sucesso!',
                    text: 'Dados carregados com sucesso',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        } else if (data && data.codigo === 1) {
            Swal.fire('Erro', data.mensagem || 'Erro ao carregar ambiente', 'error');
        }
    } catch (error) {
        Swal.close();
        console.error("Erro ao carregar dados do ambiente", error);
        Swal.fire('Erro', 'Erro ao carregar dados do ambiente', 'error');
    }
}

// ===== RENDERIZAR TABELA DE SPECS =====
function renderizarTabelaSpecs() {
    const tbody = document.getElementById('tabelaSpecs');
    if (specsVinculadas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="2" class="text-center text-muted">Nenhuma especificação vinculada.</td></tr>`;
        return;
    }

    tbody.innerHTML = specsVinculadas.map(item => `
        <tr>
        <td data-label="Descrição">${item.descricao || ''}</td>
        <td class="text-center" data-label="Ações">
        <button class="btn btn-danger btn-sm" onclick="excluirEspecificacao(${item.id})">
        <i class="fas fa-trash"></i>
        </button>
        </td>
        </tr>
        `).join('');
}

// ===== GRAVAR AMBIENTE COM LOADING =====
async function gravarAmbiente(isFinalizar) {
    const nome = document.getElementById('nome').value.trim();
    const idAmbiente = document.getElementById('idAmbiente').value;

    if (!nome) {
        Swal.fire("Aviso", "O nome do ambiente é obrigatório.", "warning");
        return null;
    }

    const btnGravar = document.getElementById('btnGravar');
    if (isFinalizar) {
        btnGravar.disabled = true;
        btnGravar.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Gravando...';

        // Mostrar loading
        Swal.fire({
            title: 'Gravando...',
            text: 'Salvando dados do ambiente',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }

    try {
        const response = await fetch('/SalvarDadosAmbiente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Id: parseInt(idAmbiente) || 0,
                Idmarceneiro: idMarceneiro,
                Nome: nome
            })
        });

        const data = await response.json();

        if (isFinalizar) {
            Swal.close();
        }

        // Verificar padrão de retorno (codigo ou sucesso)
        const sucesso = data.codigo === 0 || data.sucesso === true;
        const mensagem = data.mensagem || (sucesso ? 'Ambiente salvo com sucesso' : 'Erro ao salvar ambiente');
        const idGerado = data.idAmbiente || data.IdAmbiente;

        if (sucesso) {
            if (idGerado) {
                document.getElementById('idAmbiente').value = idGerado;
            }

            if (isFinalizar) {
                Swal.fire({
                    title: 'Sucesso!',
                    text: mensagem,
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    location.href = '/Ambientes?reload=true';
                });
            }
            return idGerado;
        } else {
            if (isFinalizar) {
                Swal.fire("Erro", mensagem, "error");
            }
            return null;
        }
    } catch (error) {
        if (isFinalizar) {
            Swal.close();
            Swal.fire("Erro", "Erro ao gravar ambiente", "error");
        }
        return null;
    } finally {
        if (isFinalizar) {
            btnGravar.disabled = false;
            btnGravar.innerHTML = '<i class="fas fa-save me-2"></i>Gravar';
        }
    }
}

// ===== ADICIONAR ESPECIFICAÇÃO COM LOADING =====
async function adicionarEspecificacao() {
    const btn = document.getElementById('btnAdicionarEspecificacoes');
    const idEspecificacao = document.getElementById('idEspecificacao').value;
    const idAmbienteAtual = document.getElementById('idAmbiente').value;

    if (!idEspecificacao) {
        Swal.fire("Aviso", "Selecione uma especificação para adicionar.", "warning");
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    // Mostrar loading
    Swal.fire({
        title: 'Processando...',
        text: 'Adicionando especificação ao ambiente',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Se for inclusão (ID 0), grava o ambiente primeiro
    let idParaVincular = idAmbienteAtual;
    if (idAmbienteAtual == "0") {
        idParaVincular = await gravarAmbiente(false);
        Swal.close(); // Fechar loading do gravar ambiente se abriu

        if (!idParaVincular) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-plus"></i>';
            return;
        }

        // Reabrir loading para a vinculação
        Swal.fire({
            title: 'Vinculando...',
            text: 'Adicionando especificação ao ambiente',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }

    if (idParaVincular) {
        try {
            const res = await fetch('/SalvarDadosEspecificacoesAmbiente', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Idambiente: parseInt(idParaVincular),
                    Idespecificacao: parseInt(idEspecificacao),
                    Idmarceneiro: idMarceneiro
                })
            });

            const data = await res.json();
            Swal.close();

            const sucesso = data.codigo === 0 || data.sucesso === true;
            const mensagem = data.mensagem || (sucesso ? 'Especificação vinculada com sucesso' : 'Erro ao vincular especificação');

            if (sucesso) {
                Swal.fire({
                    title: 'Sucesso!',
                    text: mensagem,
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });
                await carregarAmbiente(idParaVincular);
            } else {
                Swal.fire("Erro", mensagem, "error");
            }
        } catch (error) {
            Swal.close();
            Swal.fire("Erro", "Erro ao vincular especificação", "error");
        }
    }
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-plus"></i>';
}

// ===== EXCLUIR ESPECIFICAÇÃO COM LOADING =====
async function excluirEspecificacao(idVinculo) {
    const idAmbienteAtual = document.getElementById('idAmbiente').value;

    const result = await Swal.fire({
        title: 'Confirmar exclusão?',
        text: 'Deseja remover esta especificação do ambiente?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, remover',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        // Mostrar loading
        Swal.fire({
            title: 'Removendo...',
            text: 'Removendo especificação do ambiente',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const res = await fetch(`/ExcluirDadosEspecificacoesAmbiente?id=${idVinculo}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();
            Swal.close();

            const sucesso = data.codigo === 0 || data.sucesso === true;
            const mensagem = data.mensagem || (sucesso ? 'Especificação removida com sucesso' : 'Erro ao remover especificação');

            if (sucesso) {
                Swal.fire({
                    title: 'Removido!',
                    text: mensagem,
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                await carregarAmbiente(idAmbienteAtual);
            } else {
                Swal.fire("Erro", mensagem, "error");
            }
        } catch (error) {
            Swal.close();
            Swal.fire("Erro", "Erro ao remover especificação", "error");
        }
    }
}

// ===== RECARREGAR DADOS =====
function recarregarDados() {
    const idAmbiente = document.getElementById('idAmbiente').value;
    if (idAmbiente && idAmbiente !== '0') {
        carregarAmbiente(idAmbiente);
    } else {
        carregarOpcoesSelect();
    }
}