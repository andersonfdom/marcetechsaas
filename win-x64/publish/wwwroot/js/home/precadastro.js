
    // Variáveis globais
    let logoBase64 = '';
    let loading = false;

    // Elementos DOM
    const tipoFisica = document.getElementById('tipoFisica');
    const tipoJuridica = document.getElementById('tipoJuridica');
    const lblNome = document.getElementById('lblNome');
    const lblCpf = document.getElementById('lblCpf');
    const inputNome = document.getElementById('Nome');
    const inputCpfcnpj = document.getElementById('Cpfcnpj');
    const inputRg = document.getElementById('Rg');
    const divRg = document.getElementById('dadosRg');
    const inputTelefone = document.getElementById('Telefone');
    const inputEmail = document.getElementById('Email');
    const inputCep = document.getElementById('Cep');
    const inputLogradouro = document.getElementById('Logradouro');
    const inputNumero = document.getElementById('Numerologradouro');
    const inputComplemento = document.getElementById('Complemento');
    const inputBairro = document.getElementById('Bairro');
    const inputCidade = document.getElementById('Cidade');
    const selectEstado = document.getElementById('Estado');
    const logoUpload = document.getElementById('logoUpload');
    const previewContainer = document.getElementById('previewContainer');
    const logoPreview = document.getElementById('logoPreview');
    const removeImage = document.getElementById('removeImage');
    const btnGravar = document.getElementById('btnGravar');

    // Instâncias IMask
    let cpfCnpjMask = null;
    let telefoneMask = null;
    let cepMask = null;

    // Inicializar máscaras
    function initMasks() {
        // Telefone
        telefoneMask = IMask(inputTelefone, {
            mask: '(00) 00000-0000'
        });

        // CEP
        cepMask = IMask(inputCep, {
            mask: '00000-000'
        });

        // CPF/CNPJ inicial (padrão PF)
        atualizarMascaraCpfCnpj();
    }

    // Atualizar máscara de CPF/CNPJ baseado no tipo
    function atualizarMascaraCpfCnpj() {
        const isJuridica = tipoJuridica.checked;
        if (cpfCnpjMask) {
            cpfCnpjMask.destroy();
        }
        cpfCnpjMask = IMask(inputCpfcnpj, {
            mask: isJuridica ? '00.000.000/0000-00' : '000.000.000-00'
        });
        // Limpar o campo ao trocar tipo
        inputCpfcnpj.value = '';
    }

    // Alternar tipo de pessoa
    function alternarTipoPessoa() {
        const isJuridica = tipoJuridica.checked;
        
        // Alterar labels
        if (isJuridica) {
            lblNome.innerHTML = '<i class="fas fa-tag me-1 text-primary"></i>Razão Social <span class="text-danger">*</span>';
            lblCpf.innerHTML = '<i class="fas fa-id-card me-1 text-primary"></i>CNPJ <span class="text-danger">*</span>';
            // Esconder campo RG (para PJ)
            divRg.style.display = 'none';
            inputRg.value = '';
        } else {
            lblNome.innerHTML = '<i class="fas fa-tag me-1 text-primary"></i>Nome Completo <span class="text-danger">*</span>';
            lblCpf.innerHTML = '<i class="fas fa-id-card me-1 text-danger"></i>CPF <span class="text-danger">*</span>';
            divRg.style.display = 'block';
        }
        
        atualizarMascaraCpfCnpj();
    }

    // Buscar CEP no ViaCEP
    async function buscarCep() {
        const cep = inputCep.value.replace(/\D/g, '');
        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                
                if (!data.erro) {
                    inputLogradouro.value = data.logradouro || '';
                    inputBairro.value = data.bairro || '';
                    inputCidade.value = data.localidade || '';
                    
                    // Selecionar estado no dropdown
                    if (data.uf) {
                        const option = Array.from(selectEstado.options).find(opt => opt.value === data.uf);
                        if (option) {
                            selectEstado.value = data.uf;
                        }
                    }
                    
                    // Focar no número após preencher
                    inputNumero.focus();
                } else {
                    Swal.fire("Erro", "CEP não encontrado.", "error");
                }
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
                Swal.fire("Erro", "Não foi possível buscar o CEP.", "error");
            }
        }
    }

    // Converter imagem para Base64
    function converterImagemParaBase64(file) {
        return new Promise((resolve, reject) => {
            if (file.size > 2097152) { // 2MB
                Swal.fire("Aviso", "O arquivo é muito grande! Máximo 2MB.", "warning");
                reject("Arquivo muito grande");
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target.result;
                resolve(base64.split(',')[1]); // Retorna apenas a parte Base64
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Manipular upload da logo
    function handleLogoUpload(event) {
        const file = event.target.files[0];
        if (file) {
            converterImagemParaBase64(file)
                .then(base64 => {
                    logoBase64 = base64;
                    const previewUrl = URL.createObjectURL(file);
                    logoPreview.src = previewUrl;
                    previewContainer.classList.remove('d-none');
                })
                .catch(() => {
                    logoUpload.value = '';
                });
        }
    }

    // Remover logo
    function handleRemoveLogo() {
        logoBase64 = '';
        logoUpload.value = '';
        previewContainer.classList.add('d-none');
        logoPreview.src = '#';
    }

    // Validar campos obrigatórios
    function validarCampos() {
        const nome = inputNome.value.trim();
        const cpfcnpj = inputCpfcnpj.value.replace(/\D/g, '');
        const telefone = inputTelefone.value.replace(/\D/g, '');
        const email = inputEmail.value.trim();
        
        if (!nome) {
            Swal.fire("Aviso", "Preencha o Nome / Razão Social.", "warning");
            inputNome.focus();
            return false;
        }
        
        if (!cpfcnpj) {
            Swal.fire("Aviso", "Preencha o CPF/CNPJ.", "warning");
            inputCpfcnpj.focus();
            return false;
        }
        
        const isJuridica = tipoJuridica.checked;
        if (isJuridica && cpfcnpj.length !== 14) {
            Swal.fire("Aviso", "CNPJ inválido. Deve conter 14 dígitos.", "warning");
            inputCpfcnpj.focus();
            return false;
        }
        if (!isJuridica && cpfcnpj.length !== 11) {
            Swal.fire("Aviso", "CPF inválido. Deve conter 11 dígitos.", "warning");
            inputCpfcnpj.focus();
            return false;
        }
        
        if (telefone.length < 10) {
            Swal.fire("Aviso", "Telefone inválido.", "warning");
            inputTelefone.focus();
            return false;
        }
        
        if (!email || !email.includes('@')) {
            Swal.fire("Aviso", "E-mail inválido.", "warning");
            inputEmail.focus();
            return false;
        }
        
        return true;
    }

    // Montar objeto para envio
    function montarObjetoEnvio() {
        const isJuridica = tipoJuridica.checked;
        return {
            Tipopessoa: isJuridica ? 1 : 0,
            Nome: inputNome.value.trim(),
            Rg: isJuridica ? '' : inputRg.value,
            Cpfcnpj: inputCpfcnpj.value,
            Email: inputEmail.value.trim(),
            Telefone: inputTelefone.value,
            Cep: inputCep.value,
            Logradouro: inputLogradouro.value,
            Numerologradouro: inputNumero.value,
            Complemento: inputComplemento.value,
            Bairro: inputBairro.value,
            Cidade: inputCidade.value,
            Estado: selectEstado.options[selectEstado.selectedIndex]?.text || selectEstado.value,
            Logo: logoBase64
        };
    }

    // Gravar cadastro
    async function gravarCadastro() {
        if (loading) return;
        if (!validarCampos()) return;
        
        loading = true;
        btnGravar.disabled = true;
        btnGravar.innerHTML = '<span class="custom-spinner me-2"></span> Salvando...';
        
        const dados = montarObjetoEnvio();
        
        try {
            const response = await fetch('/RealizarPreCadastroMarceneiro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dados)
            });
            
            const result = await response.json();
            
            if (result.codigo === 0) {
                await Swal.fire({
                    title: result.mensagem || "Pré-cadastro realizado com sucesso!",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                });
                window.location.href = '/Home/Login';
            } else {
                Swal.fire("Erro", result.mensagem || "Erro ao processar cadastro.", "error");
            }
        } catch (error) {
            console.error("Erro no cadastro:", error);
            Swal.fire("Erro", "Erro ao processar cadastro. Tente novamente.", "error");
        } finally {
            loading = false;
            btnGravar.disabled = false;
            btnGravar.innerHTML = '<i class="fas fa-save me-2"></i>Gravar Cadastro';
        }
    }

    // Eventos
    tipoFisica.addEventListener('change', alternarTipoPessoa);
    tipoJuridica.addEventListener('change', alternarTipoPessoa);
    inputCep.addEventListener('blur', buscarCep);
    logoUpload.addEventListener('change', handleLogoUpload);
    removeImage.addEventListener('click', handleRemoveLogo);
    btnGravar.addEventListener('click', gravarCadastro);
    
    // Inicializar
    initMasks();
    alternarTipoPessoa(); // Configurar estado inicial
    
    // Tooltips customizados
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(el => {
        el.setAttribute('title', el.getAttribute('data-tooltip'));
    });