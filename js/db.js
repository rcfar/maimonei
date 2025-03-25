// Classe para gerenciar o banco de dados
class FinanceDB {
    constructor() {
        this.dbName = 'financasPro';
        this.dbVersion = 2;
        this.db = null;
        this.init();
    }

    async init() {
        try {
            // Abrir conexão com o banco de dados
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            // Evento para criar ou atualizar o banco de dados
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Criar stores (tabelas)
                if (!db.objectStoreNames.contains('investments')) {
                    const investmentsStore = db.createObjectStore('investments', { keyPath: 'id', autoIncrement: true });
                    investmentsStore.createIndex('category', 'category', { unique: false });
                    investmentsStore.createIndex('name', 'name', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('history')) {
                    const historyStore = db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
                    historyStore.createIndex('date', 'date', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
                
                if (!db.objectStoreNames.contains('scenarios')) {
                    db.createObjectStore('scenarios', { keyPath: 'id', autoIncrement: true });
                }
                
                if (!db.objectStoreNames.contains('comments')) {
                    const commentsStore = db.createObjectStore('comments', { keyPath: 'id', autoIncrement: true });
                    commentsStore.createIndex('postId', 'postId', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('receitas')) {
                    const receitasStore = db.createObjectStore('receitas', { keyPath: 'id', autoIncrement: true });
                    receitasStore.createIndex('data', 'data', { unique: false });
                    receitasStore.createIndex('categoria', 'categoria', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('despesas')) {
                    const despesasStore = db.createObjectStore('despesas', { keyPath: 'id', autoIncrement: true });
                    despesasStore.createIndex('data', 'data', { unique: false });
                    despesasStore.createIndex('categoria', 'categoria', { unique: false });
                }
            };
            
            // Evento para sucesso na conexão
            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('Banco de dados inicializado com sucesso.');
            };
            
            // Evento para erro na conexão
            request.onerror = (event) => {
                console.error('Erro ao inicializar banco de dados:', event.target.error);
            };
        } catch (error) {
            console.error('Erro ao inicializar banco de dados:', error);
        }
    }

    // Métodos para investimentos
    async getInvestments() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Banco de dados não inicializado.'));
                return;
            }
            
            const transaction = this.db.transaction(['investments'], 'readonly');
            const store = transaction.objectStore('investments');
            const request = store.getAll();
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async addInvestment(investment) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Banco de dados não inicializado.'));
                return;
            }
            
            const transaction = this.db.transaction(['investments'], 'readwrite');
            const store = transaction.objectStore('investments');
            const request = store.add(investment);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async updateInvestment(investment) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Banco de dados não inicializado.'));
                return;
            }
            
            const transaction = this.db.transaction(['investments'], 'readwrite');
            const store = transaction.objectStore('investments');
            const request = store.put(investment);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async deleteInvestment(id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Banco de dados não inicializado.'));
                return;
            }
            
            try {
                const transaction = this.db.transaction(['investments'], 'readwrite');
                const store = transaction.objectStore('investments');
                const request = store.delete(id);
                
                request.onsuccess = () => {
                    resolve();
                };
                
                request.onerror = (event) => {
                    reject(event.target.error);
                };
                
                // Garantir que a transação seja concluída
                transaction.oncomplete = () => {
                    console.log('Transação de exclusão concluída com sucesso.');
                };
                
                transaction.onerror = (event) => {
                    console.error('Erro na transação de exclusão:', event.target.error);
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    // Métodos para histórico
    async getHistory() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Banco de dados não inicializado.'));
                return;
            }
            
            const transaction = this.db.transaction(['history'], 'readonly');
            const store = transaction.objectStore('history');
            const request = store.getAll();
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async addHistoryEntry(entry) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Banco de dados não inicializado.'));
                return;
            }
            
            const transaction = this.db.transaction(['history'], 'readwrite');
            const store = transaction.objectStore('history');
            const request = store.add(entry);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Métodos para configurações
    async getSetting(key) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Banco de dados não inicializado.'));
                return;
            }
            
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get(key);
            
            request.onsuccess = () => {
                resolve(request.result ? request.result.value : null);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async saveSetting(key, value) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Banco de dados não inicializado.'));
                return;
            }
            
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.put({ key, value });
            
            request.onsuccess = () => {
                resolve();
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Métodos para cenários
    async getScenarios() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Banco de dados não inicializado.'));
                return;
            }
            
            const transaction = this.db.transaction(['scenarios'], 'readonly');
            const store = transaction.objectStore('scenarios');
            const request = store.getAll();
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async saveScenario(scenario) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Banco de dados não inicializado.'));
                return;
            }
            
            const transaction = this.db.transaction(['scenarios'], 'readwrite');
            const store = transaction.objectStore('scenarios');
            const request = store.add(scenario);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Métodos para comentários
    async getCommentsByPostId(postId) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Banco de dados não inicializado.'));
                return;
            }
            
            const transaction = this.db.transaction(['comments'], 'readonly');
            const store = transaction.objectStore('comments');
            const index = store.index('postId');
            const request = index.getAll(postId);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async addComment(comment) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Banco de dados não inicializado.'));
                return;
            }
            
            const transaction = this.db.transaction(['comments'], 'readwrite');
            const store = transaction.objectStore('comments');
            const request = store.add(comment);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Métodos para receitas
    async getReceitas() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Banco de dados não inicializado.'));
                return;
            }
            
            const transaction = this.db.transaction(['receitas'], 'readonly');
            const store = transaction.objectStore('receitas');
            const request = store.getAll();
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async addReceita(receita) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Banco de dados não inicializado.'));
                return;
            }
            
            const transaction = this.db.transaction(['receitas'], 'readwrite');
            const store = transaction.objectStore('receitas');
            const request = store.add(receita);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async updateReceita(receita) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Banco de dados não inicializado.'));
                return;
            }
            
            const transaction = this.db.transaction(['receitas'], 'readwrite');
            const store = transaction.objectStore('receitas');
            const request = store.put(receita);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async deleteReceita(id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Banco de dados não inicializado.'));
                return;
            }
            
            const transaction = this.db.transaction(['receitas'], 'readwrite');
            const store = transaction.objectStore('receitas');
            const request = store.delete(id);
            
            request.onsuccess = () => {
                resolve();
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Métodos para despesas
    async getDespesas() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Banco de dados não inicializado.'));
                return;
            }
            
            const transaction = this.db.transaction(['despesas'], 'readonly');
            const store = transaction.objectStore('despesas');
            const request = store.getAll();
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async addDespesa(despesa) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Banco de dados não inicializado.'));
                return;
            }
            
            const transaction = this.db.transaction(['despesas'], 'readwrite');
            const store = transaction.objectStore('despesas');
            const request = store.add(despesa);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async updateDespesa(despesa) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Banco de dados não inicializado.'));
                return;
            }
            
            const transaction = this.db.transaction(['despesas'], 'readwrite');
            const store = transaction.objectStore('despesas');
            const request = store.put(despesa);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async deleteDespesa(id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Banco de dados não inicializado.'));
                return;
            }
            
            const transaction = this.db.transaction(['despesas'], 'readwrite');
            const store = transaction.objectStore('despesas');
            const request = store.delete(id);
            
            request.onsuccess = () => {
                resolve();
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Adicionar este método à classe FinanceDB
    async resetDatabase() {
        return new Promise((resolve, reject) => {
            // Fechar conexão atual
            if (this.db) {
                this.db.close();
                this.db = null;
            }
            
            // Excluir banco de dados
            const request = indexedDB.deleteDatabase(this.dbName);
            
            request.onsuccess = () => {
                console.log('Banco de dados excluído com sucesso.');
                
                // Reinicializar banco de dados
                this.init();
                
                // Aguardar inicialização
                const checkInterval = setInterval(() => {
                    if (this.db) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
            };
            
            request.onerror = (event) => {
                console.error('Erro ao excluir banco de dados:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Adicionar método para atualizar entrada de histórico
    async updateHistoryEntry(entry) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Banco de dados não inicializado.'));
                return;
            }
            
            try {
                const transaction = this.db.transaction(['history'], 'readwrite');
                const store = transaction.objectStore('history');
                const request = store.put(entry);
                
                request.onsuccess = () => {
                    resolve(request.result);
                };
                
                request.onerror = (event) => {
                    reject(event.target.error);
                };
                
                // Garantir que a transação seja concluída
                transaction.oncomplete = () => {
                    console.log('Transação de atualização de histórico concluída com sucesso.');
                };
                
                transaction.onerror = (event) => {
                    console.error('Erro na transação de atualização de histórico:', event.target.error);
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    // Adicionar método para exportar dados
    async exportData() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Banco de dados não inicializado.'));
                return;
            }
            
            try {
                // Criar objeto para armazenar todos os dados
                const data = {
                    investments: [],
                    history: [],
                    settings: [],
                    scenarios: [],
                    comments: [],
                    receitas: [],
                    despesas: []
                };
                
                // Função para ler todos os dados de uma store
                const readStore = (storeName) => {
                    return new Promise((resolve, reject) => {
                        const transaction = this.db.transaction([storeName], 'readonly');
                        const store = transaction.objectStore(storeName);
                        const request = store.getAll();
                        
                        request.onsuccess = () => {
                            resolve(request.result);
                        };
                        
                        request.onerror = (event) => {
                            reject(event.target.error);
                        };
                    });
                };
                
                // Ler dados de todas as stores
                Promise.all([
                    readStore('investments').then(result => data.investments = result),
                    readStore('history').then(result => data.history = result),
                    readStore('settings').then(result => data.settings = result),
                    readStore('scenarios').then(result => data.scenarios = result),
                    readStore('comments').then(result => data.comments = result),
                    readStore('receitas').catch(() => console.log('Store receitas não encontrada')).then(result => result && (data.receitas = result)),
                    readStore('despesas').catch(() => console.log('Store despesas não encontrada')).then(result => result && (data.despesas = result))
                ])
                .then(() => {
                    // Converter para JSON
                    const jsonData = JSON.stringify(data, null, 2);
                    
                    // Criar blob e link para download
                    const blob = new Blob([jsonData], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    
                    // Criar elemento de link e simular clique
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `financas_pro_backup_${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(a);
                    a.click();
                    
                    // Limpar
                    setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    }, 100);
                    
                    resolve();
                })
                .catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    // Adicionar método para importar dados
    async importData(jsonData) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Banco de dados não inicializado.'));
                return;
            }
            
            try {
                // Converter JSON para objeto
                const data = JSON.parse(jsonData);
                
                // Função para limpar e adicionar dados a uma store
                const updateStore = (storeName, items) => {
                    return new Promise((resolve, reject) => {
                        if (!items || !Array.isArray(items) || items.length === 0) {
                            resolve();
                            return;
                        }
                        
                        const transaction = this.db.transaction([storeName], 'readwrite');
                        const store = transaction.objectStore(storeName);
                        
                        // Limpar store
                        const clearRequest = store.clear();
                        
                        clearRequest.onsuccess = () => {
                            // Adicionar novos itens
                            let completed = 0;
                            
                            items.forEach(item => {
                                const addRequest = store.add(item);
                                
                                addRequest.onsuccess = () => {
                                    completed++;
                                    if (completed === items.length) {
                                        resolve();
                                    }
                                };
                                
                                addRequest.onerror = (event) => {
                                    console.error(`Erro ao adicionar item em ${storeName}:`, event.target.error);
                                    // Continuar mesmo com erro
                                    completed++;
                                    if (completed === items.length) {
                                        resolve();
                                    }
                                };
                            });
                        };
                        
                        clearRequest.onerror = (event) => {
                            reject(event.target.error);
                        };
                    });
                };
                
                // Atualizar todas as stores
                Promise.all([
                    updateStore('investments', data.investments),
                    updateStore('history', data.history),
                    updateStore('settings', data.settings),
                    updateStore('scenarios', data.scenarios),
                    updateStore('comments', data.comments),
                    updateStore('receitas', data.receitas),
                    updateStore('despesas', data.despesas)
                ])
                .then(() => {
                    resolve();
                })
                .catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    }
}

// Inicializar banco de dados
const financeDB = new FinanceDB(); 