
const idMarceneiro = $('#IdMarceneiro').val();
let itensDaCategoria = [];

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id && id !== '0') {
        carregarDados(id);
    }
    atualizarInterface();
});

// ===== ATUALIZAR INTERFACE =====
function atualizarInterface() {
    const formula = document.getElementById('catFormula').value;
    const unidadeInput = document.getElementById('catUnidade');
    const itemAltura = document.getElementById('itemAltura');
    const itemMarkup = document.getElementById('itemMarkup');

    const mapeamento = {
        '(largura * altura) * valor': 'Metro Quadrado (m²)',
        'quantidade * valor': 'Unidade (un)',
        '(quantidade * markup) + custo': 'Percentual (%)'
    };
    unidadeInput.value = mapeamento[formula] || 'Outros';

    // Habilitar/Desabilitar campos baseado na fórmula
    itemAltura.disabled = (formula !== '(largura * altura) * valor');
    itemMarkup.disabled = (formula !== '(quantidade * markup) + custo');

    if (itemAltura.disabled) itemAltura.value = "0,00";
    if (itemMarkup.disabled) itemMarkup.value = "0,00";
}

// ===== CARREGAR DADOS COM LOADING =====
async function carregarDados(id) {
    // Mostrar loading
    Swal.fire({
        title: 'Carregando...',
        text: 'Buscando dados da categoria',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const response = await fetch(`/CarregarDadosCategoria?id=${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        Swal.close();

        if (data.codigo === 1) {
            Swal.fire({
                title: 'Erro!',
                text: data.mensagem || 'Erro ao carregar dados',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        document.getElementById('catId').value = data.id || 0;
        document.getElementById('catNome').value = data.nome || '';
        document.getElementById('catFormula').value = data.formulaCalculo || '(largura * altura) * valor';

        itensDaCategoria = data.itens || [];
        renderizarItens();
        atualizarInterface();
    } catch (error) {
        Swal.close();
        Swal.fire({
            title: 'Erro!',
            text: 'Falha ao carregar dados da categoria',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// ===== RENDERIZAR ITENS =====
function renderizarItens() {
    const corpo = document.getElementById('corpoItens');
    if (itensDaCategoria.length === 0) {
        corpo.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nenhum item adicionado.</td></tr>';
        return;
    }

    corpo.innerHTML = itensDaCategoria.map(item => `
        <tr>
        <td>${item.descricao || ''}</td>
        <td class="text-center">${formatarMoeda(item.alturapadrao)}</td>
        <td class="text-center">${formatarMoeda(item.markup)}</td>
        <td class="text-center">${formatarMoeda(item.valor)}</td>
        <td class="text-center">
        <div class="btn-group">
        <button class="btn btn-info btn-sm" onclick="editarItemLocal(${item.id})" title="Editar">
        <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-danger btn-sm" onclick="excluirItemServidor(${item.id})" title="Excluir">
        <i class="fas fa-trash"></i>
        </button>
        </div>
        </td>
        </tr>
        `).join('');
}

// ===== GRAVAR CATEGORIA COM LOADING =====
async function gravarCategoria(exibirFeedback) {
    const nome = document.getElementById('catNome').value;
    const id = document.getElementById('catId').value;

    if (!nome) {
        Swal.fire({
            title: 'Atenção',
            text: 'Nome da categoria é obrigatório',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return null;
    }

    const payload = {
        id: parseInt(id) || 0,
        idmarceneiro: parseInt(idMarceneiro),
        nome: nome,
        formulaCalculo: document.getElementById('catFormula').value,
        unidadePadrao: document.getElementById('catUnidade').value,
        itens: []
    };

    // Mostrar loading
    if (exibirFeedback) {
        Swal.fire({
            title: 'Salvando...',
            text: 'Processando dados da categoria',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }

    try {
        const response = await fetch('/SalvarDadosCategoria', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.sucesso) {
            const novoId = data.IdCategoria || id;
            document.getElementById('catId').value = novoId;

            if (exibirFeedback) {
                Swal.close();
                Swal.fire({
                    title: 'Sucesso!',
                    text: data.mensagem || 'Categoria salva com sucesso',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    location.href = '/Categorias?reload=true';
                });
            }
            return novoId;
        }

        Swal.close();
        Swal.fire({
            title: 'Erro!',
            text: data.mensagem || 'Erro ao salvar categoria',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return null;
    } catch (error) {
        Swal.close();
        Swal.fire({
            title: 'Erro!',
            text: 'Erro na comunicação com o servidor',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return null;
    }
}

// ===== GRAVAR ITEM COM LOADING =====
async function gravarItem() {
    const desc = document.getElementById('itemDescricao').value;
    if (!desc) {
        Swal.fire({
            title: 'Atenção',
            text: 'Descrição é obrigatória',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    // Se for categoria nova, grava a categoria primeiro para obter o ID
    let currentIdCat = document.getElementById('catId').value;
    if (currentIdCat === "0") {
        const savedId = await gravarCategoria(false);
        if (!savedId) return;
        currentIdCat = savedId;
    }

    // Mostrar loading
    Swal.fire({
        title: 'Salvando...',
        text: 'Processando dados do item',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const payload = {
        id: parseInt(document.getElementById('itemId').value) || 0,
        idcategoria: parseInt(currentIdCat),
        idmarceneiro: parseInt(idMarceneiro),
        descricao: desc,
        observacao: document.getElementById('itemObs').value || '',
        alturapadrao: toDecimal(document.getElementById('itemAltura').value).toString(),
        markup: toDecimal(document.getElementById('itemMarkup').value).toString(),
        valor: toDecimal(document.getElementById('itemValor').value).toString(),
        itensCategoria: []
    };

    try {
        const response = await fetch('/SalvarDadosItemCategoria', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.sucesso) {
            Swal.close();
            Swal.fire({
                title: 'Sucesso!',
                text: data.mensagem || 'Item salvo com sucesso',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
            await carregarDados(currentIdCat);
            limparFormItem();
        } else {
            Swal.close();
            Swal.fire({
                title: 'Erro!',
                text: data.mensagem || 'Erro ao salvar item',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    } catch (error) {
        Swal.close();
        Swal.fire({
            title: 'Erro!',
            text: 'Falha na comunicação ao salvar item',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// ===== EXCLUIR ITEM COM LOADING =====
async function excluirItemServidor(id) {
    const result = await Swal.fire({
        title: 'Confirmar exclusão?',
        text: 'Deseja excluir este item? Esta ação não poderá ser desfeita!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        Swal.fire({
            title: 'Excluindo...',
            text: 'Processando exclusão do item',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const response = await fetch(`/ExcluirDadosItemCategoria?id=${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            if (data.sucesso) {
                Swal.close();
                Swal.fire({
                    title: 'Excluído!',
                    text: data.mensagem || 'Item excluído com sucesso',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                await carregarDados(document.getElementById('catId').value);
            } else {
                Swal.close();
                Swal.fire({
                    title: 'Erro!',
                    text: data.mensagem || 'Erro ao excluir item',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            Swal.close();
            Swal.fire({
                title: 'Erro!',
                text: 'Erro na comunicação com o servidor',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    }
}

// ===== EDITAR ITEM LOCAL =====
function editarItemLocal(id) {
    const item = itensDaCategoria.find(i => i.id === id);
    if (item) {
        document.getElementById('itemId').value = item.id;
        document.getElementById('itemDescricao').value = item.descricao || '';
        document.getElementById('itemObs').value = item.observacao || '';
        document.getElementById('itemAltura').value = formatarMoeda(item.alturapadrao);
        document.getElementById('itemMarkup').value = formatarMoeda(item.markup);
        document.getElementById('itemValor').value = formatarMoeda(item.valor);
        window.scrollTo({ top: 200, behavior: 'smooth' });
    }
}

// ===== LIMPAR FORMULÁRIO =====
function limparFormItem() {
    document.getElementById('itemId').value = "0";
    document.getElementById('itemDescricao').value = "";
    document.getElementById('itemObs').value = "";
    document.getElementById('itemAltura').value = "0,00";
    document.getElementById('itemMarkup').value = "0,00";
    document.getElementById('itemValor').value = "0,00";
}

// ===== HELPERS DE FORMATAÇÃO =====
function formatarMoeda(valor) {
    if (!valor || valor === '0' || valor === '0,00') return '0,00';
    const num = parseFloat(valor);
    if (isNaN(num)) return '0,00';
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function mascaraMoeda(i) {
    let v = i.value.replace(/\D/g, '');
    v = (v / 100).toFixed(2) + '';
    v = v.replace(".", ",");
    v = v.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
    v = v.replace(/(\d)(\d{3}),/g, "$1.$2,");
    i.value = v;
}

function toDecimal(v) {
    if (!v) return 0;
    return parseFloat(v.replace(/\./g, '').replace(',', '.')) || 0;
}