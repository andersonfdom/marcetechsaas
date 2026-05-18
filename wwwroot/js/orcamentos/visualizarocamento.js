// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    const idInput = document.getElementById('idOrcamento');

    if (!idInput || !idInput.value) {
        Swal.fire('Aviso', 'ID do orçamento inválido.', 'warning');
        return;
    }

    const id = idInput.value;

    fetch("/VisualizarDadosOrcamento?id=" + encodeURIComponent(id), {
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" }
    })
        .then(async response => {
            if (!response.ok) {
                const erro = await response.text();
                throw new Error(erro || `Erro HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(d => {
            if (!d) {
                Swal.fire('Aviso', 'Orçamento não encontrado.', 'warning');
                return;
            }

            // Preenche os campos com os dados retornados
            const viewId = document.getElementById('view-id');
            if (viewId) viewId.textContent = d.idOrcamento || '';

            const viewData = document.getElementById('view-data');
            if (viewData) viewData.textContent = d.dataOrcamento || '';

            const viewLogo = document.getElementById('view-logo');
            if (viewLogo) viewLogo.src = d.logo || '';

            const viewCabecalho = document.getElementById('view-cabecalho');
            if (viewCabecalho) viewCabecalho.innerHTML = d.textoCabecalho || '';

            const viewCliente = document.getElementById('view-cliente');
            if (viewCliente) viewCliente.textContent = d.nomeClienteOrcamento || '';

            const viewTelefone = document.getElementById('view-telefone');
            if (viewTelefone) viewTelefone.textContent = d.telefone || '';

            const viewVendedor = document.getElementById('view-vendedor');
            if (viewVendedor) viewVendedor.textContent = d.vendedor || '';

            const viewTotal = document.getElementById('view-total');
            if (viewTotal) viewTotal.textContent = d.valorTotal || '';

            const viewRodape = document.getElementById('view-rodape');
            if (viewRodape) viewRodape.innerHTML = d.textoRodape || '';

            // Monta a tabela de ambientes
            let html = '';
            (d.ambientesOrcamento || []).forEach(a => {
                html += `
        <tr>
            <td>${escapeHtml(a.ambiente || '')}</td>
            <td>${escapeHtml(a.descricao || '')}</td>
            <td class="text-end">${escapeHtml(a.totalItens || '')}</td>
        </tr>
        `;
            });
            const tabelaItens = document.getElementById('tabela-itens');
            if (tabelaItens) tabelaItens.innerHTML = html;
        })
        .catch(error => {
            console.error('Erro:', error);
            Swal.fire('Erro', error.message || 'Erro ao carregar orçamento.', 'error');
        });
});

// ===== FUNÇÃO PARA ESCAPE HTML (SEGURANÇA) =====
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== DOWNLOAD DO PDF =====
function handleDownload() {
    Swal.fire({
        title: 'Aguarde...',
        text: 'Realizando Download Orçamento',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        const idOrcamento = document.getElementById('idOrcamento')?.value || '99';
        const dadosEnvio = {
            html: prepararHTML(),
            idOrcamento: idOrcamento
        };

        fetch("/RealizarDownloadDadosOrcamento", {
            method: "POST",
            headers: { "Content-Type": "application/json;charset=UTF-8" },
            body: JSON.stringify(dadosEnvio)
        })
            .then(async response => {
                if (!response.ok) {
                    const erro = await response.text();
                    throw new Error(erro || `Erro HTTP: ${response.status}`);
                }
                return response.blob();
            })
            .then(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `orcamento_${idOrcamento}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                Swal.close();
            })
            .catch(error => {
                console.error('Erro:', error);
                Swal.fire('Erro', error.message || 'Erro ao gerar PDF.', 'error');
            });
    } catch (error) {
        console.error('Erro:', error);
        Swal.fire('Erro', error.message || 'Erro ao preparar PDF.', 'error');
    }
}

// ===== ENVIO POR E-MAIL =====
function handleEnviarEmail() {
    Swal.fire({
        title: 'Aguarde...',
        text: 'Enviando orçamento via e-mail para o cliente',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        const idOrcamento = document.getElementById('idOrcamento')?.value || '0';
        const dadosEnvio = {
            html: prepararHTML(),
            idOrcamento: idOrcamento
        };

        fetch("/EnviarOrcamentoPorEmail", {
            method: "POST",
            headers: { "Content-Type": "application/json;charset=UTF-8" },
            body: JSON.stringify(dadosEnvio)
        })
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Erro no servidor.');
                }
                return data;
            })
            .then(data => {
                if (data.status === "sucesso") {
                    Swal.fire({
                        title: 'Sucesso!',
                        text: data.message,
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                } else {
                    Swal.fire({
                        title: 'Erro',
                        text: data.message || 'Falha ao enviar e-mail.',
                        icon: 'error'
                    });
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                Swal.fire({
                    title: 'Erro',
                    text: error.message || 'Erro técnico ao enviar.',
                    icon: 'error'
                });
            });
    } catch (error) {
        console.error('Erro:', error);
        Swal.fire({
            title: 'Erro',
            text: error.message || 'Erro ao preparar envio.',
            icon: 'error'
        });
    }
}

// ===== PREPARAR HTML PARA PDF =====
function prepararHTML() {
    const template = document.getElementById('template-pdf');
    if (!template) {
        throw new Error('Template PDF não encontrado.');
    }

    const clone = template.cloneNode(true);
    // Remove botões e elementos indesejados no PDF (classe 'no-print')
    clone.querySelectorAll('.no-print').forEach(el => el.remove());

    const cssEstilos = `
        <style>            
            @page {
                size: A4;
                margin: 0;
            }

            html, body {
                width: 210mm;
                min-height: 297mm;
                margin: 0;
                padding: 0;
                background: white;
                font-family: Arial, sans-serif;
                font-size: 14px;
            }

            #template-pdf {
                width: 210mm !important;
                min-height: 297mm !important;
                padding: 20mm !important;
                margin: 0 auto !important;
                border: none !important;
                box-sizing: border-box;
                background: white;
            }

            .dadosGridTabela {
                width: 100% !important;
                border-collapse: collapse !important;
                table-layout: fixed !important;
            }

            .dadosGridTabela th,
            .dadosGridTabela td {
                border: 1px solid #dcdcdc !important;
                padding: 8px !important;
                vertical-align: middle !important;
                word-wrap: break-word;
            }

            .dadosGridTabela th {
                background-color: #1A237E !important;
                color: white !important;
                -webkit-print-color-adjust: exact;
            }

            .text-end { text-align: right !important; }
            .text-primary { color: #0d6efd !important; }
            .fw-bold { font-weight: bold !important; }
            .h5 { font-size: 1.25rem !important; }

            img { max-width: 100%; height: auto; }
            
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            
            .no-print { display: none !important; }
        </style>
    `;

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
            ${cssEstilos}
        </head>
        <body>
            ${clone.outerHTML}
        </body>
        </html>
    `;
}

// ===== REDIRECIONAR PARA CONTRATO =====
function handleContrato() {
    const idOrcamento = document.getElementById('idOrcamento')?.value;
    if (idOrcamento) {
        window.location.href = "/Orcamentos/Contrato?idOrcamento=" + encodeURIComponent(idOrcamento);
    }
}