// Classe para gerenciar o blog
class Blog {
    constructor(db) {
        this.db = db;
        this.posts = [];
        this.currentPostId = null;
        this.init();
    }

    init() {
        // Inicializar elementos do DOM
        this.initDOMElements();
        
        // Carregar posts
        this.loadPosts();
        
        // Inicializar eventos
        this.initEvents();
    }

    initDOMElements() {
        // Elementos do blog
        this.blogPostsEl = document.getElementById('blog-posts');
        this.postContentEl = document.getElementById('post-content');
        this.postTitleEl = document.getElementById('post-title');
        this.postDateEl = document.getElementById('post-date');
        this.postAuthorEl = document.getElementById('post-author');
        this.postBodyEl = document.getElementById('post-body');
        this.backToPostsBtn = document.getElementById('back-to-posts');
        
        // Formulário de comentários
        this.commentForm = document.getElementById('comment-form');
        this.commentNameInput = document.getElementById('comment-name');
        this.commentTextInput = document.getElementById('comment-text');
        this.commentsListEl = document.getElementById('comments-list');
    }

    initEvents() {
        // Evento para voltar para a lista de posts
        this.backToPostsBtn.addEventListener('click', () => {
            this.showPostsList();
        });
        
        // Evento para enviar comentário
        this.commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitComment();
        });
    }

    async loadPosts() {
        try {
            // Simular carregamento de posts (em um cenário real, isso viria do banco de dados)
            this.posts = [
                {
                    id: 1,
                    slug: 'investimentos-para-iniciantes',
                    title: 'Investimentos para Iniciantes: Por Onde Começar',
                    date: '2023-05-15',
                    author: 'Ana Silva',
                    excerpt: 'Descubra os melhores investimentos para quem está começando a investir e quer segurança e rentabilidade.',
                    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80',
                    body: `
                        <h1>Investimentos para Iniciantes: Por Onde Começar</h1>
                        <p>Investir pode parecer intimidador no início, mas com as informações certas, qualquer pessoa pode começar a construir seu patrimônio financeiro.</p>
                        
                        <h2>1. Defina seus objetivos</h2>
                        <p>Antes de investir, é importante saber o que você quer alcançar. Você está economizando para a aposentadoria, para comprar uma casa, ou para ter uma reserva de emergência? Seus objetivos determinarão sua estratégia de investimento.</p>
                        
                        <h2>2. Crie uma reserva de emergência</h2>
                        <p>Antes de começar a investir em ativos de maior risco, é fundamental ter uma reserva de emergência. Esta deve cobrir de 3 a 6 meses de suas despesas mensais e deve estar em investimentos de alta liquidez, como um CDB de liquidez diária ou um fundo DI.</p>
                        
                        <h2>3. Conheça seu perfil de investidor</h2>
                        <p>Você é conservador, moderado ou arrojado? Seu perfil de investidor determinará quais tipos de investimentos são mais adequados para você.</p>
                        
                        <h2>4. Diversifique seus investimentos</h2>
                        <p>Não coloque todos os ovos na mesma cesta. Diversificar seus investimentos ajuda a reduzir riscos e pode melhorar seus retornos a longo prazo.</p>
                        
                        <h2>5. Investimentos recomendados para iniciantes</h2>
                        <ul>
                            <li><strong>Tesouro Direto:</strong> Títulos públicos com segurança e rentabilidade previsível.</li>
                            <li><strong>CDBs:</strong> Certificados de Depósito Bancário, com garantia do FGC até R$ 250 mil.</li>
                            <li><strong>Fundos de Investimento:</strong> Carteiras diversificadas geridas por profissionais.</li>
                            <li><strong>ETFs:</strong> Fundos negociados em bolsa que seguem índices de mercado.</li>
                        </ul>
                        
                        <h2>6. Comece com pouco</h2>
                        <p>Você não precisa de muito dinheiro para começar a investir. Muitas plataformas permitem investimentos a partir de R$ 1,00.</p>
                        
                        <h2>7. Educação financeira é contínua</h2>
                        <p>Continue aprendendo sobre investimentos. Quanto mais você souber, melhores decisões poderá tomar.</p>
                        
                        <p>Lembre-se: o melhor investimento é aquele que se adequa aos seus objetivos e ao seu perfil de risco. Não existe fórmula mágica ou investimento perfeito para todos.</p>
                    `
                },
                {
                    id: 2,
                    slug: 'investindo-sem-medo-dca',
                    title: 'Investindo Sem Medo: Como a Estratégia DCA Pode Proteger Seu Dinheiro e Maximizar Ganhos',
                    date: '2023-06-20',
                    author: 'Carlos Mendes',
                    excerpt: 'Descubra como a estratégia Dollar Cost Averaging (DCA) pode ajudar a reduzir riscos e maximizar seus ganhos a longo prazo.',
                    image: 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80',
                    body: `
                        <h1>Investindo Sem Medo: Como a Estratégia DCA Pode Proteger Seu Dinheiro e Maximizar Ganhos</h1>

                        <p>Se você quer investir com segurança e evitar grandes perdas, a estratégia DCA (<strong>Dollar Cost Averaging</strong>) pode ser a solução ideal. Neste artigo, explicamos o que é DCA, como funciona e por que investidores de sucesso usam essa estratégia para crescer seu patrimônio sem precisar prever o mercado.</p>

                        <h2>O Que é a Estratégia DCA?</h2>

                        <p>A <strong>Dollar Cost Averaging (DCA)</strong>, ou "custo médio ponderado", é uma estratégia de investimento onde você investe um valor fixo em intervalos regulares (diários, semanais ou mensais), independentemente do preço do ativo.</p>

                        <p>O objetivo do DCA é reduzir o impacto da volatilidade do mercado, comprando mais ativos quando os preços estão baixos e menos quando estão altos. Isso ajuda a suavizar os riscos e evitar decisões impulsivas.</p>

                        <h2>Por Que Usar a Estratégia DCA?</h2>

                        <ul>
                          <li><strong>Evita tentar prever o mercado:</strong> Você investe regularmente sem se preocupar se o preço está alto ou baixo.</li>
                          <li><strong>Reduz o impacto da volatilidade:</strong> Compras frequentes ajudam a equilibrar os preços médios das aquisições.</li>
                          <li><strong>Disciplina financeira:</strong> Automatizar investimentos ajuda a manter o hábito de investir.</li>
                          <li><strong>Minimiza o risco de grandes perdas:</strong> Evita investir todo o dinheiro de uma vez em um momento desfavorável.</li>
                        </ul>

                        <h2>Exemplo Prático de DCA</h2>

                        <p>Imagine que você deseja investir R$ 1.000,00 em Bitcoin. Se investisse tudo de uma vez e o preço do Bitcoin caísse, você sofreria uma grande perda. Com o DCA, você poderia investir R$ 100 por mês durante 10 meses, reduzindo os riscos.</p>

                        <p>Veja a simulação abaixo de um investidor que compra Bitcoin mensalmente:</p>

                        <div class="chart-container" style="height: 300px;">
                            <canvas id="dcaChart"></canvas>
                        </div>

                        <script>
                        document.addEventListener('DOMContentLoaded', function() {
                            const ctx = document.getElementById('dcaChart').getContext('2d');
                            const dcaChart = new Chart(ctx, {
                              type: 'line',
                              data: {
                                labels: ['Mês 1', 'Mês 2', 'Mês 3', 'Mês 4', 'Mês 5', 'Mês 6', 'Mês 7', 'Mês 8', 'Mês 9', 'Mês 10'],
                                datasets: [{
                                  label: 'Valor Investido',
                                  data: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
                                  borderColor: '#4CAF50',
                                  backgroundColor: 'rgba(76, 175, 80, 0.2)',
                                  fill: true
                                }]
                              },
                              options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: true } }
                              }
                            });
                        });
                        </script>

                        <h2>Resultados do DCA x Investimento Único</h2>

                        <p>Se o preço do Bitcoin oscilasse bastante ao longo dos meses, o investidor de DCA teria um preço médio de compra mais favorável do que quem investiu tudo de uma vez em um pico de alta.</p>

                        <h2>Conclusão</h2>

                        <p>A estratégia DCA é uma excelente opção para quem quer investir com segurança e consistência. Ela evita decisões emocionais e permite construir patrimônio de forma gradual.</p>

                        <p>Se você quer começar a investir mas tem medo de comprar na hora errada, o DCA pode ser sua melhor escolha!</p>
                    `
                },
                {
                    id: 3,
                    slug: 'independencia-financeira',
                    title: 'O Caminho para a Independência Financeira',
                    date: '2023-07-10',
                    author: 'Roberto Alves',
                    excerpt: 'Aprenda os passos essenciais para alcançar a independência financeira e viver dos seus investimentos.',
                    image: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
                    body: `
                        <h1>O Caminho para a Independência Financeira</h1>
                        <p>A independência financeira é o estado em que você não precisa mais trabalhar para viver, pois seus investimentos geram renda suficiente para cobrir suas despesas.</p>
                        
                        <h2>1. Defina o que é independência financeira para você</h2>
                        <p>Para algumas pessoas, significa ter liberdade para trabalhar no que gosta. Para outras, é poder parar de trabalhar completamente. Defina seu objetivo pessoal.</p>
                        
                        <h2>2. Calcule quanto você precisa</h2>
                        <p>Uma regra comum é multiplicar seus gastos anuais por 25 (regra dos 4%). Por exemplo, se você gasta R$ 5.000 por mês (R$ 60.000 por ano), precisaria de aproximadamente R$ 1.500.000 investidos.</p>
                        
                        <h2>3. Aumente sua taxa de poupança</h2>
                        <p>Quanto mais você conseguir poupar da sua renda, mais rápido alcançará a independência financeira. Tente poupar pelo menos 20% da sua renda.</p>
                        
                        <h2>4. Invista com sabedoria</h2>
                        <p>Diversifique seus investimentos entre renda fixa e variável. Considere investimentos que geram renda passiva, como dividendos de ações, aluguéis de imóveis e juros de títulos.</p>
                        
                        <h2>5. Reduza despesas desnecessárias</h2>
                        <p>Analise seus gastos e corte o que não agrega valor real à sua vida. Pequenas economias mensais fazem grande diferença no longo prazo.</p>
                        
                        <h2>6. Aumente suas fontes de renda</h2>
                        <p>Busque formas de aumentar sua renda principal ou criar fontes adicionais, como um trabalho freelance ou um negócio paralelo.</p>
                        
                        <h2>7. Tenha paciência e consistência</h2>
                        <p>A independência financeira é uma maratona, não uma corrida de 100 metros. Mantenha-se disciplinado e consistente com seus investimentos.</p>
                        
                        <p>Lembre-se: o caminho para a independência financeira é pessoal e único. O importante é dar o primeiro passo e manter o foco no seu objetivo final.</p>
                    `
                }
            ];
            
            // Renderizar posts
            this.renderPosts();
        } catch (error) {
            console.error('Erro ao carregar posts:', error);
            this.blogPostsEl.innerHTML = '<p class="text-red-500 dark:text-red-400 text-center py-4">Erro ao carregar posts.</p>';
        }
    }

    renderPosts() {
        // Limpar container de posts
        this.blogPostsEl.innerHTML = '';
        
        // Renderizar cada post
        this.posts.forEach(post => {
            const postEl = document.createElement('div');
            postEl.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden blog-card';
            
            postEl.innerHTML = `
                <img src="${post.image}" alt="${post.title}" class="w-full h-48 object-cover">
                <div class="p-6">
                    <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">${post.title}</h3>
                    <div class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <span>${this.formatDate(post.date)}</span>
                        <span class="mx-2">•</span>
                        <span>${post.author}</span>
                    </div>
                    <p class="text-gray-600 dark:text-gray-300 mb-4">${post.excerpt}</p>
                    <button class="text-indigo-600 dark:text-indigo-400 hover:underline read-more" data-id="${post.id}">
                        Ler mais
                    </button>
                </div>
            `;
            
            // Adicionar evento para ler post
            const readMoreBtn = postEl.querySelector('.read-more');
            readMoreBtn.addEventListener('click', () => {
                this.showPost(post.id);
            });
            
            this.blogPostsEl.appendChild(postEl);
        });
    }

    showPost(postId) {
        // Encontrar post pelo ID
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;
        
        // Atualizar elementos do post
        this.postTitleEl.textContent = post.title;
        this.postDateEl.textContent = this.formatDate(post.date);
        this.postAuthorEl.textContent = post.author;
        this.postBodyEl.innerHTML = post.body;
        
        // Carregar comentários
        this.loadComments(postId);
        
        // Armazenar ID do post atual
        this.currentPostId = postId;
        
        // Mostrar conteúdo do post e esconder lista de posts
        this.blogPostsEl.classList.add('hidden');
        this.postContentEl.classList.remove('hidden');
        
        // Atualizar URL (para SEO)
        history.pushState({}, post.title, `#blog/${post.slug}`);
    }

    showPostsList() {
        // Esconder conteúdo do post e mostrar lista de posts
        this.postContentEl.classList.add('hidden');
        this.blogPostsEl.classList.remove('hidden');
        
        // Limpar ID do post atual
        this.currentPostId = null;
        
        // Atualizar URL
        history.pushState({}, 'Blog', '#blog');
    }

    async loadComments(postId) {
        try {
            // Carregar comentários do banco de dados
            const comments = await this.db.getCommentsByPostId(postId);
            
            // Limpar lista de comentários
            this.commentsListEl.innerHTML = '';
            
            if (comments.length === 0) {
                this.commentsListEl.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-4">Nenhum comentário ainda. Seja o primeiro a comentar!</p>';
            } else {
                // Renderizar comentários
                comments.forEach(comment => {
                    const commentEl = document.createElement('div');
                    commentEl.className = 'bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4';
                    
                    const date = new Date(comment.date);
                    const formattedDate = date.toLocaleDateString('pt-BR');
                    
                    commentEl.innerHTML = `
                        <div class="flex justify-between items-start">
                            <h5 class="font-medium text-gray-700 dark:text-gray-300">${comment.name}</h5>
                            <span class="text-sm text-gray-500 dark:text-gray-400">${formattedDate}</span>
                        </div>
                        <p class="text-gray-600 dark:text-gray-300 mt-2">${comment.text}</p>
                    `;
                    
                    this.commentsListEl.appendChild(commentEl);
                });
            }
        } catch (error) {
            console.error('Erro ao carregar comentários:', error);
            this.commentsListEl.innerHTML = '<p class="text-red-500 dark:text-red-400 text-center py-4">Erro ao carregar comentários.</p>';
        }
    }

    async submitComment() {
        // Verificar se há um post atual
        if (!this.currentPostId) return;
        
        // Obter valores do formulário
        const name = this.commentNameInput.value.trim();
        const text = this.commentTextInput.value.trim();
        
        // Validar campos
        if (!name || !text) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        
        try {
            // Criar comentário
            const comment = {
                postId: this.currentPostId,
                name,
                text,
                date: new Date().toISOString()
            };
            
            // Salvar comentário no banco de dados
            await this.db.addComment(comment);
            
            // Limpar formulário
            this.commentNameInput.value = '';
            this.commentTextInput.value = '';
            
            // Recarregar comentários
            this.loadComments(this.currentPostId);
            
            alert('Comentário enviado com sucesso!');
        } catch (error) {
            console.error('Erro ao enviar comentário:', error);
            alert('Erro ao enviar comentário. Verifique o console para mais detalhes.');
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }
}

// Inicializar blog quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se o banco de dados está pronto
    if (financeDB.db) {
        new Blog(financeDB);
    } else {
        // Se o banco de dados ainda não estiver pronto, aguardar
        const dbCheckInterval = setInterval(() => {
            if (financeDB.db) {
                clearInterval(dbCheckInterval);
                new Blog(financeDB);
            }
        }, 100);
    }
}); 