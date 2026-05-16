
const idMarceneiro = $('#IdMarceneiro').val();
const MAX_SIZE = 5 * 1024 * 1024;
let validatedData = [];
let loading = false;

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

// Eventos de Clique e Drag & Drop
dropZone.onclick = () => fileInput.click();

dropZone.ondragover = (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = '#f0f2f5';
    dropZone.style.borderColor = '#764ba2 !important';
    dropZone.style.transform = 'scale(1.02)';
};

dropZone.ondragleave = () => {
    dropZone.style.backgroundColor = 'white';
    dropZone.style.borderColor = '#667eea !important';
    dropZone.style.transform = 'scale(1)';
};

dropZone.ondrop = (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = 'white';
    dropZone.style.borderColor = '#667eea !important';
    dropZone.style.transform = 'scale(1)';
    if (e.dataTransfer.files.length) parseFile(e.dataTransfer.files[0]);
};

fileInput.onchange = (e) => { if (e.target.files.length) parseFile(e.target.files[0]); };

const normalize = (h) => (h || '').toString().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function parseFile(file) {
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
        Swal.fire({
            title: "Erro",
            text: "Formato inválido. Selecione um arquivo .xlsx.",
            icon: "error",
            confirmButtonColor: "#667eea"
        });
        return;
    }
    if (file.size > MAX_SIZE) {
        Swal.fire({
            title: "Erro",
            text: "O arquivo é demasiado grande (Máx 5MB).",
            icon: "error",
            confirmButtonColor: "#667eea"
        });
        return;
    }

    // Mostrar loading do arquivo
    Swal.fire({
        title: 'Processando arquivo...',
        text: 'Lendo e validando dados do Excel',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    document.getElementById('txtFileName').innerText = file.name;
    document.getElementById('txtFileSize').innerText = (file.size / 1024).toFixed(2) + " KB";
    document.getElementById('fileInfo').classList.remove('d-none');
    document.getElementById('uploadInstructions').classList.add('d-none');

    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        try {
            const workbook = XLSX.read(data, { type: 'array' });
            renderPreview(workbook, workbook.SheetNames[0]);
            Swal.close();
        } catch (err) {
            Swal.close();
            Swal.fire({
                title: "Erro",
                text: "Erro ao processar o Excel. Verifique se o arquivo não está corrompido.",
                icon: "error",
                confirmButtonColor: "#667eea"
            });
            limparUpload();
        }
    };
    reader.onerror = () => {
        Swal.close();
        Swal.fire({
            title: "Erro",
            text: "Erro ao ler o arquivo.",
            icon: "error",
            confirmButtonColor: "#667eea"
        });
        limparUpload();
    };
    reader.readAsArrayBuffer(file);
}

function renderPreview(workbook, sheetName) {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    if (data.length === 0) {
        Swal.fire({
            title: "Aviso",
            text: "A planilha está vazia.",
            icon: "warning",
            confirmButtonColor: "#667eea"
        });
        limparUpload();
        return;
    }

    if (data.length < 2) {
        Swal.fire({
            title: "Aviso",
            text: "A planilha não contém dados além do cabeçalho.",
            icon: "warning",
            confirmButtonColor: "#667eea"
        });
        limparUpload();
        return;
    }

    const headers = data[0];
    const normalizedHeaders = headers.map(normalize);
    const idxAmbiente = normalizedHeaders.indexOf('ambiente');
    const idxEspec = normalizedHeaders.findIndex(h => h.includes('especifica') || h.includes('descri'));

    if (idxAmbiente === -1 || idxEspec === -1) {
        setLabelStatus('Cabeçalho Inválido (Necessário: Ambiente e Especificação)', 'bg-danger');
        document.getElementById('btnImportar').disabled = true;
        Swal.fire({
            title: 'Cabeçalho inválido',
            text: 'A planilha deve conter as colunas "Ambiente" e "Especificação"',
            icon: 'warning',
            confirmButtonText: 'OK',
            confirmButtonColor: '#667eea'
        });
    } else {
        setLabelStatus('Pronto para importar', 'bg-success');
        document.getElementById('btnImportar').disabled = false;
    }

    let tempData = [];
    let html = '<thead><tr>';
    headers.forEach((h, i) => {
        const isReq = (i === idxAmbiente || i === idxEspec);
        html += `<th class="${isReq ? 'bg-info text-white' : ''}">${h || '-'}</th>`;
    });
    html += '</thead><tbody>';

    let registrosValidos = 0;
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[idxAmbiente] && !row[idxEspec] && row.every(cell => cell === '')) continue;

        html += '<tr>';
        headers.forEach((_, colIdx) => {
            let cellValue = row[colIdx] || '';
            if ((colIdx === idxAmbiente || colIdx === idxEspec) && !cellValue) {
                cellValue = '<span class="text-danger fw-bold">(vazio)</span>';
            }
            html += `<td${(colIdx === idxAmbiente || colIdx === idxEspec) && !row[colIdx] ? ' class="bg-warning"' : ''}>${cellValue}</td>`;
        });
        html += '</tr>';

        if (row[idxAmbiente] && row[idxAmbiente].toString().trim()) {
            registrosValidos++;
            tempData.push({
                Ambiente: row[idxAmbiente].toString().trim(),
                Descricao: row[idxEspec] ? row[idxEspec].toString().trim() : '',
                IdMarceneiro: idMarceneiro
            });
        }
    }
    html += '</tbody>';

    document.getElementById('tablePreview').innerHTML = html;
    document.getElementById('rowCount').innerHTML = `<i class="fas fa-database me-1"></i> ${registrosValidos} registros válidos`;
    document.getElementById('previewContainer').classList.remove('d-none');
    validatedData = tempData;

    if (registrosValidos === 0) {
        setLabelStatus('Nenhum registro válido encontrado', 'bg-danger');
        document.getElementById('btnImportar').disabled = true;
        Swal.fire({
            title: 'Aviso',
            text: 'Nenhum registro válido encontrado na planilha.',
            icon: 'warning',
            confirmButtonColor: '#667eea'
        });
    }
}

function setLabelStatus(text, className) {
    const lbl = document.getElementById('statusLabel');
    lbl.innerHTML = `<i class="fas fa-tag me-1"></i> ${text}`;
    lbl.className = `badge ${className}`;
}

function limparUpload() {
    fileInput.value = "";
    document.getElementById('fileInfo').classList.add('d-none');
    document.getElementById('uploadInstructions').classList.remove('d-none');
    document.getElementById('previewContainer').classList.add('d-none');
    validatedData = [];
    setLabelStatus('', '');
    dropZone.style.backgroundColor = 'white';
    dropZone.style.borderColor = '#ccc !important';
}

async function handleImportar() {
    if (loading) return;

    if (validatedData.length === 0) {
        Swal.fire({
            title: "Aviso",
            text: "Não há dados válidos para importar.",
            icon: "warning",
            confirmButtonColor: "#667eea"
        });
        return;
    }

    const btn = document.getElementById('btnImportar');
    loading = true;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Importando...';

    Swal.fire({
        title: 'Importando dados...',
        text: `Processando ${validatedData.length} registros`,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const res = await fetch(`/ImportarDadosAmbiente?idMarceneiro=${idMarceneiro}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validatedData)
        });

        const data = await res.json();
        Swal.close();

        const sucesso = data.codigo === 0 || data.sucesso === true;
        const mensagem = data.mensagem || (sucesso ? 'Dados importados com sucesso!' : 'Erro ao importar dados');

        if (sucesso) {
            Swal.fire({
                title: 'Sucesso!',
                text: mensagem,
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
                didClose: () => {
                    location.href = '/Ambientes?reload=true';
                }
            });
        } else {
            Swal.fire({
                title: 'Erro!',
                text: mensagem,
                icon: "error",
                confirmButtonText: 'OK',
                confirmButtonColor: '#667eea'
            });
        }
    } catch (err) {
        Swal.close();
        Swal.fire({
            title: 'Erro!',
            text: "Falha na comunicação com o servidor.",
            icon: "error",
            confirmButtonText: 'OK',
            confirmButtonColor: '#667eea'
        });
    } finally {
        loading = false;
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-cloud-arrow-up me-2"></i>Importar Dados';
    }
}

function confirmarCancelamento() {
    if (validatedData.length > 0) {
        Swal.fire({
            title: 'Cancelar importação?',
            text: 'Os dados carregados serão perdidos.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#667eea',
            confirmButtonText: 'Sim, cancelar',
            cancelButtonText: 'Continuar importação',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                location.href = '/Ambientes';
            }
        });
    } else {
        location.href = '/Ambientes';
    }
}

// Remover o botão cancelar original e usar o novo
$(document).ready(function () {
    // O botão cancelar já foi substituído no HTML
});