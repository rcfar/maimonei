// Classe para gerenciar o dashboard financeiro
class Dashboard {
    constructor(db) {
        this.db = db;
        this.investments = [];
        this.history = [];
        this.charts = {};
        this.receitas = [];
        this.despesas = [];
        this.init();
    }

    async init() {
        // Inicializar elementos do DOM
        this.initDOMElements();
        
        // Carregar dados
        await this.loadData();
        
        // Inicializar eventos
        this.initEvents();
        
        // Atualizar UI
        this.updateUI();
        
        // Inicializar gráficos
        this.initCharts();
    }

    initDOMElements() {
        // Elementos de resumo
        this.saldoTotalEl = document.getElementById('saldo-total');
        this.valorAplicadoEl = document.getElementById('valor-aplicado');
        this.rentabilidadeEl = document.getElementById('rentabilidade');
        this.metaEl = document.getElementById('meta');
        
        // Tabela de investimentos
        this.investmentsTableEl = document.getElementById('investments-table');
        this.investmentsDetailTableEl = document.getElementById('investments-detail-table');
        
        // Botões
        this.addInvestmentBtn = document.getElementById('add-investment');
        this.exportDataBtn = document.getElementById('export-data');
        this.importDataBtn = document.getElementById('import-data');
        this.syncSheetsBtn = document.getElementById('sync-sheets');
        
        // Modal de investimento
        this.investmentModal = document.getElementById('investment-modal');
        this.investmentForm = document.getElementById('investment-form');
        this.cancelInvestmentBtn = document.getElementById('cancel-investment');
        
        // Menu lateral
        this.dashboardNavItems = document.querySelectorAll('.dashboard-nav-item');
        this.dashboardSections = document.querySelectorAll('.dashboard-section');
        
        // Botões de receitas e despesas
        this.addReceitaBtn = document.getElementById('add-receita');
        this.addDespesaBtn = document.getElementById('add-despesa');
        
        // Tabelas de receitas e despesas
        this.receitasTableEl = document.getElementById('receitas-table');
        this.despesasTableEl = document.getElementById('despesas-table');
        
        // Modais de receitas e despesas
        this.receitaModal = document.getElementById('receita-modal');
        this.despesaModal = document.getElementById('despesa-modal');
        this.receitaForm = document.getElementById('receita-form');
        this.despesaForm = document.getElementById('despesa-form');
        this.cancelReceitaBtn = document.getElementById('cancel-receita');
        this.cancelDespesaBtn = document.getElementById('cancel-despesa');
        
        // Novo elemento
        this.resetDatabaseBtn = document.getElementById('reset-database');
    }

    async loadData() {
        try {
            // Carregar investimentos
            this.investments = await this.db.getInvestments();
            
            // Carregar histórico
            this.history = await this.db.getHistory();
            
            // Carregar meta
            const meta = await this.db.getSetting('meta');
            if (meta) {
                this.metaEl.textContent = this.formatCurrency(meta);
            }
            
            // Se não houver histórico, criar um registro inicial
            if (this.history.length === 0) {
                const today = new Date().toISOString().split('T')[0];
                const totalValue = this.calculateTotalValue();
                
                await this.db.addHistoryEntry({
                    date: today,
                    value: totalValue,
                    invested: totalValue,
                    return: 0
                });
                
                this.history = await this.db.getHistory();
            }
            
            // Tentar carregar receitas e despesas, mas não falhar se as tabelas não existirem
            try {
                this.receitas = await this.db.getReceitas();
            } catch (e) {
                console.warn('Tabela de receitas não encontrada, inicializando como array vazio');
                this.receitas = [];
            }
            
            try {
                this.despesas = await this.db.getDespesas();
            } catch (e) {
                console.warn('Tabela de despesas não encontrada, inicializando como array vazio');
                this.despesas = [];
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            alert('Erro ao carregar dados. Verifique o console para mais detalhes.');
        }
    }

    initEvents() {
        // Evento para adicionar investimento
        this.addInvestmentBtn.addEventListener('click', () => {
            this.openInvestmentModal();
        });
        
        // Evento para fechar modal
        this.cancelInvestmentBtn.addEventListener('click', () => {
            this.closeInvestmentModal();
        });
        
        // Evento para salvar investimento
        this.investmentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveInvestment();
        });
        
        // Evento para exportar dados
        this.exportDataBtn.addEventListener('click', async () => {
            await this.exportData();
        });
        
        // Evento para importar dados
        this.importDataBtn.addEventListener('click', () => {
            this.importData();
        });
        
        // Evento para sincronizar com Google Sheets
        this.syncSheetsBtn.addEventListener('click', () => {
            this.syncWithGoogleSheets();
        });
        
        // Eventos do menu lateral
        this.dashboardNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                this.showDashboardSection(section);
            });
        });
        
        // Evento para adicionar receita
        this.addReceitaBtn.addEventListener('click', () => {
            this.openReceitaModal();
        });
        
        // Evento para adicionar despesa
        this.addDespesaBtn.addEventListener('click', () => {
            this.openDespesaModal();
        });
        
        // Evento para fechar modal de receita
        this.cancelReceitaBtn.addEventListener('click', () => {
            this.closeReceitaModal();
        });
        
        // Evento para fechar modal de despesa
        this.cancelDespesaBtn.addEventListener('click', () => {
            this.closeDespesaModal();
        });
        
        // Evento para salvar receita
        this.receitaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveReceita();
        });
        
        // Evento para salvar despesa
        this.despesaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveDespesa();
        });
        
        // Evento para resetar banco de dados
        this.resetDatabaseBtn.addEventListener('click', async () => {
            if (confirm('Tem certeza que deseja resetar o banco de dados? Todos os dados serão perdidos.')) {
                try {
                    await this.db.resetDatabase();
                    alert('Banco de dados resetado com sucesso. A página será recarregada.');
                    window.location.reload();
                } catch (error) {
                    console.error('Erro ao resetar banco de dados:', error);
                    alert('Erro ao resetar banco de dados. Verifique o console para mais detalhes.');
                }
            }
        });
    }

    updateUI() {
        // Calcular valor total dos investimentos
        const totalValue = this.calculateTotalValue();
        
        // Calcular valor total investido
        const totalInvested = this.investments.reduce((total, investment) => total + investment.purchaseValue, 0);
        
        // Calcular rentabilidade ponderada (sistema de cotas)
        const weightedReturn = this.calculateWeightedReturn();
        
        // Atualizar elementos de resumo
        this.saldoTotalEl.textContent = this.formatCurrency(totalValue);
        this.valorAplicadoEl.textContent = this.formatCurrency(totalInvested);
        this.rentabilidadeEl.textContent = weightedReturn.toFixed(2);
        
        // Atualizar tabela de investimentos
        this.updateInvestmentsTable();
        
        // Atualizar tabela de detalhes de investimentos (se existir)
        if (this.investmentsDetailTableEl) {
            this.updateInvestmentsDetailTable();
        }
        
        // Atualizar tabela de receitas (se existir)
        if (this.receitasTableEl) {
            this.updateReceitasTable();
        }
        
        // Atualizar tabela de despesas (se existir)
        if (this.despesasTableEl) {
            this.updateDespesasTable();
        }
    }

    initCharts() {
        // Inicializar objeto de gráficos
        this.charts = {};
        
        // Gráfico de distribuição de ativos
        const assetsCanvas = document.getElementById('assets-chart');
        if (assetsCanvas) {
            const assetsCtx = assetsCanvas.getContext('2d');
            this.charts.assets = new Chart(assetsCtx, {
                type: 'doughnut',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: [
                            '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
                            '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                color: document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#4B5563'
                            }
                        }
                    }
                }
            });
        }
        
        // Gráfico de evolução do patrimônio
        const evolutionCanvas = document.getElementById('evolution-chart');
        if (evolutionCanvas) {
            const evolutionCtx = evolutionCanvas.getContext('2d');
            this.charts.evolution = new Chart(evolutionCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Patrimônio',
                        data: [],
                        borderColor: '#4F46E5',
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            grid: {
                                color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                            },
                            ticks: {
                                color: document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#4B5563'
                            }
                        },
                        y: {
                            grid: {
                                color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                            },
                            ticks: {
                                color: document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#4B5563',
                                callback: (value) => `R$ ${this.formatCurrency(value)}`
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#4B5563'
                            }
                        }
                    }
                }
            });
        }
        
        // Gráfico de rentabilidade por investimento
        const returnCanvas = document.getElementById('investments-return-chart');
        if (returnCanvas) {
            const returnCtx = returnCanvas.getContext('2d');
            this.charts.return = new Chart(returnCtx, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Rentabilidade (%)',
                        data: [],
                        backgroundColor: '#10B981',
                        borderColor: '#059669',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            grid: {
                                color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                            },
                            ticks: {
                                color: document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#4B5563'
                            }
                        },
                        y: {
                            grid: {
                                color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                            },
                            ticks: {
                                color: document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#4B5563',
                                callback: (value) => `${value}%`
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#4B5563'
                            }
                        }
                    }
                }
            });
        }
        
        // Gráfico de patrimônio
        const patrimonioCanvas = document.getElementById('patrimonio-chart');
        if (patrimonioCanvas) {
            const patrimonioCtx = patrimonioCanvas.getContext('2d');
            this.charts.patrimonio = new Chart(patrimonioCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Patrimônio',
                        data: [],
                        borderColor: '#4F46E5',
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            grid: {
                                color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                            },
                            ticks: {
                                color: document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#4B5563'
                            }
                        },
                        y: {
                            grid: {
                                color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                            },
                            ticks: {
                                color: document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#4B5563',
                                callback: (value) => `R$ ${this.formatCurrency(value)}`
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#4B5563'
                            }
                        }
                    }
                }
            });
        }
        
        // Gráfico de rentabilidade mensal
        const rentabilidadeCanvas = document.getElementById('rentabilidade-chart');
        if (rentabilidadeCanvas) {
            const rentabilidadeCtx = rentabilidadeCanvas.getContext('2d');
            this.charts.rentabilidade = new Chart(rentabilidadeCtx, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Rentabilidade (%)',
                        data: [],
                        backgroundColor: '#10B981',
                        borderColor: '#059669',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            grid: {
                                color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                            },
                            ticks: {
                                color: document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#4B5563'
                            }
                        },
                        y: {
                            grid: {
                                color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                            },
                            ticks: {
                                color: document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#4B5563',
                                callback: (value) => `${value}%`
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#4B5563'
                            }
                        }
                    }
                }
            });
        }
        
        // Atualizar gráficos
        this.updateCharts();
    }

    updateCharts() {
        // Atualizar gráfico de distribuição de ativos
        if (this.charts.assets) {
            // Agrupar investimentos por categoria
            const categories = {};
            this.investments.forEach(investment => {
                if (!categories[investment.category]) {
                    categories[investment.category] = 0;
                }
                categories[investment.category] += investment.currentValue;
            });
            
            // Preparar dados para o gráfico
            const labels = Object.keys(categories);
            const data = Object.values(categories);
            
            // Atualizar gráfico
            this.charts.assets.data.labels = labels;
            this.charts.assets.data.datasets[0].data = data;
            this.charts.assets.update();
        }
        
        // Atualizar gráfico de evolução do patrimônio
        if (this.charts.evolution) {
            // Ordenar histórico por data
            const sortedHistory = [...this.history].sort((a, b) => new Date(a.date) - new Date(b.date));
            
            // Preparar dados para o gráfico
            const labels = sortedHistory.map(entry => {
                const date = new Date(entry.date);
                return date.toLocaleDateString('pt-BR');
            });
            const data = sortedHistory.map(entry => entry.value);
            
            // Atualizar gráfico
            this.charts.evolution.data.labels = labels;
            this.charts.evolution.data.datasets[0].data = data;
            this.charts.evolution.update();
        }
        
        // Atualizar gráfico de rentabilidade por investimento
        if (this.charts.return) {
            // Ordenar investimentos por rentabilidade (do maior para o menor)
            const sortedInvestments = [...this.investments].sort((a, b) => b.returnPercentage - a.returnPercentage);
            
            // Preparar dados para o gráfico
            const labels = sortedInvestments.map(investment => investment.name);
            const data = sortedInvestments.map(investment => investment.returnPercentage);
            
            // Atualizar gráfico
            this.charts.return.data.labels = labels;
            this.charts.return.data.datasets[0].data = data;
            this.charts.return.update();
        }
        
        // Atualizar gráfico de patrimônio
        if (this.charts.patrimonio) {
            // Ordenar histórico por data
            const sortedHistory = [...this.history].sort((a, b) => new Date(a.date) - new Date(b.date));
            
            // Preparar dados para o gráfico
            const labels = sortedHistory.map(entry => {
                const date = new Date(entry.date);
                return date.toLocaleDateString('pt-BR');
            });
            const data = sortedHistory.map(entry => entry.value);
            
            // Atualizar gráfico
            this.charts.patrimonio.data.labels = labels;
            this.charts.patrimonio.data.datasets[0].data = data;
            this.charts.patrimonio.update();
        }
        
        // Atualizar gráfico de rentabilidade mensal
        if (this.charts.rentabilidade) {
            // Ordenar histórico por data
            const sortedHistory = [...this.history].sort((a, b) => new Date(a.date) - new Date(b.date));
            
            // Preparar dados para o gráfico
            const labels = sortedHistory.map(entry => {
                const date = new Date(entry.date);
                return date.toLocaleDateString('pt-BR');
            });
            const data = sortedHistory.map(entry => entry.return);
            
            // Atualizar gráfico
            this.charts.rentabilidade.data.labels = labels;
            this.charts.rentabilidade.data.datasets[0].data = data;
            this.charts.rentabilidade.update();
        }
    }

    updateInvestmentsTable() {
        // Limpar tabela
        this.investmentsTableEl.innerHTML = '';
        
        // Adicionar linhas à tabela
        this.investments.forEach(investment => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${investment.category}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${investment.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">R$ ${this.formatCurrency(investment.currentValue)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${investment.returnPercentage.toFixed(2)}%</td>
            `;
            
            this.investmentsTableEl.appendChild(tr);
        });
    }

    openInvestmentModal() {
        // Limpar formulário
        this.investmentForm.reset();
        
        // Definir data atual
        document.getElementById('investment-purchase-date').value = new Date().toISOString().split('T')[0];
        
        // Mostrar modal
        this.investmentModal.classList.remove('hidden');
    }

    closeInvestmentModal() {
        this.investmentModal.classList.add('hidden');
    }

    async saveInvestment() {
        // Obter valores do formulário
        const category = document.getElementById('investment-category').value;
        const name = document.getElementById('investment-name').value;
        const purchaseDate = document.getElementById('investment-purchase-date').value;
        const purchaseValue = parseFloat(document.getElementById('investment-purchase-value').value);
        const saleDate = document.getElementById('investment-sale-date').value || null;
        const currentValue = parseFloat(document.getElementById('investment-current-value').value);
        
        // Calcular rentabilidade
        const returnPercentage = this.calculateReturnPercentage(currentValue, purchaseValue);
        
        // Validar campos
        if (!category || !name || !purchaseDate || isNaN(purchaseValue) || purchaseValue <= 0 || isNaN(currentValue) || currentValue <= 0) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        try {
            // Criar objeto de investimento
            const investment = {
                category,
                name,
                purchaseDate,
                purchaseValue,
                saleDate,
                currentValue,
                returnPercentage,
                createdAt: new Date().toISOString()
            };
            
            // Se estiver editando um investimento existente
            if (this.currentInvestmentId) {
                investment.id = this.currentInvestmentId;
                await this.db.updateInvestment(investment);
                this.currentInvestmentId = null;
            } else {
                // Salvar novo investimento no banco de dados
                await this.db.addInvestment(investment);
            }
            
            // Fechar modal
            this.closeInvestmentModal();
            
            // Recarregar investimentos
            this.investments = await this.db.getInvestments();
            
            // Atualizar UI
            this.updateUI();
            
            // Atualizar gráficos
            this.updateCharts();
            
            // Atualizar histórico
            await this.updateHistory();
            
            alert('Investimento salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar investimento:', error);
            alert('Erro ao salvar investimento. Verifique o console para mais detalhes.');
        }
    }

    updateInvestmentsDetailTable() {
        // Verificar se o elemento existe
        if (!this.investmentsDetailTableEl) return;
        
        // Limpar tabela
        this.investmentsDetailTableEl.innerHTML = '';
        
        // Adicionar linhas à tabela
        this.investments.forEach(investment => {
            const tr = document.createElement('tr');
            
            // Formatar datas
            const purchaseDate = new Date(investment.purchaseDate);
            const formattedPurchaseDate = purchaseDate.toLocaleDateString('pt-BR');
            
            let formattedSaleDate = '-';
            if (investment.saleDate) {
                const saleDate = new Date(investment.saleDate);
                formattedSaleDate = saleDate.toLocaleDateString('pt-BR');
            }
            
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${investment.category}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${investment.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${formattedPurchaseDate}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">R$ ${this.formatCurrency(investment.purchaseValue)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">R$ ${this.formatCurrency(investment.currentValue)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${investment.returnPercentage.toFixed(2)}%</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <button class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3 edit-investment" data-id="${investment.id}">
                        Editar
                    </button>
                    <button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 delete-investment" data-id="${investment.id}">
                        Excluir
                    </button>
                </td>
            `;
            
            // Adicionar eventos aos botões
            const editBtn = tr.querySelector('.edit-investment');
            const deleteBtn = tr.querySelector('.delete-investment');
            
            editBtn.addEventListener('click', () => {
                this.editInvestment(investment.id);
            });
            
            deleteBtn.addEventListener('click', () => {
                this.deleteInvestment(investment.id);
            });
            
            this.investmentsDetailTableEl.appendChild(tr);
        });
    }

    editInvestment(id) {
        // Encontrar investimento pelo ID
        const investment = this.investments.find(inv => inv.id === id);
        if (!investment) return;
        
        // Preencher formulário com dados do investimento
        document.getElementById('investment-category').value = investment.category;
        document.getElementById('investment-name').value = investment.name;
        document.getElementById('investment-purchase-date').value = investment.purchaseDate;
        document.getElementById('investment-purchase-value').value = investment.purchaseValue;
        if (investment.saleDate) {
            document.getElementById('investment-sale-date').value = investment.saleDate;
        }
        document.getElementById('investment-current-value').value = investment.currentValue;
        
        // Armazenar ID do investimento para atualização
        this.currentInvestmentId = id;
        
        // Mostrar modal
        this.investmentModal.classList.remove('hidden');
    }

    async deleteInvestment(id) {
        if (confirm('Tem certeza que deseja excluir este investimento?')) {
            try {
                // Excluir investimento
                await this.db.deleteInvestment(id);
                
                // Recarregar investimentos
                this.investments = await this.db.getInvestments();
                
                // Atualizar UI
                this.updateUI();
                
                // Atualizar gráficos
                this.updateCharts();
                
                // Atualizar histórico com um pequeno atraso para evitar conflitos
                setTimeout(async () => {
                    try {
                        await this.updateHistory();
                    } catch (error) {
                        console.error('Erro ao atualizar histórico após exclusão:', error);
                    }
                }, 500);
                
                alert('Investimento excluído com sucesso!');
            } catch (error) {
                console.error('Erro ao excluir investimento:', error);
                alert('Erro ao excluir investimento. Verifique o console para mais detalhes.');
            }
        }
    }

    async exportData() {
        try {
            await this.db.exportData();
            alert('Dados exportados com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            alert('Erro ao exportar dados. Verifique o console para mais detalhes.');
        }
    }

    async importData() {
        try {
            // Criar input de arquivo
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            // Adicionar evento para quando o arquivo for selecionado
            input.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                
                reader.onload = async (event) => {
                    try {
                        const jsonData = event.target.result;
                        
                        // Confirmar importação
                        if (confirm('Tem certeza que deseja importar estes dados? Todos os dados atuais serão substituídos.')) {
                            await this.db.importData(jsonData);
                            
                            alert('Dados importados com sucesso! A página será recarregada.');
                            window.location.reload();
                        }
                    } catch (error) {
                        console.error('Erro ao processar arquivo:', error);
                        alert('Erro ao processar arquivo. Verifique o console para mais detalhes.');
                    }
                };
                
                reader.readAsText(file);
            });
            
            // Simular clique no input
            document.body.appendChild(input);
            input.click();
            
            // Limpar
            setTimeout(() => {
                document.body.removeChild(input);
            }, 100);
        } catch (error) {
            console.error('Erro ao importar dados:', error);
            alert('Erro ao importar dados. Verifique o console para mais detalhes.');
        }
    }

    syncWithGoogleSheets() {
        alert('Funcionalidade de sincronização com Google Sheets em desenvolvimento.');
        // Implementação futura
    }

    calculateTotalValue() {
        // Calcular valor total dos investimentos
        return this.investments.reduce((total, investment) => total + investment.currentValue, 0);
    }

    calculateTotalInvested() {
        return this.investments.reduce((total, investment) => total + investment.purchaseValue, 0);
    }

    calculateReturnPercentage(currentValue, purchaseValue) {
        if (purchaseValue <= 0) return 0;
        return ((currentValue - purchaseValue) / purchaseValue) * 100;
    }

    formatCurrency(value) {
        return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    showDashboardSection(sectionId) {
        // Atualizar classes ativas no menu
        this.dashboardNavItems.forEach(item => {
            if (item.getAttribute('data-section') === sectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Mostrar seção correspondente
        this.dashboardSections.forEach(section => {
            if (section.id === `${sectionId}-section`) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        });
    }

    // Métodos para gerenciar receitas
    openReceitaModal() {
        // Limpar formulário
        this.receitaForm.reset();
        
        // Definir data atual
        document.getElementById('receita-data').value = new Date().toISOString().split('T')[0];
        
        // Mostrar modal
        this.receitaModal.classList.remove('hidden');
    }

    closeReceitaModal() {
        this.receitaModal.classList.add('hidden');
    }

    async saveReceita() {
        // Obter valores do formulário
        const data = document.getElementById('receita-data').value;
        const descricao = document.getElementById('receita-descricao').value;
        const categoria = document.getElementById('receita-categoria').value;
        const valor = parseFloat(document.getElementById('receita-valor').value);
        
        // Validar campos
        if (!data || !descricao || !categoria || isNaN(valor) || valor <= 0) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }
        
        try {
            // Criar objeto de receita
            const receita = {
                data,
                descricao,
                categoria,
                valor,
                createdAt: new Date().toISOString()
            };
            
            // Salvar receita no banco de dados
            await this.db.addReceita(receita);
            
            // Fechar modal
            this.closeReceitaModal();
            
            // Recarregar receitas
            this.receitas = await this.db.getReceitas();
            
            // Atualizar UI
            this.updateReceitasTable();
            
            // Atualizar gráficos
            this.updateCharts();
            
            alert('Receita adicionada com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar receita:', error);
            alert('Erro ao salvar receita. Verifique o console para mais detalhes.');
        }
    }

    updateReceitasTable() {
        // Limpar tabela
        this.receitasTableEl.innerHTML = '';
        
        // Ordenar receitas por data (mais recentes primeiro)
        const sortedReceitas = [...this.receitas].sort((a, b) => new Date(b.data) - new Date(a.data));
        
        // Adicionar linhas à tabela
        sortedReceitas.forEach(receita => {
            const tr = document.createElement('tr');
            
            // Formatar data
            const date = new Date(receita.data);
            const formattedDate = date.toLocaleDateString('pt-BR');
            
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${formattedDate}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${receita.descricao}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${this.getCategoriaLabel(receita.categoria, 'receita')}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">R$ ${this.formatCurrency(receita.valor)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <button class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3 edit-receita" data-id="${receita.id}">
                        Editar
                    </button>
                    <button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 delete-receita" data-id="${receita.id}">
                        Excluir
                    </button>
                </td>
            `;
            
            // Adicionar eventos aos botões
            const editBtn = tr.querySelector('.edit-receita');
            const deleteBtn = tr.querySelector('.delete-receita');
            
            editBtn.addEventListener('click', () => {
                this.editReceita(receita.id);
            });
            
            deleteBtn.addEventListener('click', () => {
                this.deleteReceita(receita.id);
            });
            
            this.receitasTableEl.appendChild(tr);
        });
    }

    // Métodos para gerenciar despesas
    openDespesaModal() {
        // Limpar formulário
        this.despesaForm.reset();
        
        // Definir data atual
        document.getElementById('despesa-data').value = new Date().toISOString().split('T')[0];
        
        // Mostrar modal
        this.despesaModal.classList.remove('hidden');
    }

    closeDespesaModal() {
        this.despesaModal.classList.add('hidden');
    }

    async saveDespesa() {
        // Obter valores do formulário
        const data = document.getElementById('despesa-data').value;
        const descricao = document.getElementById('despesa-descricao').value;
        const categoria = document.getElementById('despesa-categoria').value;
        const valor = parseFloat(document.getElementById('despesa-valor').value);
        
        // Validar campos
        if (!data || !descricao || !categoria || isNaN(valor) || valor <= 0) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }
        
        try {
            // Criar objeto de despesa
            const despesa = {
                data,
                descricao,
                categoria,
                valor,
                createdAt: new Date().toISOString()
            };
            
            // Salvar despesa no banco de dados
            await this.db.addDespesa(despesa);
            
            // Fechar modal
            this.closeDespesaModal();
            
            // Recarregar despesas
            this.despesas = await this.db.getDespesas();
            
            // Atualizar UI
            this.updateDespesasTable();
            
            // Atualizar gráficos
            this.updateCharts();
            
            alert('Despesa adicionada com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar despesa:', error);
            alert('Erro ao salvar despesa. Verifique o console para mais detalhes.');
        }
    }

    updateDespesasTable() {
        // Limpar tabela
        this.despesasTableEl.innerHTML = '';
        
        // Ordenar despesas por data (mais recentes primeiro)
        const sortedDespesas = [...this.despesas].sort((a, b) => new Date(b.data) - new Date(a.data));
        
        // Adicionar linhas à tabela
        sortedDespesas.forEach(despesa => {
            const tr = document.createElement('tr');
            
            // Formatar data
            const date = new Date(despesa.data);
            const formattedDate = date.toLocaleDateString('pt-BR');
            
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${formattedDate}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${despesa.descricao}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${this.getCategoriaLabel(despesa.categoria, 'despesa')}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">R$ ${this.formatCurrency(despesa.valor)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <button class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3 edit-despesa" data-id="${despesa.id}">
                        Editar
                    </button>
                    <button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 delete-despesa" data-id="${despesa.id}">
                        Excluir
                    </button>
                </td>
            `;
            
            // Adicionar eventos aos botões
            const editBtn = tr.querySelector('.edit-despesa');
            const deleteBtn = tr.querySelector('.delete-despesa');
            
            editBtn.addEventListener('click', () => {
                this.editDespesa(despesa.id);
            });
            
            deleteBtn.addEventListener('click', () => {
                this.deleteDespesa(despesa.id);
            });
            
            this.despesasTableEl.appendChild(tr);
        });
    }

    // Método auxiliar para obter label de categoria
    getCategoriaLabel(categoria, tipo) {
        const categoriasReceita = {
            'salario': 'Salário',
            'freelance': 'Freelance',
            'investimentos': 'Rendimentos de Investimentos',
            'aluguel': 'Aluguel',
            'outros': 'Outros'
        };
        
        const categoriasDespesa = {
            'moradia': 'Moradia',
            'alimentacao': 'Alimentação',
            'transporte': 'Transporte',
            'saude': 'Saúde',
            'educacao': 'Educação',
            'lazer': 'Lazer',
            'outros': 'Outros'
        };
        
        if (tipo === 'receita') {
            return categoriasReceita[categoria] || categoria;
        } else {
            return categoriasDespesa[categoria] || categoria;
        }
    }

    // Adicionar método para calcular rentabilidade ponderada
    calculateWeightedReturn() {
        // Se não houver investimentos, retornar 0
        if (this.investments.length === 0) return 0;
        
        // Calcular valor total investido
        const totalInvested = this.investments.reduce((total, investment) => total + investment.purchaseValue, 0);
        
        // Se o valor total investido for 0, retornar 0 para evitar divisão por zero
        if (totalInvested === 0) return 0;
        
        // Calcular rentabilidade ponderada
        let weightedReturn = 0;
        
        this.investments.forEach(investment => {
            // Calcular peso do investimento no portfólio
            const weight = investment.purchaseValue / totalInvested;
            
            // Adicionar contribuição ponderada à rentabilidade total
            weightedReturn += (investment.returnPercentage * weight);
        });
        
        return weightedReturn;
    }

    // Adicionar método para atualizar histórico
    async updateHistory() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const totalValue = this.calculateTotalValue();
            const totalInvested = this.investments.reduce((total, investment) => total + investment.purchaseValue, 0);
            const weightedReturn = this.calculateWeightedReturn();
            
            // Recarregar histórico para ter a versão mais recente
            this.history = await this.db.getHistory();
            
            // Verificar se já existe um registro para hoje
            const existingEntry = this.history.find(entry => entry.date === today);
            
            if (existingEntry) {
                // Atualizar registro existente
                existingEntry.value = totalValue;
                existingEntry.invested = totalInvested;
                existingEntry.return = weightedReturn;
                
                await this.db.updateHistoryEntry(existingEntry);
            } else {
                // Criar novo registro
                await this.db.addHistoryEntry({
                    date: today,
                    value: totalValue,
                    invested: totalInvested,
                    return: weightedReturn
                });
                
                // Recarregar histórico
                this.history = await this.db.getHistory();
            }
        } catch (error) {
            console.error('Erro ao atualizar histórico:', error);
        }
    }
}

// Inicializar dashboard quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se o banco de dados está pronto
    if (financeDB.db) {
        new Dashboard(financeDB);
    } else {
        // Se o banco de dados ainda não estiver pronto, aguardar
        const dbCheckInterval = setInterval(() => {
            if (financeDB.db) {
                clearInterval(dbCheckInterval);
                new Dashboard(financeDB);
            }
        }, 100);
    }
});
