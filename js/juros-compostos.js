// Classe para gerenciar o simulador de juros compostos
class JurosCompostos {
    constructor(db) {
        this.db = db;
        this.chart = null;
        this.currentScenario = null;
        this.init();
    }

    init() {
        // Inicializar elementos do DOM
        this.initDOMElements();
        
        // Inicializar eventos
        this.initEvents();
        
        // Inicializar gráfico
        this.initChart();
    }

    initDOMElements() {
        // Formulário
        this.jurosForm = document.getElementById('juros-form');
        this.capitalInicialInput = document.getElementById('capital-inicial');
        this.aporteMensalInput = document.getElementById('aporte-mensal');
        this.taxaJurosInput = document.getElementById('taxa-juros');
        this.periodoInput = document.getElementById('periodo');
        
        // Resultados
        this.montanteFinalEl = document.getElementById('montante-final');
        this.totalInvestidoEl = document.getElementById('total-investido');
        this.jurosAcumuladosEl = document.getElementById('juros-acumulados');
        this.rentabilidadeTotalEl = document.getElementById('rentabilidade-total');
        
        // Comparação
        this.compUnicoValorEl = document.getElementById('comp-unico-valor');
        this.compUnicoResultadoEl = document.getElementById('comp-unico-resultado');
        this.compRecorrenteResultadoEl = document.getElementById('comp-recorrente-resultado');
        this.compDiferencaEl = document.getElementById('comp-diferenca');
        
        // Botões
        this.saveScenarioBtn = document.getElementById('save-scenario');
        this.loadScenarioBtn = document.getElementById('load-scenario');
        
        // Modal de cenários
        this.scenariosModal = document.getElementById('scenarios-modal');
        this.scenariosListEl = document.getElementById('scenarios-list');
        this.cancelScenarioBtn = document.getElementById('cancel-scenario');
    }

    initEvents() {
        // Evento para calcular juros compostos
        this.jurosForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calcularJurosCompostos();
        });
        
        // Evento para salvar cenário
        this.saveScenarioBtn.addEventListener('click', () => {
            this.saveScenario();
        });
        
        // Evento para carregar cenário
        this.loadScenarioBtn.addEventListener('click', () => {
            this.openScenariosModal();
        });
        
        // Evento para fechar modal de cenários
        this.cancelScenarioBtn.addEventListener('click', () => {
            this.closeScenariosModal();
        });
    }

    initChart() {
        const ctx = document.getElementById('juros-chart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Montante Acumulado',
                        data: [],
                        backgroundColor: 'rgba(99, 102, 241, 0.2)',
                        borderColor: 'rgba(99, 102, 241, 1)',
                        borderWidth: 2,
                        tension: 0.1
                    },
                    {
                        label: 'Total Investido',
                        data: [],
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        borderColor: 'rgba(16, 185, 129, 1)',
                        borderWidth: 2,
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => `R$ ${value.toLocaleString('pt-BR')}`
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.dataset.label}: R$ ${context.raw.toLocaleString('pt-BR')}`
                        }
                    }
                }
            }
        });
    }

    calcularJurosCompostos() {
        // Obter valores do formulário
        const capitalInicial = parseFloat(this.capitalInicialInput.value);
        const aporteMensal = parseFloat(this.aporteMensalInput.value);
        const taxaJuros = parseFloat(this.taxaJurosInput.value);
        const periodo = parseInt(this.periodoInput.value);
        
        // Validar campos
        if (isNaN(capitalInicial) || isNaN(aporteMensal) || isNaN(taxaJuros) || isNaN(periodo)) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }
        
        // Calcular juros compostos
        const taxaMensal = (taxaJuros / 100) / 12;
        const periodoMeses = periodo * 12;
        
        // Calcular montante com aportes mensais
        let montante = capitalInicial;
        const montantesPorMes = [montante];
        const investidoPorMes = [capitalInicial];
        
        for (let i = 1; i <= periodoMeses; i++) {
            montante = montante * (1 + taxaMensal) + aporteMensal;
            montantesPorMes.push(montante);
            investidoPorMes.push(capitalInicial + (aporteMensal * i));
        }
        
        const montanteFinal = montante;
        const totalInvestido = capitalInicial + (aporteMensal * periodoMeses);
        const jurosAcumulados = montanteFinal - totalInvestido;
        const rentabilidadeTotal = (jurosAcumulados / totalInvestido) * 100;
        
        // Calcular montante com investimento único equivalente
        const investimentoUnicoEquivalente = totalInvestido;
        const montanteUnico = investimentoUnicoEquivalente * Math.pow(1 + (taxaJuros / 100), periodo);
        const diferenca = montanteFinal - montanteUnico;
        
        // Atualizar resultados
        this.montanteFinalEl.textContent = this.formatCurrency(montanteFinal);
        this.totalInvestidoEl.textContent = this.formatCurrency(totalInvestido);
        this.jurosAcumuladosEl.textContent = this.formatCurrency(jurosAcumulados);
        this.rentabilidadeTotalEl.textContent = rentabilidadeTotal.toFixed(2);
        
        // Atualizar comparação
        this.compUnicoValorEl.textContent = this.formatCurrency(investimentoUnicoEquivalente);
        this.compUnicoResultadoEl.textContent = this.formatCurrency(montanteUnico);
        this.compRecorrenteResultadoEl.textContent = this.formatCurrency(montanteFinal);
        this.compDiferencaEl.textContent = this.formatCurrency(diferenca);
        
        // Atualizar gráfico
        this.updateChart(periodoMeses, montantesPorMes, investidoPorMes);
        
        // Armazenar cenário atual
        this.currentScenario = {
            capitalInicial,
            aporteMensal,
            taxaJuros,
            periodo,
            montanteFinal,
            totalInvestido,
            jurosAcumulados,
            rentabilidadeTotal
        };
    }

    updateChart(periodoMeses, montantesPorMes, investidoPorMes) {
        // Preparar labels (meses)
        const labels = [];
        for (let i = 0; i <= periodoMeses; i++) {
            const anos = Math.floor(i / 12);
            const meses = i % 12;
            labels.push(`${anos}a ${meses}m`);
        }
        
        // Atualizar dados do gráfico
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = montantesPorMes;
        this.chart.data.datasets[1].data = investidoPorMes;
        this.chart.update();
    }

    async saveScenario() {
        // Verificar se há um cenário atual
        if (!this.currentScenario) {
            alert('Por favor, calcule um cenário antes de salvar.');
            return;
        }
        
        // Solicitar nome para o cenário
        const name = prompt('Digite um nome para este cenário:');
        if (!name) return;
        
        try {
            // Adicionar data de criação
            const scenario = {
                ...this.currentScenario,
                name,
                createdAt: new Date().toISOString()
            };
            
            // Salvar cenário no banco de dados
            await this.db.saveScenario(scenario);
            
            alert('Cenário salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar cenário:', error);
            alert('Erro ao salvar cenário. Verifique o console para mais detalhes.');
        }
    }

    async openScenariosModal() {
        try {
            // Carregar cenários do banco de dados
            const scenarios = await this.db.getScenarios();
            
            // Limpar lista de cenários
            this.scenariosListEl.innerHTML = '';
            
            if (scenarios.length === 0) {
                this.scenariosListEl.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-4">Nenhum cenário salvo.</p>';
            } else {
                // Adicionar cenários à lista
                scenarios.forEach(scenario => {
                    const scenarioEl = document.createElement('div');
                    scenarioEl.className = 'bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600';
                    
                    const date = new Date(scenario.createdAt);
                    const formattedDate = date.toLocaleDateString('pt-BR');
                    
                    scenarioEl.innerHTML = `
                        <h4 class="font-medium text-gray-700 dark:text-gray-300">${scenario.name}</h4>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Capital: R$ ${this.formatCurrency(scenario.capitalInicial)} | 
                            Aporte: R$ ${this.formatCurrency(scenario.aporteMensal)} | 
                            Taxa: ${scenario.taxaJuros}% | 
                            Período: ${scenario.periodo} anos
                        </p>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Criado em: ${formattedDate}
                        </p>
                    `;
                    
                    // Evento para carregar cenário
                    scenarioEl.addEventListener('click', () => {
                        this.loadScenario(scenario);
                        this.closeScenariosModal();
                    });
                    
                    this.scenariosListEl.appendChild(scenarioEl);
                });
            }
            
            // Mostrar modal
            this.scenariosModal.classList.remove('hidden');
        } catch (error) {
            console.error('Erro ao carregar cenários:', error);
            alert('Erro ao carregar cenários. Verifique o console para mais detalhes.');
        }
    }

    closeScenariosModal() {
        this.scenariosModal.classList.add('hidden');
    }

    loadScenario(scenario) {
        // Preencher formulário com dados do cenário
        this.capitalInicialInput.value = scenario.capitalInicial;
        this.aporteMensalInput.value = scenario.aporteMensal;
        this.taxaJurosInput.value = scenario.taxaJuros;
        this.periodoInput.value = scenario.periodo;
        
        // Calcular juros compostos
        this.calcularJurosCompostos();
    }

    formatCurrency(value) {
        return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
}

// Inicializar simulador de juros compostos quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se o banco de dados está pronto
    if (financeDB.db) {
        new JurosCompostos(financeDB);
    } else {
        // Se o banco de dados ainda não estiver pronto, aguardar
        const dbCheckInterval = setInterval(() => {
            if (financeDB.db) {
                clearInterval(dbCheckInterval);
                new JurosCompostos(financeDB);
            }
        }, 100);
    }
});
