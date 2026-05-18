
document.addEventListener('DOMContentLoaded', function () {
    const idMarceneiro = $('#IdMarceneiro').val();

    if (idMarceneiro) {
        carregarEstatisticas(idMarceneiro);
    } else {
        console.warn("ID do Marceneiro não encontrado na sessão.");
        atualizarCards({ clientes: 0, orcamentos: 0, contratos: 0 });
    }
});

async function carregarEstatisticas(id) {
    try {
        // Simulação da chamada de API conforme o TSX original
        const response = await fetch(`/ValidarQtdeCadastros?idMarceneiro=${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            const data = await response.json();
            atualizarCards({
                clientes: data.qtdeClientesCadastrados || 0,
                orcamentos: data.qtdeOrcamentosEmAberto || 0,
                contratos: data.qtdeContratosFechados || 0
            });

            // Sincroniza localStorage como no original
            Object.keys(data).forEach(key => {
                localStorage.setItem(key, data[key]);
            });
        } else {
            throw new Error('Falha ao carregar dados da API');
        }
    } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
        atualizarCards({ clientes: '!', orcamentos: '!', contratos: '!' });
    }
}

function atualizarCards(stats) {
    $('#countClientes').text(stats.clientes);
    $('#countOrcamentos').text(stats.orcamentos);
    $('#countContratos').text(stats.contratos);
}