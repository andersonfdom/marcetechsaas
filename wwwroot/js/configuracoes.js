// === Substitui $(document).ready por DOMContentLoaded ===
document.addEventListener('DOMContentLoaded', () => {
    initEditors();
    inicializarMascaras();
    CarregarDadosConfiguracao();
    atualizarPerfilStatus();

    // Evento de CEP (blur)
    const cepInput = document.getElementById('Cep');
    if (cepInput) {
        cepInput.addEventListener('blur', function () {
            let cep = this.value.replace(/\D/g, '');
            if (cep.length === 8) {
                Swal.fire({
                    title: 'Buscando CEP...',
                    text: 'Consultando endereço',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });

                fetch(`https://viacep.com.br/ws/${cep}/json/`)
                    .then(response => response.json())
                    .then(data => {
                        Swal.close();
                        if (!data.erro) {
                            document.getElementById('Logradouro').value = data.logradouro || '';
                            document.getElementById('Bairro').value = data.bairro || '';
                            document.getElementById('Cidade').value = data.localidade || '';
                            if (data.uf) document.getElementById('Estado').value = data.uf;

                            Swal.fire({
                                title: 'CEP encontrado!',
                                text: 'Endereço preenchido automaticamente',
                                icon: 'success',
                                timer: 1500,
                                showConfirmButton: false
                            });
                        } else {
                            Swal.fire('CEP não encontrado', 'Preencha o endereço manualmente', 'warning');
                        }
                    })
                    .catch(() => {
                        Swal.close();
                        Swal.fire('Erro', 'Falha ao buscar o CEP', 'error');
                    });
            }
        });
    }

    // Evento de mudança do tipo de pessoa (radio buttons)
    const radiosTipoPessoa = document.querySelectorAll('input[name="TipoPessoa"]');
    radiosTipoPessoa.forEach(radio => {
        radio.addEventListener('change', () => {
            atualizarPerfilStatus();
            alternarMascaraDocumento();
        });
    });
});

// ================== Funções auxiliares ==================
function atualizarPerfilStatus() {
    const isPJ = document.getElementById('pj')?.checked || false;
    const perfilStatusSpan = document.getElementById('perfilStatus');
    if (perfilStatusSpan) {
        perfilStatusSpan.textContent = isPJ ? 'Pessoa Jurídica' : 'Pessoa Física';
    }
}

function alternarMascaraDocumento() {
    const isPJ = document.getElementById('pj')?.checked || false;
    const cpfCnpjField = document.getElementById('Cpfcnpj');
    if (!cpfCnpjField) return;

    const valorAtual = cpfCnpjField.value.replace(/\D/g, '');

    // Remove event listener antigo e adiciona novo com a máscara apropriada
    cpfCnpjField.removeEventListener('input', mascaraCpfCnpjHandler);
    if (isPJ) {
        // Define placeholder e formatação de CNPJ
        cpfCnpjField.placeholder = '00.000.000/0000-00';
        cpfCnpjField.addEventListener('input', mascaraCpfCnpjHandler);
        // Atualiza labels
        const lblNome = document.getElementById('lblNome');
        if (lblNome) lblNome.innerHTML = '<i class="fas fa-tag me-1 text-primary"></i>Razão Social <span class="text-danger">*</span>';
        const lblCpf = document.getElementById('lblCpf');
        if (lblCpf) lblCpf.innerHTML = '<i class="fas fa-id-card me-1 text-primary"></i>CNPJ <span class="text-danger">*</span>';
        const dadosRg = document.getElementById('dadosRg');
        if (dadosRg) dadosRg.style.display = 'none';

        if (valorAtual.length === 14) {
            cpfCnpjField.value = formatarCNPJ(valorAtual);
        }
    } else {
        cpfCnpjField.placeholder = '000.000.000-00';
        cpfCnpjField.addEventListener('input', mascaraCpfCnpjHandler);
        const lblNome = document.getElementById('lblNome');
        if (lblNome) lblNome.innerHTML = '<i class="fas fa-tag me-1 text-primary"></i>Nome Completo <span class="text-danger">*</span>';
        const lblCpf = document.getElementById('lblCpf');
        if (lblCpf) lblCpf.innerHTML = '<i class="fas fa-id-card me-1 text-primary"></i>CPF <span class="text-danger">*</span>';
        const dadosRg = document.getElementById('dadosRg');
        if (dadosRg) dadosRg.style.display = 'block';

        if (valorAtual.length === 11) {
            cpfCnpjField.value = formatarCPF(valorAtual);
        }
    }
    // Força aplicação da máscara atual
    mascaraCpfCnpjHandler({ target: cpfCnpjField });
}

// Handler genérico para máscara de CPF/CNPJ
function mascaraCpfCnpjHandler(e) {
    const input = e.target;
    let valor = input.value.replace(/\D/g, '');
    const isPJ = document.getElementById('pj')?.checked || false;

    if (isPJ) {
        if (valor.length > 14) valor = valor.slice(0, 14);
        input.value = formatarCNPJ(valor);
    } else {
        if (valor.length > 11) valor = valor.slice(0, 11);
        input.value = formatarCPF(valor);
    }
}

function formatarCPF(cpf) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatarCNPJ(cnpj) {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

function initEditors() {
    tinymce.init({
        selector: '#Textocabecalhopadraoorcamentos, #Rodapepadraoorcamentos',
        height: 350,
        menubar: true,
        branding: false,
        promotion: false,
        language: 'pt_BR',
        plugins: ['advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen', 'insertdatetime', 'media', 'table', 'wordcount'],
        toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | table image code fullscreen',
        image_title: true,
        automatic_uploads: true,
        file_picker_types: 'image',
        file_picker_callback: function (callback, value, meta) {
            if (meta.filetype === 'image') {
                const input = document.createElement('input');
                input.setAttribute('type', 'file');
                input.setAttribute('accept', 'image/*');
                input.onchange = function () {
                    const file = this.files[0];
                    const reader = new FileReader();
                    reader.onload = function () {
                        callback(reader.result, { alt: file.name });
                    };
                    reader.readAsDataURL(file);
                };
                input.click();
            }
        },
        content_style: 'body { font-family: Arial, sans-serif; font-size: 14px; } img { max-width: 100%; height: auto; }'
    });
}

function inicializarMascaras() {
    // CEP
    const cepInput = document.getElementById('Cep');
    if (cepInput) {
        cepInput.placeholder = '00000-000';
        cepInput.addEventListener('input', function (e) {
            let valor = this.value.replace(/\D/g, '');
            if (valor.length > 8) valor = valor.slice(0, 8);
            if (valor.length > 5) {
                this.value = valor.slice(0, 5) + '-' + valor.slice(5);
            } else {
                this.value = valor;
            }
        });
    }

    // Telefone (00) 00000-0000
    const telefoneInput = document.getElementById('Telefone');
    if (telefoneInput) {
        telefoneInput.placeholder = '(00) 00000-0000';
        telefoneInput.addEventListener('input', function (e) {
            let valor = this.value.replace(/\D/g, '');
            if (valor.length > 11) valor = valor.slice(0, 11);
            if (valor.length >= 2) {
                let parte1 = valor.slice(0, 2);
                let parte2 = valor.slice(2, 7);
                let parte3 = valor.slice(7, 11);
                if (parte3) this.value = `(${parte1}) ${parte2}-${parte3}`;
                else if (parte2) this.value = `(${parte1}) ${parte2}`;
                else this.value = `(${parte1}`;
            } else {
                this.value = valor;
            }
        });
    }

    // RG 00.000.000-0
    const rgInput = document.getElementById('Rg');
    if (rgInput) {
        rgInput.placeholder = '00.000.000-0';
        rgInput.addEventListener('input', function (e) {
            let valor = this.value.replace(/\D/g, '');
            if (valor.length > 9) valor = valor.slice(0, 9);
            if (valor.length > 6) {
                this.value = valor.slice(0, 2) + '.' + valor.slice(2, 5) + '.' + valor.slice(5, 8) + '-' + valor.slice(8);
            } else if (valor.length > 2) {
                this.value = valor.slice(0, 2) + '.' + valor.slice(2);
            } else {
                this.value = valor;
            }
        });
    }

    // Inicializar máscara de CPF/CNPJ
    alternarMascaraDocumento();
}

function CarregarDadosConfiguracao() {
    const idMarceneiro = document.getElementById('IdMarceneiro')?.value || '';

    Swal.fire({
        title: 'Carregando...',
        text: 'Buscando dados da configuração',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    fetch(`/CarregarDadosMarceneiro?id=${idMarceneiro}`, { method: 'POST' })
        .then(response => response.json())
        .then(d => {
            Swal.close();

            document.getElementById('Nome').value = d.nome || '';
            document.getElementById('Cpfcnpj').value = d.cpfCnpj || '';
            document.getElementById('Rg').value = d.rg || '';
            document.getElementById('Telefone').value = d.telefone || '';
            document.getElementById('Email').value = d.email || '';
            document.getElementById('Cep').value = d.cep || '';
            document.getElementById('Logradouro').value = d.logradouro || '';
            document.getElementById('Numerologradouro').value = d.numeroLogradouro || '';
            document.getElementById('Complemento').value = d.complemento || '';
            document.getElementById('Bairro').value = d.bairro || '';
            document.getElementById('Cidade').value = d.cidade || '';

            let estado = d.estado || '';
            if (estado.length === 2) {
                document.getElementById('Estado').value = estado;
            } else {
                const estadosExtenso = {
                    'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas', 'BA': 'Bahia',
                    'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo', 'GO': 'Goiás',
                    'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul', 'MG': 'Minas Gerais',
                    'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná', 'PE': 'Pernambuco', 'PI': 'Piauí',
                    'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte', 'RS': 'Rio Grande do Sul',
                    'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina', 'SP': 'São Paulo',
                    'SE': 'Sergipe', 'TO': 'Tocantins'
                };
                const sigla = Object.keys(estadosExtenso).find(key => estadosExtenso[key] === estado);
                document.getElementById('Estado').value = sigla || '';
            }

            const tipoPessoa = d.tipoPessoa || '0';
            if (tipoPessoa === "1" || tipoPessoa === 1) {
                document.getElementById('pj').checked = true;
            } else {
                document.getElementById('pf').checked = true;
            }

            alternarMascaraDocumento();
            atualizarPerfilStatus();

            if (d.logoBase64) {
                const img = d.logoBase64;
                const logoAtualBase64 = document.getElementById('logoAtualBase64');
                if (logoAtualBase64) logoAtualBase64.value = img;
                const logoExistente = document.getElementById('logoExistente');
                if (logoExistente) {
                    const imgSrc = img.startsWith('data:image') ? img : 'data:image/jpeg;base64,' + img;
                    logoExistente.src = imgSrc;
                }
                const previewContainer = document.getElementById('previewContainer');
                if (previewContainer) previewContainer.classList.remove('d-none');
            }

            setEditorContent('Textocabecalhopadraoorcamentos', d.textoCabecalhoPadraoOrcamentos || '');
            setEditorContent('Rodapepadraoorcamentos', d.rodapePadraoOrcamentos || '');

            const now = new Date();
            const formattedDate = now.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            const lastUpdate = document.getElementById('lastUpdate');
            if (lastUpdate) lastUpdate.textContent = formattedDate;
        })
        .catch(error => {
            Swal.close();
            console.error('Erro:', error);
            Swal.fire({
                title: 'Erro!',
                text: 'Erro ao carregar dados da configuração',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#667eea'
            });
        });
}

function setEditorContent(id, content) {
    const editor = tinymce.get(id);
    if (editor && editor.initialized) {
        editor.setContent(content || '');
    } else {
        setTimeout(() => setEditorContent(id, content), 100);
    }
}

// Logo upload
const logoUpload = document.getElementById('logoUpload');
if (logoUpload) {
    logoUpload.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                Swal.fire('Erro', 'A imagem deve ter no máximo 2MB', 'error');
                this.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const logoExistente = document.getElementById('logoExistente');
                if (logoExistente) logoExistente.src = e.target.result;
                const logoAtualBase64 = document.getElementById('logoAtualBase64');
                if (logoAtualBase64) logoAtualBase64.value = e.target.result;
                const previewContainer = document.getElementById('previewContainer');
                if (previewContainer) previewContainer.classList.remove('d-none');
                Swal.fire({
                    title: 'Imagem carregada!',
                    text: 'Não esqueça de salvar as alterações',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            };
            reader.readAsDataURL(file);
        }
    });
}

// Remover imagem
const removeImageBtn = document.getElementById('removeImage');
if (removeImageBtn) {
    removeImageBtn.addEventListener('click', () => {
        Swal.fire({
            title: 'Remover logomarca?',
            text: 'A imagem atual será removida',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#667eea',
            confirmButtonText: 'Sim, remover',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                const logoUpload = document.getElementById('logoUpload');
                if (logoUpload) logoUpload.value = '';
                const logoAtualBase64 = document.getElementById('logoAtualBase64');
                if (logoAtualBase64) logoAtualBase64.value = '';
                const previewContainer = document.getElementById('previewContainer');
                if (previewContainer) previewContainer.classList.add('d-none');
                Swal.fire('Removida!', 'Logomarca removida com sucesso', 'success');
            }
        });
    });
}

function GravarDadosConfiguracao() {
    const nome = document.getElementById('Nome')?.value.trim() || '';
    const cpfCnpjField = document.getElementById('Cpfcnpj');
    const documento = cpfCnpjField ? cpfCnpjField.value.replace(/\D/g, '') : '';
    const telefoneField = document.getElementById('Telefone');
    const telefone = telefoneField ? telefoneField.value.replace(/\D/g, '') : '';
    const email = document.getElementById('Email')?.value.trim() || '';

    if (!nome) {
        Swal.fire('Aviso', 'O campo Nome/Razão Social é obrigatório', 'warning');
        return;
    }
    if (!documento) {
        Swal.fire('Aviso', 'O campo CPF/CNPJ é obrigatório', 'warning');
        return;
    }
    if (!telefone) {
        Swal.fire('Aviso', 'O campo Telefone é obrigatório', 'warning');
        return;
    }
    if (!email) {
        Swal.fire('Aviso', 'O campo E-mail é obrigatório', 'warning');
        return;
    }

    const btn = document.getElementById('btnSalvarMarceneiro');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Salvando...';
    }

    Swal.fire({
        title: 'Salvando...',
        text: 'Processando os dados da configuração',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    const tipoPessoaRadio = document.querySelector('input[name="TipoPessoa"]:checked');
    const tipoPessoa = tipoPessoaRadio ? tipoPessoaRadio.value : '';

    const idMarceneiro = document.getElementById('IdMarceneiro')?.value || '';
    const rg = document.getElementById('Rg')?.value.replace(/\D/g, '') || '';
    const cep = document.getElementById('Cep')?.value.replace(/\D/g, '') || '';
    const logradouro = document.getElementById('Logradouro')?.value || '';
    const numeroLogradouro = document.getElementById('Numerologradouro')?.value || '';
    const complemento = document.getElementById('Complemento')?.value || '';
    const bairro = document.getElementById('Bairro')?.value || '';
    const cidade = document.getElementById('Cidade')?.value || '';
    const estado = document.getElementById('Estado')?.value || '';

    const logoBase64 = document.getElementById('logoAtualBase64')?.value || '';
    const logo = logoBase64.includes(',') ? logoBase64.split(',')[1] : logoBase64;

    const payload = {
        id: parseInt(idMarceneiro),
        Tipopessoa: tipoPessoa,
        Nome: nome,
        Cpfcnpj: documento,
        Rg: rg,
        Telefone: telefone,
        Email: email,
        Cep: cep,
        Logradouro: logradouro,
        Numerologradouro: numeroLogradouro,
        Complemento: complemento,
        Bairro: bairro,
        Cidade: cidade,
        Estado: estado,
        IsNovoCadastro: 'false',
        Textocabecalhopadraoorcamentos: tinymce.get('Textocabecalhopadraoorcamentos')?.getContent() || '',
        Rodapepadraoorcamentos: tinymce.get('Rodapepadraoorcamentos')?.getContent() || '',
        Logo: logo
    };

    fetch('/SalvarDadosMarceneiro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(response => response.json())
        .then(r => {
            Swal.close();
            const sucesso = r.codigo === 0 || r.sucesso;
            const mensagem = r.mensagem || (sucesso ? 'Configurações salvas com sucesso!' : 'Erro ao salvar configurações');
            if (sucesso) {
                Swal.fire({
                    title: "Sucesso!",
                    text: mensagem,
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = '/Home/Index';
                });
            } else {
                Swal.fire({
                    title: "Erro",
                    text: mensagem,
                    icon: "error",
                    confirmButtonColor: "#667eea"
                });
            }
        })
        .catch(error => {
            Swal.close();
            console.error('Erro:', error);
            Swal.fire({
                title: "Erro",
                text: "Falha ao salvar no servidor. Verifique sua conexão.",
                icon: "error",
                confirmButtonColor: "#667eea"
            });
        })
        .finally(() => {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-save me-2"></i>Salvar Alterações';
            }
        });
}

function confirmarCancelamento() {
    Swal.fire({
        title: 'Cancelar alterações?',
        text: 'As alterações não salvas serão perdidas.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#667eea',
        confirmButtonText: 'Sim, cancelar',
        cancelButtonText: 'Continuar editando',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = '/Home/Index';
        }
    });
}