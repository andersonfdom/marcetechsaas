// Máscaras simples
function mascaraCpfCnpj(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length <= 11) {
        input.value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
        input.value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
}
function mascaraTelefone(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 11) {
        input.value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else {
        input.value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
}
function mascaraCep(input) {
    let value = input.value.replace(/\D/g, '');
    input.value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
}

// Preencher data atual
function preencherDataAtual() {
    const hoje = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    document.querySelectorAll('.data-contrato').forEach(el => el.innerText = hoje);
}

// ================== Controle de estado dos botões (visibilidade) ==================
let modoEdicaoLayout = false;

function configurarBotoesAcao(emEdicaoLayout = false) {
    const container = document.getElementById('botoes-acao-contrato');
    if (!container) return;

    const botoes = container.querySelectorAll('button');
    // Ordem esperada no HTML:
    // 0 - Editar Dados
    // 1 - Editar Layout
    // 2 - Restaurar Layout Original
    // 3 - Download
    // 4 - Enviar por E-mail
    // 5 - Cancelar
    if (botoes.length < 6) return;

    const btnEditarDados = botoes[0];
    const btnEditarLayout = botoes[1];
    const btnRestaurar = botoes[2];
    const btnDownload = botoes[3];
    const btnEmail = botoes[4];
    const btnCancelar = botoes[5];

    if (emEdicaoLayout) {
        modoEdicaoLayout = true;

        // Transforma "Editar Layout" em "Salvar Layout"
        btnEditarLayout.innerHTML = '<i class="fas fa-save me-2"></i>Salvar Layout';
        btnEditarLayout.classList.remove('btn-secondary');
        btnEditarLayout.classList.add('btn-primary');

        // Visibilidade: mostra apenas Salvar Layout, Restaurar Layout, Cancelar
        btnEditarLayout.style.display = '';        // mostra
        btnRestaurar.style.display = '';           // mostra
        btnCancelar.style.display = '';            // mostra

        btnEditarDados.style.display = 'none';     // esconde
        btnDownload.style.display = 'none';        // esconde
        btnEmail.style.display = 'none';           // esconde

        // Ação do Cancelar: recarregar a página
        btnCancelar.onclick = function () {
            window.location.reload();
        };

    } else {
        modoEdicaoLayout = false;

        // Restaura o botão "Editar Layout" ao original
        btnEditarLayout.innerHTML = '<i class="fas fa-object-group me-2"></i>Editar Layout';
        btnEditarLayout.classList.remove('btn-primary');
        btnEditarLayout.classList.add('btn-secondary');

        // Visibilidade: mostra todos, exceto Restaurar Layout
        btnEditarDados.style.display = '';
        btnEditarLayout.style.display = '';
        btnDownload.style.display = '';
        btnEmail.style.display = '';
        btnCancelar.style.display = '';

        btnRestaurar.style.display = 'none';       // esconde (desabilitado visualmente)

        // Ação do Cancelar: voltar()
        btnCancelar.onclick = function () {
            voltar();
        };
    }
}
// ================== Fim do controle de estado ==================

// Gravar dados do modal e atualizar visualização
function gravarDadosContrato() {
    Swal.fire({
        title: 'Aguarde...',
        text: 'Gravando dados Contrato',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    var dto = {
        Id: parseInt(document.getElementById('idContrato')?.value) || 0,
        Idorcamento: parseInt(document.getElementById('idOrcamentoContrato')?.value) || 0,

        Nomeclientecontrato: document.getElementById('nomeclientecontrato')?.value || '',
        Cpfclientecontrato: document.getElementById('cpfclientecontrato')?.value || '',
        Rgclientecontrato: document.getElementById('rgclientecontrato')?.value || '',
        Telefoneclientecontrato: document.getElementById('telefoneclientecontrato')?.value || '',
        Enderecoclientecontrato: document.getElementById('enderecoclientecontrato')?.value || '',
        Cepclientecontrato: document.getElementById('cepclientecontrato')?.value || '',

        Nomevendedorcontrato: document.getElementById('nomevendedorcontrato')?.value || '',
        Cpfvendedorcontrato: document.getElementById('cpfvendedorcontrato')?.value || '',
        Rgvendedorcontrato: document.getElementById('rgvendedorcontrato')?.value || '',
        Telefonevendedorcontrato: document.getElementById('telefonevendedorcontrato')?.value || '',

        Arquitetocontrato: document.getElementById('arquitetocontrato')?.value || '',
        Pagamentortcontrato: document.getElementById('pagamentortcontrato')?.value === "Sim" ? 1 : 0,
        Valorrtcontrato: parseFloat(document.getElementById('valorrtcontrato')?.value) || 0,
        Pontuacaoarchicontrato: document.getElementById('pontuacaoarchicontrato')?.value === "Sim" ? 1 : 0,
        Chavepixcontrato: document.getElementById('chavepixcontrato')?.value || '',
        Prazoscontrato: tinymce.get('prazoscontrato').getContent(),
        Descricaoformapagamentocontrato: tinymce.get('descricaoformapagamentocontrato').getContent(),
        Layoutcontrato: ""
    };

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/SalvarDadosContrato", false);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            Swal.close();
            var retornoApi = JSON.parse(xmlhttp.responseText);

            if (retornoApi.sucesso === true) {
                Swal.fire({
                    title: retornoApi.mensagem,
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    fecharModal();
                    window.location.reload();
                });
            } else {
                Swal.fire({ title: retornoApi.mensagem, icon: "error", timer: 2000, showConfirmButton: false })
                    .then(() => { return; });
            }
        }
    };

    xmlhttp.send(JSON.stringify(dto));
}

function abrirModal() {
    $('#modalContrato').modal('show');
}

function fecharModal() {
    $('#modalContrato').modal('hide');
}

function handleDownload() {
    Swal.fire({
        title: 'Aguarde...',
        text: 'Realizando Download Contrato',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        const idContrato = document.getElementById('idContrato')?.value || '99';
        const dadosEnvio = {
            html: prepararHTML(),
            idContrato: idContrato
        };

        fetch("/RealizarDownloadDadosContrato", {
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
                a.download = `contratoto_${idContrato}.pdf`;
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

function CarregarDadosContrato(idOrcamento) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/CarregarDadosContrato?idOrcamento=" + idOrcamento, false);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            var retornoApi = JSON.parse(xmlhttp.responseText);

            console.log(retornoApi);

            atribuirElementoHTML('view-marceneiro-nome', retornoApi.nomeMarceneiro);

            if (retornoApi.tipoPessoaMarceneiro === 1) {
                atribuirElementoHTML('view-marceneiro-label-doc', "CNPJ");
            } else {
                atribuirElementoHTML('view-marceneiro-label-doc', "CPF");
            }

            const estadosExtenso = {
                'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas', 'BA': 'Bahia',
                'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo', 'GO': 'Goiás',
                'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul', 'MG': 'Minas Gerais',
                'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná', 'PE': 'Pernambuco', 'PI': 'Piauí',
                'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte', 'RS': 'Rio Grande do Sul',
                'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina', 'SP': 'São Paulo',
                'SE': 'Sergipe', 'TO': 'Tocantins'
            };

            // Contratada
            atribuirElementoHTML('view-marceneiro-doc', retornoApi.cpfCnpjMarceneiro);
            document.getElementById("view-logo").src = "data:image/jpeg;base64," + retornoApi.logo;
            atribuirElementoHTML('view-marceneiro-email', retornoApi.emailMarceneiro);
            atribuirElementoHTML('view-marceneiro-tel', retornoApi.telefoneMarceneiro);
            atribuirElementoHTML('view-marceneiro-endereco', "com sede na " + retornoApi.enderecoCompletoMarceneiro + "," + retornoApi.cepMarceneiro);
            atribuirElementoHTML('view-marceneiro-endereco2', "Telefone: " + retornoApi.telefoneMarceneiro + ", Estado do " + estadosExtenso[retornoApi.estadoMarceneiro] || retornoApi.estadoMarceneiro || '');

            // Contratante
            var cpfCnpjCliente = retornoApi.cpfCnpjCliente;

            if (cpfCnpjCliente.length > 14) {
                document.getElementById("label-cliente-nome").textContent = "Razão Social: ";
                document.getElementById("label-cliente-doc").textContent = "CNPJ: ";
            } else {
                document.getElementById("label-cliente-nome").textContent = "Nome: ";
                document.getElementById("label-cliente-doc").textContent = "CPF: ";
            }

            document.getElementById("view-cliente-nome").textContent = retornoApi.nomeCliente;
            document.getElementById("view-cliente-doc").textContent = retornoApi.cpfCnpjCliente;
            document.getElementById("view-cliente-endereco").textContent = retornoApi.enderecoCliente;
            atribuirElementoHTML('dosprazos', retornoApi.prazoEntrega);
            atribuirElementoHTML('formaPagamento', retornoApi.formaPagamento);

            atribuirElementoHTML('cidadeComarca', retornoApi.cidadeComarca + "/" + retornoApi.estadoComarca);

            var dadosviewambientestabela = "";
            var ambientesOrcamento = retornoApi.ambientesOrcamento;

            ambientesOrcamento.forEach(function (ambiente) {
                dadosviewambientestabela += '<tr style="vertical-align: top;">';
                dadosviewambientestabela += '    <td style="width: 22%; font-weight: bold; padding: 3mm 4mm; border: 1px solid #bbb;">' + ambiente.ambiente + '</td>';
                dadosviewambientestabela += '    <td style="padding: 3mm 4mm; border: 1px solid #bbb; border-left: none; text-align: justify;">';
                dadosviewambientestabela += ambiente.descricao;
                dadosviewambientestabela += '    </td>';
                dadosviewambientestabela += '</tr>';
            });

            atribuirElementoHTML('view-ambientes-tabela', dadosviewambientestabela);
            atribuirElementoHTML('view-cidade-assinatura', retornoApi.cidadeAssinatura + ",");
            atribuirElementoHTML('rgCliente', retornoApi.rgCliente);
            atribuirElementoHTML('cpfCliente', retornoApi.cpfCnpjCliente);
            atribuirElementoHTML('rgVendedor', retornoApi.rgVendedor);
            atribuirElementoHTML('cpfVendedor', retornoApi.cpfVendedor);

            const templateOriginal = document.getElementById('template-contrato-pdf').innerHTML;
            atribuirElementoHTML('template-contrato-pdf', "");

            if (retornoApi.layoutContrato === 'vazio') {
                atribuirElementoHTML('template-contrato-pdf', templateOriginal);
            } else {
                atribuirElementoHTML('template-contrato-pdf', retornoApi.layoutContrato);
            }
        }
    };

    xmlhttp.send();
}

// Inicialização
window.onload = function () {
    preencherDataAtual();
    initEditorsContrato();

    var idOrcamentoContrato = document.getElementById('idOrcamentoContrato')?.value;
    CarregarDadosOrcamentoContrato(idOrcamentoContrato);

    var idContrato = document.getElementById("idContrato").value;

    if (idContrato === 0 || idContrato === '0') {
        document.getElementById('template-contrato-pdf').style.display = 'none';
        document.getElementById('botoes-acao-contrato').style.display = 'none';
        abrirModal();
    } else {
        document.getElementById('template-contrato-pdf').style.display = 'block';
        document.getElementById('botoes-acao-contrato').style.display = "block";
        CarregarDadosContrato(idOrcamentoContrato);
        // Configura estado inicial dos botões (modo normal)
        configurarBotoesAcao(false);
    }
};

function CarregarDadosOrcamentoContrato(idOrcamentoContrato) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/CarregarDadosOrcamentoContrato?idOrcamento=" + idOrcamentoContrato, false);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            var retornoApi = JSON.parse(xmlhttp.responseText);

            atribuirCampo('nomeclientecontrato', retornoApi.nomeclientecontrato);
            atribuirCampo('telefoneclientecontrato', retornoApi.telefoneclientecontrato);
            atribuirCampo('arquitetocontrato', retornoApi.arquitetocontrato);
            atribuirCampo('valorrtcontrato', retornoApi.valorrtcontrato);
            atribuirCampo('idContrato', retornoApi.idcontrato);

            atribuirCampo('nomevendedorcontrato', retornoApi.nomevendedorcontrato);
            atribuirCampo('cpfvendedorcontrato', retornoApi.cpfvendedorcontrato);
            atribuirCampo('telefonevendedorcontrato', retornoApi.telefonevendedorcontrato);
        }
    };

    xmlhttp.send();
}

function atribuirCampo(campo, valor) {
    document.getElementById(campo).value = valor;
}

function atribuirElementoHTML(campo, valor) {
    document.getElementById(campo).innerHTML = valor;
}

function voltar() {
    window.location.href = "/Orcamentos/Visualizar?id=" + document.getElementById('idOrcamentoContrato')?.value;
}

function initEditorsContrato() {
    tinymce.init({
        selector: '#prazoscontrato, #descricaoformapagamentocontrato',
        height: 250,
        menubar: false,
        language: 'pt_BR',
        plugins: 'lists link image table code wordcount',
        toolbar: 'undo redo | blocks | bold italic underline forecolor | alignleft aligncenter alignright | bullist numlist | table image code removeformat',
        branding: false,
        promotion: false,
        setup: function (editor) {
            editor.on('init', function () {
            });
        }
    });
}

function handleEditarDados() {
    const idOrcamentoContrato = document.getElementById('idOrcamentoContrato')?.value;
    if (!idOrcamentoContrato) {
        console.error('ID do orçamento não encontrado');
        return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/CarregarDadosEditarContrato?idOrcamento=" + idOrcamentoContrato);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    const retornoApi = JSON.parse(xhr.responseText);

                    atribuirCampo('idContrato', retornoApi.idContrato);
                    atribuirCampo('idOrcamentoContrato', retornoApi.idOrcamentoContrato);

                    atribuirCampo('nomeclientecontrato', retornoApi.nomeclientecontrato);
                    atribuirCampo('cpfclientecontrato', retornoApi.cpfclientecontrato);
                    atribuirCampo('rgclientecontrato', retornoApi.rgclientecontrato);
                    atribuirCampo('telefoneclientecontrato', retornoApi.telefoneclientecontrato);
                    atribuirCampo('enderecoclientecontrato', retornoApi.enderecoclientecontrato);
                    atribuirCampo('cepclientecontrato', retornoApi.cepclientecontrato);

                    atribuirCampo('nomevendedorcontrato', retornoApi.nomevendedorcontrato);
                    atribuirCampo('cpfvendedorcontrato', retornoApi.cpfvendedorcontrato);
                    atribuirCampo('rgvendedorcontrato', retornoApi.rgvendedorcontrato);
                    atribuirCampo('telefonevendedorcontrato', retornoApi.telefonevendedorcontrato);

                    atribuirCampo('arquitetocontrato', retornoApi.arquitetocontrato);
                    atribuirCampo('pagamentortcontrato', retornoApi.pagamentortcontrato);
                    atribuirCampo('valorrtcontrato', retornoApi.valorrtcontrato);
                    atribuirCampo('pontuacaoarchicontrato', retornoApi.pontuacaoarchicontrato);
                    atribuirCampo('chavepixcontrato', retornoApi.chavepixcontrato);

                    if (tinymce.get('prazoscontrato')) tinymce.get('prazoscontrato').setContent(retornoApi.prazoscontrato || '');
                    if (tinymce.get('descricaoformapagamentocontrato')) tinymce.get('descricaoformapagamentocontrato').setContent(retornoApi.descricaoformapagamentocontrato || '');

                    abrirModal();
                } catch (e) {
                    console.error('Erro ao parsear JSON', e);
                }
            } else {
                console.error('Erro na requisição:', xhr.status);
            }
        }
    };
    xhr.send();
}

function prepararHTML(seletorTemplate = '#template-contrato-pdf') {
    const template = document.querySelector(seletorTemplate);

    if (!template) {
        throw new Error(`Template ${seletorTemplate} não encontrado.`);
    }

    const clone = template.cloneNode(true);

    clone.querySelectorAll('.no-print, script').forEach(el => el.remove());

    clone.querySelectorAll('*').forEach(el => {
        [...el.attributes].forEach(attr => {
            if (attr.name.startsWith('on')) {
                el.removeAttribute(attr.name);
            }
        });
    });

    clone.querySelectorAll('img').forEach(img => {
        if (!img.src || img.src.trim() === '') {
            img.remove();
        }
    });

    const css = `
    <style>
        @page {
            size: A4;
            margin: 12mm 10mm;
        }

        html, body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            font-size: 10.5pt;
            line-height: 1.45;
            color: #000;
            background: #fff;
            -webkit-print-color-adjust: exact;
        }

        #template-contrato-pdf {
            width: 100%;
        }

       img {
            max-width: 100%;
            max-height: 60px;
            width: auto;
            height: auto;
            object-fit: contain;
        }

        p {
            margin: 0 0 4mm 0;
            text-align: justify;
            page-break-inside: avoid;
        }

        h1,h2,h3,h4,h5 {
            page-break-after: avoid;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            page-break-inside: auto;
        }

        tr {
            page-break-inside: avoid;
        }

        td, th {
            padding: 2.5mm;
            vertical-align: top;
            word-break: break-word;
        }

        .assinaturas {
            width: 100%;
            margin-top: 15mm;
            page-break-inside: avoid;
        }

        .assinatura {
            display: inline-block;
            width: 48%;
            vertical-align: top;
            text-align: center;
        }

        .linha-assinatura {
            border-top: 1px solid #000;
            margin-top: 10mm;
        }

        #anexo-ii {
            page-break-before: always;
        }

        .secao-header,
        .clausula-box,
        .contratante-box {
            page-break-inside: avoid;
        }
    </style>
    `;

    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        ${css}
    </head>
    <body>
        ${clone.outerHTML}
    </body>
    </html>
    `;
}

function handleEnviarEmail() {
    Swal.fire({
        title: 'Aguarde...',
        text: 'Enviando contrato via e-mail para o cliente',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        const idOrcamento = document.getElementById('idOrcamentoContrato')?.value || '0';
        const dadosEnvio = {
            html: prepararHTML(),
            idOrcamento: idOrcamento
        };

        fetch("/EnviarContratoPorEmail", {
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

// Função para restaurar o layout original
function handleRestaurarLayout() {
    Swal.fire({
        title: 'Restaurar Layout Original',
        text: 'Tem certeza de que deseja restaurar o layout padrão?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, restaurar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Aguarde...',
                text: 'Restaurando layout',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const idContrato = document.getElementById('idContrato')?.value;
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("POST", "/RestaurarLayoutContratoOriginal", false);
            xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                    var retornoApi = JSON.parse(xmlhttp.responseText);
                    if (retornoApi.sucesso) {
                        window.location.reload();
                    } else {
                        Swal.fire('Erro', retornoApi.mensagem, 'error');
                    }
                }
            };
            xmlhttp.send(JSON.stringify({ Id: idContrato }));
        }
    });
}

// Variável global para controlar o estado do editor
let tinyMCEInicializado = false;

function handleEditarLayout() {
    const visual = document.getElementById('template-contrato-pdf');
    const editorDiv = document.getElementById('template-contrato-pdf-edicao');
    const layoutOriginal = visual.innerHTML;

    if (!visual || !editorDiv) return;

    const editorExistente = tinymce.get('template-contrato-pdf-edicao');

    if (editorExistente) {
        // Já está em modo de edição → salvar
        salvarLayoutContrato();
        return;
    }

    // clona html visual
    editorDiv.innerHTML = visual.innerHTML;

    // remove ids duplicados
    editorDiv.querySelectorAll('[id]').forEach(el => {
        if (el.id !== 'template-contrato-pdf-edicao') {
            el.removeAttribute('id');
        }
    });

    visual.style.display = 'none';
    editorDiv.style.display = 'block';

    tinymce.init({
        selector: '#template-contrato-pdf-edicao',
        inline: true,
        menubar: false,
        language: 'pt_BR',

        plugins: [
            'advlist',
            'autolink',
            'lists',
            'link',
            'image',
            'charmap',
            'preview',
            'anchor',
            'searchreplace',
            'visualblocks',
            'code',
            'fullscreen',
            'insertdatetime',
            'media',
            'table',
            'wordcount',
            'quickbars'
        ],

        toolbar: `
        undo redo |
        blocks |
        fontfamily |
        fontsize |
        bold italic underline |
        forecolor backcolor |
        alignleft aligncenter alignright alignjustify |
        bullist numlist |
        outdent indent |
        table image link |
        removeformat code
    `,

        toolbar_mode: 'sliding',

        quickbars_selection_toolbar: false,
        quickbars_insert_toolbar: false,

        branding: false,
        promotion: false,

        verify_html: false,
        valid_elements: '*[*]',
        extended_valid_elements: '*[*]',
        forced_root_block: false,

        content_style: `
        body {
            font-family: Arial, sans-serif;
            font-size: 10.5pt;
            line-height: 1.5;
            background: white;
            padding: 15mm;
        }
    `,

        setup: function (editor) {
            editor.on('click keyup focus', function () {
                editor.focus();
            });
        }
    });

    // Atualiza botões para modo edição (mostra/oculta conforme regra)
    configurarBotoesAcao(true);

    const dto = {
        Id: document.getElementById('idContrato')?.value,
        HtmlOriginal: layoutOriginal
    };

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/SalvarLayoutContratoOriginal", false);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            var retornoApi = JSON.parse(xmlhttp.responseText);
        }
    };

    xmlhttp.send(JSON.stringify(dto));
}

function salvarLayoutContrato() {
    const visual = document.getElementById('template-contrato-pdf');
    const editorDiv = document.getElementById('template-contrato-pdf-edicao');

    const editor = tinymce.get('template-contrato-pdf-edicao');

    if (!editor) return;

    const htmlEditado = editor.getContent();

    editor.remove();

    visual.innerHTML = htmlEditado;

    editorDiv.innerHTML = '';
    editorDiv.style.display = 'none';

    const dto = {
        Id: document.getElementById('idContrato')?.value,
        HtmlEditado: htmlEditado
    };

    visual.style.display = 'block';

    // Restaura botões para modo normal
    configurarBotoesAcao(false);

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/SalvarLayoutContratoEditado", false);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            var retornoApi = JSON.parse(xmlhttp.responseText);

            if (retornoApi.sucesso) {
                Swal.fire({ title: retornoApi.mensagem, icon: "success", timer: 2000, showConfirmButton: false })
                    .then(() => { window.location.reload(); });
            } else {
                Swal.fire({ title: "Erro", text: retornoApi.mensagem, icon: "error" })
                    .then(() => { if (isFinalizar) window.location.reload(); });
            }
        }
    };

    xmlhttp.send(JSON.stringify(dto));
}