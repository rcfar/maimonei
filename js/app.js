// Classe para gerenciar a aplicação
class App {
    constructor() {
        this.init();
    }

    init() {
        // Inicializar elementos do DOM
        this.initDOMElements();
        
        // Inicializar eventos
        this.initEvents();
        
        // Inicializar tema
        this.initTheme();
        
        // Inicializar navegação
        this.initNavigation();
        
        // Bloquear clique com botão direito
        this.blockRightClick();
    }

    initDOMElements() {
        // Navegação
        this.navLinks = document.querySelectorAll('nav a[data-target]');
        this.sections = document.querySelectorAll('.section-content');
        
        // Tema
        this.themeToggle = document.getElementById('theme-toggle');
        this.moonIcon = document.getElementById('moon');
        this.sunIcon = document.getElementById('sun');
    }

    initEvents() {
        // Eventos de navegação
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('data-target');
                this.navigateTo(target);
            });
        });
        
        // Evento para alternar tema
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Evento para navegação por hash
        window.addEventListener('hashchange', () => {
            this.handleHashChange();
        });
    }

    initTheme() {
        // Verificar tema salvo
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            this.moonIcon.classList.add('hidden');
            this.sunIcon.classList.remove('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            this.moonIcon.classList.remove('hidden');
            this.sunIcon.classList.add('hidden');
        }
    }

    initNavigation() {
        // Verificar hash na URL
        this.handleHashChange();
    }

    navigateTo(target) {
        // Atualizar classes ativas na navegação
        this.navLinks.forEach(link => {
            if (link.getAttribute('data-target') === target) {
                link.classList.add('active-nav');
            } else {
                link.classList.remove('active-nav');
            }
        });
        
        // Mostrar seção alvo e esconder as demais
        this.sections.forEach(section => {
            if (section.id === target) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        });
        
        // Atualizar hash na URL
        history.pushState({}, '', `#${target}`);
    }

    handleHashChange() {
        // Obter hash da URL
        let hash = window.location.hash.substring(1);
        
        // Verificar se é um post do blog
        if (hash.startsWith('blog/')) {
            // Mostrar seção do blog
            this.navigateTo('blog');
            return;
        }
        
        // Se não houver hash ou for inválido, usar dashboard como padrão
        if (!hash || !document.getElementById(hash)) {
            hash = 'dashboard';
        }
        
        // Navegar para a seção
        this.navigateTo(hash);
    }

    toggleTheme() {
        // Alternar tema
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            this.moonIcon.classList.remove('hidden');
            this.sunIcon.classList.add('hidden');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            this.moonIcon.classList.add('hidden');
            this.sunIcon.classList.remove('hidden');
        }
    }

    // Adicionar método para bloquear clique com botão direito
    blockRightClick() {
        // Bloquear clique com botão direito
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            alert('Clique com botão direito desativado nesta aplicação.');
            return false;
        });
        
        // Bloquear teclas de atalho para inspeção
        document.addEventListener('keydown', (e) => {
            // Bloquear F12
            if (e.key === 'F12') {
                e.preventDefault();
                return false;
            }
            
            // Bloquear Ctrl+Shift+I ou Cmd+Option+I (Inspetor)
            if ((e.ctrlKey && e.shiftKey && e.key === 'I') || 
                (e.metaKey && e.altKey && e.key === 'i')) {
                e.preventDefault();
                return false;
            }
            
            // Bloquear Ctrl+Shift+C ou Cmd+Option+C (Seletor de elementos)
            if ((e.ctrlKey && e.shiftKey && e.key === 'C') || 
                (e.metaKey && e.altKey && e.key === 'c')) {
                e.preventDefault();
                return false;
            }
            
            // Bloquear Ctrl+S ou Cmd+S (Salvar)
            if ((e.ctrlKey && e.key === 's') || 
                (e.metaKey && e.key === 's')) {
                e.preventDefault();
                return false;
            }
            
            // Bloquear Ctrl+U ou Cmd+Option+U (Ver código fonte)
            if ((e.ctrlKey && e.key === 'u') || 
                (e.metaKey && e.altKey && e.key === 'u')) {
                e.preventDefault();
                return false;
            }
        });
        
        // Desabilitar seleção de texto
        document.addEventListener('selectstart', (e) => {
            // Permitir seleção em campos de entrada
            if (e.target.tagName === 'INPUT' || 
                e.target.tagName === 'TEXTAREA' || 
                e.target.isContentEditable) {
                return true;
            }
            e.preventDefault();
            return false;
        });
    }
}

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new App();
}); 