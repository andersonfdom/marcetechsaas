
const idMarceneiro = $('#IdMarceneiro').val();
let validatedData = [];
let loading = false;

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

// Drag & Drop
dropZone.onclick = () => fileInput.click();
dropZone.ondragover = (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
};
dropZone.ondragleave = () => dropZone.classList.remove('dragover');
dropZone.ondrop = (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) parseFile(e.dataTransfer.files[0]);
};

fileInput.onchange = (e) => { if (e.target.files.length) parseFile(e.target.files[0]); };

// Lógica de Normalização e Conversão
const normalize = (h) => (h || '').toString().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const toDecimal = (val) => {
    if (val === null || val === undefined || val === '') return 0;
    if (typeof val === 'number') return Number(val.toFixed(2));
    let clean = val.toString().trim().replace(/\s/g, '');
    if (clean.includes(',')) {
        clean = clean.replace(/\./g, '').replace(',', '.');
    }
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : Number(num.toFixed(2));
};

const formatarMoedaPTBR = (valor) => {
    const num = toDecimal(valor);
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

function limparUpload() {
    fileInput.value = "";
    document.getElementById('fileInfo').classList.add('d-none');
    document.getElementById('dropZone').classList.remove('d-none');
    document.getElementById('previewSection').classList.add('d-none');
    document.getElementById('btnImportar').disabled = true;
    validatedData = [];
    dropZone.classList.remove('dragover');
}

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

    if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
            title: "Erro",
            text: "Arquivo muito grande. Máximo de 5MB.",
            icon: "error",
            confirmButtonColor: "#667eea"
        });
        return;
    }

    // Mostrar loading
    Swal.fire({
        title: 'Processando arquivo...',
        text: 'Lendo e validando dados do Excel',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

            if (jsonData.length < 2) {
                Swal.close();
                Swal.fire({
                    title: "Aviso",
                    text: "Planilha sem dados para importar.",
                    icon: "warning",
                    confirmButtonColor: "#667eea"
                });
                return;
            }

            const headers = jsonData[0].map(normalize);
            const getIdx = (name) => headers.indexOf(normalize(name));

            const idx = {
                cat: getIdx('categoria'),
                formula: getIdx('formulacalculo'),
                unidade: getIdx('unidadepadrao'),
                desc: getIdx('descricao'),
                alt: getIdx('alturapadrao'),
                obs: getIdx('observacao'),
                markup: getIdx('markup'),
                valor: getIdx('valor')
            };

            if (idx.cat === -1) {
                Swal.close();
                Swal.fire({
                    title: "Erro",
                    text: "Coluna 'Categoria' não encontrada na planilha.",
                    icon: "error",
                    confirmButtonColor: "#667eea"
                });
                return;
            }

            let tempValidated = [];
            let html = '<thead><tr>';
            jsonData[0].forEach(h => html += `<th>${h || '-'}</th>`);
            html += '</thead><tbody>';

            let registrosValidos = 0;

            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (!row[idx.cat] && row.every(c => c === '')) continue;

                html += '<tr>';
                row.forEach((cell, colIndex) => {
                    const isDecimalCol = (colIndex === idx.alt || colIndex === idx.markup || colIndex === idx.valor);
                    if (isDecimalCol && cell) {
                        html += `<td style="text-align: right; font-weight: 500;">${formatarMoedaPTBR(cell)}</td>`;
                    } else {
                        html += `<td>${cell || '-'}</td>`;
                    }
                });
                html += '</tr>';

                if (row[idx.cat] && row[idx.cat].toString().trim()) {
                    registrosValidos++;
                    tempValidated.push({
                        Categoria: row[idx.cat]?.toString().trim(),
                        FormulaCalculo: row[idx.formula]?.toString().trim(),
                        UnidadePadrao: row[idx.unidade]?.toString().trim(),
                        Descricao: row[idx.desc]?.toString().trim(),
                        AlturaPadrao: toDecimal(row[idx.alt]),
                        Observacao: row[idx.obs]?.toString().trim(),
                        Markup: toDecimal(row[idx.markup]),
                        Valor: toDecimal(row[idx.valor]),
                        IdMarceneiro: idMarceneiro
                    });
                }
            }
            html += '</tbody>';

            Swal.close();

            // Atualiza UI
            document.getElementById('fileNameDisplay').innerText = file.name;
            document.getElementById('fileSizeDisplay').innerText = `(${(file.size / 1024).toFixed(2)} KB)`;
            document.getElementById('fileInfo').classList.remove('d-none');
            document.getElementById('fileInfo').classList.add('d-flex');
            document.getElementById('dropZone').classList.add('d-none');

            document.getElementById('tablePreview').innerHTML = html;
            document.getElementById('rowCountBadge').innerHTML = `<i class="fas fa-database me-1"></i> ${registrosValidos} registros válidos`;

            const statusLbl = document.getElementById('statusLabel');
            statusLbl.innerHTML = '<i class="fas fa-check-circle me-1"></i> Pronto para importar';
            statusLbl.className = 'badge bg-success';

            document.getElementById('previewSection').classList.remove('d-none');
            document.getElementById('btnImportar').disabled = false;
            validatedData = tempValidated;

            if (registrosValidos === 0) {
                statusLbl.innerHTML = '<i class="fas fa-exclamation-triangle me-1"></i> Nenhum registro válido';
                statusLbl.className = 'badge bg-danger';
                document.getElementById('btnImportar').disabled = true;
                Swal.fire({
                    title: "Aviso",
                    text: "Nenhum registro válido encontrado na planilha.",
                    icon: "warning",
                    confirmButtonColor: "#667eea"
                });
            }

        } catch (err) {
            Swal.close();
            Swal.fire({
                title: "Erro",
                text: err.message,
                icon: "error",
                confirmButtonColor: "#667eea"
            });
        }
    };
    reader.readAsArrayBuffer(file);
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

    loading = true;
    const btn = document.getElementById('btnImportar');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Importando...';
    btn.disabled = true;

    Swal.fire({
        title: 'Importando dados...',
        text: `Processando ${validatedData.length} registros`,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const res = await fetch(`/ImportarDadosCategoria?idMarceneiro=${idMarceneiro}`, {
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
                title: "Sucesso!",
                text: mensagem,
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                location.href = '/Categorias?reload=true';
            });
        } else {
            Swal.fire({
                title: "Erro",
                text: mensagem,
                icon: "error",
                confirmButtonColor: "#667eea"
            });
        }
    } catch (error) {
        Swal.close();
        Swal.fire({
            title: "Erro",
            text: "Erro ao salvar dados no servidor.",
            icon: "error",
            confirmButtonColor: "#667eea"
        });
    } finally {
        loading = false;
        btn.innerHTML = '<i class="fas fa-upload me-2"></i> Iniciar Importação';
        btn.disabled = false;
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
                location.href = '/Categorias';
            }
        });
    } else {
        location.href = '/Categorias';
    }
}