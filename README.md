# Calculadora de Benefícios do Saneamento

## Visão Geral

**Calculadora de Benefícios do Saneamento** é uma aplicação web interativa e intuitiva, desenvolvida para estimar os retornos sobre investimentos em projetos de saneamento. Esta ferramenta foi criada para auxiliar gestores, planejadores e stakeholders a compreenderem de forma clara e objetiva os múltiplos benefícios que o saneamento adequado pode trazer para a sociedade. Ao calcular os retornos sobre o investimento em saneamento, a aplicação considera uma variedade de indicadores sociais, econômicos e de saúde, proporcionando uma visão holística e abrangente dos impactos positivos gerados.

A aplicação permite aos usuários inserir dados de investimento e selecionar diferentes tipos de intervenção em saneamento, adaptando-se a diversos cenários e contextos. Com uma interface amigável, mesmo usuários sem conhecimento técnico especializado podem facilmente operar a calculadora e interpretar os resultados. Além disso, a ferramenta oferece funcionalidades de gerenciamento de coeficientes, permitindo que usuários avançados personalizem e ajustem os parâmetros de cálculo para refletir condições locais específicas ou dados mais precisos.

### Intenção do Aplicativo

O principal objetivo desta calculadora é fornecer uma ferramenta prática e acessível para a avaliação de projetos de saneamento. Tradicionalmente, a análise de custo-benefício em saneamento pode ser complexa e exigir conhecimentos técnicos específicos. Esta aplicação simplifica esse processo, oferecendo uma interface intuitiva que permite aos usuários:

-   **Quantificar os benefícios do saneamento:**  Transformar os investimentos em saneamento em valores tangíveis de retorno social, econômico e de saúde.
-   **Tomar decisões informadas:**  Auxiliar gestores e planejadores a priorizar investimentos em saneamento com base em dados concretos sobre os retornos esperados.
-   **Comunicar o valor do saneamento:**  Fornecer uma ferramenta de comunicação eficaz para demonstrar aos stakeholders e à sociedade em geral os múltiplos benefícios do saneamento adequado.
-   **Adaptar a diferentes contextos:** Permitir a personalização dos coeficientes de cálculo para refletir as particularidades de diferentes regiões e projetos.

### Estrutura do Aplicativo

O aplicativo é construído utilizando uma arquitetura frontend moderna, baseada em componentes reutilizáveis e gerenciada pela biblioteca React. A estrutura do projeto é organizada da seguinte forma:

-   **`public/`**: Contém arquivos estáticos que são servidos diretamente pelo servidor web, como o arquivo `index.html`.
-   **`src/`**:  Diretório principal do código fonte da aplicação.
    -   **`assets/`**: Armazena recursos estáticos como imagens e logos (atualmente não em uso).
    -   **`components/`**:  Destinado a componentes React reutilizáveis (atualmente não utilizado, mas pode ser expandido no futuro).
    -   **`App.jsx`**: Componente React principal que orquestra a interface do usuário e a lógica da aplicação. Define a estrutura do menu lateral, formulários, gráficos e tabelas.
    -   **`calculator.js`**: Módulo JavaScript que contém toda a lógica de cálculo dos benefícios do saneamento. Define os coeficientes e a função `calculateBenefits.calculate()` que realiza os cálculos.
    -   **`index.css`**: Arquivo CSS para estilos globais e customizações da aparência da aplicação.
    -   **`main.jsx`**: Ponto de entrada da aplicação React. Inicializa a aplicação e renderiza o componente `App` no elemento HTML com o ID `root` (definido em `index.html`).
-   **`index.html`**: Arquivo HTML principal que define a estrutura básica da página web e inclui o ponto de montagem para a aplicação React (`<div id="root"></div>`).
-   **`package.json`**: Arquivo de manifesto do Node.js que lista as dependências do projeto (React, react-bootstrap, react-chartjs-2, chart.js, vite) e define scripts para executar tarefas como iniciar o servidor de desenvolvimento (`npm run dev`).
-   **`README.md`**: Arquivo de documentação do projeto (este arquivo), que fornece informações sobre o aplicativo, como utilizá-lo, a pilha tecnológica, etc.

### Banco de Coeficientes

O "banco de coeficientes" é, na verdade, um conjunto de dados embutido diretamente no código fonte da aplicação, no arquivo `src/calculator.js`. Ele é estruturado como objetos JavaScript que armazenam os valores dos coeficientes utilizados nos cálculos de benefícios.

Existem dois conjuntos principais de coeficientes:

1.  **`calculateBenefits.coeficientes`**: Este objeto contém coeficientes relacionados aos benefícios sociais e de saúde do saneamento, como "Aumento na Escolaridade Média", "Redução no Atraso Escolar", "Economia nos Custos com Saúde", etc. A estrutura é hierárquica:
    -   O primeiro nível são os **indicadores principais** (ex: "Aumento na Escolaridade Média").
    -   O segundo nível são os **sub-indicadores** ou **tipos de intervenção** (ex: "Acesso à rede de esgoto", "Acesso à água tratada", "Disponibilidade de banheiro").
    -   Para cada combinação de indicador principal e sub-indicador, há um objeto que define:
        -   `coefficient`: O valor numérico do coeficiente.
        -   `inputUnit`: A unidade de medida da entrada (ex: "%" para percentual).
        -   `outputUnit`: A unidade de medida da saída (ex: "%", "R$", "casos/1.000 habitantes").

    Exemplo:

    ```javascript
    "Aumento na Escolaridade Média": {
      "Acesso à rede de esgoto": { coefficient: 0.181, inputUnit: "%", outputUnit: "%" },
      // ... outros sub-indicadores
    },
    // ... outros indicadores principais
    ```

2.  **`calculateBenefits.coeficientes_empregos`**: Este objeto contém coeficientes relacionados à geração de empregos e renda a partir de investimentos em saneamento. A estrutura é mais simples:
    -   O primeiro nível são os **indicadores de emprego/renda** (ex: "Empregos Diretos na Construção Civil", "Total de Empregos Gerados por Investimentos").
    -   Para cada indicador, há um objeto que define:
        -   `coefficient`: O valor numérico do coeficiente.
        -   `inputUnit`: A unidade de medida da entrada (ex: "R$1M" para R$1 milhão).
        -   `outputUnit`: A unidade de medida da saída (ex: "empregos").

    Exemplo:

    ```javascript
    "Empregos Diretos na Construção Civil": { coefficient: 7.588, inputUnit: "R$1M", outputUnit: "empregos" },
    // ... outros indicadores de emprego
    ```

**Gerenciamento de Coeficientes:**

A aplicação oferece uma interface de usuário acessível através do menu lateral na seção "Coeficientes" que permite visualizar, editar, adicionar e excluir coeficientes. As modificações feitas na interface são aplicadas diretamente aos objetos `calculateBenefits.coeficientes` e `calculateBenefits.coeficientes_empregos` em memória. **É importante notar que, como esta é uma aplicação frontend sem backend, as alterações nos coeficientes não são persistentes após o fechamento ou recarregamento da página.**  Se a persistência de dados for necessária, seria preciso implementar um backend e um banco de dados para armazenar e recuperar os coeficientes.

### Funcionamento da Calculadora

A calculadora opera com base nos coeficientes definidos no "banco de coeficientes" e nas entradas fornecidas pelo usuário na seção "Calculadora" do menu lateral. O processo de cálculo segue os seguintes passos:

1.  **Entrada de Dados do Usuário:**
    -   O usuário seleciona o "Tipo de Intervenção":
        -   "Aumento Percentual da Cobertura de Saneamento" (para esgoto, água ou banheiro).
        -   "Investimento Monetário Direto em Saneamento".
    -   O usuário insere o "Valor da Intervenção":
        -   Um valor percentual (se o tipo de intervenção for "Aumento Percentual...").
        -   Um valor monetário em Reais (R$) se o tipo de intervenção for "Investimento Monetário Direto...").
    -   O usuário seleciona os "Indicadores" que deseja incluir no cálculo. Os indicadores disponíveis são filtrados com base no tipo de intervenção selecionado.

2.  **Cálculo dos Benefícios (Função `calculateBenefits.calculate()`):**
    -   A função `calculateBenefits.calculate(interventionType, coverageIncrease, investment, selectedIndicators)` é chamada com os dados de entrada do usuário.
    -   A função itera sobre os `selectedIndicators`.
    -   Para cada indicador selecionado, ela verifica o `interventionType`:
        -   **Se `interventionType` for "Aumento Percentual..."**:
            -   Ela busca o coeficiente correspondente no objeto `calculateBenefits.coeficientes`, com base no `selectedIndicator` e no tipo de saneamento (esgoto, água ou banheiro) derivado do `interventionType`.
            -   O retorno é calculado multiplicando o `coefficient` pelo `coverageIncrease` (valor percentual inserido pelo usuário).
            -   O resultado é formatado com a `outputUnit` correspondente.
        -   **Se `interventionType` for "Investimento Monetário Direto..."**:
            -   Para alguns indicadores de emprego (presentes em `calculateBenefits.coeficientes_empregos`), o retorno é calculado multiplicando o `coefficient` pelo `investment` (valor monetário inserido pelo usuário), possivelmente com alguma conversão de unidades (ex: converter investimento para milhões de Reais).
            -   Para indicadores de renda (como "Renda Total Gerada na Economia"), são aplicados multiplicadores de renda pré-definidos (`calculateBenefits.multiplicador_renda`).
            -   Para indicadores específicos como "Geração de Empregos Diretos" e "Total de Salários Gerados", são utilizadas fórmulas ou coeficientes específicos baseados no investimento total.
            -   O resultado é formatado com a `outputUnit` correspondente (ex: "empregos", "R$").

3.  **Exibição dos Resultados:**
    -   Os resultados calculados para cada indicador são armazenados em um array de objetos (`results`).
    -   Os resultados são exibidos de duas formas:
        -   **Gráfico de Barras:** Um gráfico de barras interativo (gerado com `react-chartjs-2`) que visualiza os retornos para cada indicador. As barras são coloridas em verde para retornos positivos e vermelho para retornos negativos (embora, no contexto atual, todos os retornos devam ser positivos).
        -   **Cards de Resultados:** Cards responsivos que exibem o valor formatado do retorno e o nome do indicador para cada resultado calculado.

Em resumo, a calculadora funciona aplicando coeficientes pré-definidos (armazenados no código) aos valores de investimento inseridos pelo usuário, de acordo com o tipo de intervenção e os indicadores selecionados. Ela simplifica a análise de benefícios do saneamento, fornecendo resultados visuais e numéricos de forma clara e acessível.

## Pilha Tecnológica Robusta e Moderna

-   **Frontend:**
    -   **React:** Biblioteca JavaScript para construção de interfaces de usuário reativas e componentizadas.
    -   **Chart.js (via react-chartjs-2):** Biblioteca para criação de gráficos interativos e visualmente atraentes.
    -   **Bootstrap (via react-bootstrap):** Framework CSS para desenvolvimento rápido e responsivo, garantindo uma interface consistente e agradável.
-   **Ferramenta de Build:**
    -   **Vite:** Ferramenta de build extremamente rápida e eficiente para desenvolvimento frontend, otimizando o desempenho e a experiência de desenvolvimento.

## Estrutura do Projeto Organizada

```
sanitation-benefits-calculator/
├── public/
├── src/
│   ├── assets/       # Recursos estáticos como imagens e logos
│   ├── components/   # Componentes React reutilizáveis (se aplicável)
│   ├── App.jsx       # Componente principal da aplicação, orquestra a interface e a lógica
│   ├── calculator.js # Lógica de cálculo dos benefícios, separada para clareza e reutilização
│   ├── index.css     # Estilos globais e customizações CSS
│   └── main.jsx      # Ponto de entrada da aplicação React, inicialização e renderização
├── index.html      # Arquivo HTML principal, container para a aplicação React
├── package.json    # Gerenciador de dependências e scripts npm para build e desenvolvimento
└── README.md       # Documentação do projeto (este arquivo)
```

## Primeiros Passos para Utilização

1.  **Obtenha os arquivos do projeto:**
    Como o Git não está disponível neste ambiente, você precisará copiar os arquivos manualmente. Se você tiver acesso aos arquivos em um formato zip ou similar, descompacte-os no diretório desejado.

2.  **Instale as dependências:**
    Navegue até o diretório raiz do projeto no terminal e execute o seguinte comando para instalar todas as dependências listadas no arquivo `package.json`:

    ```bash
    npm install
    ```

3.  **Inicie o servidor de desenvolvimento:**
    Após a instalação das dependências, execute o seguinte comando para iniciar o servidor de desenvolvimento local. Isso irá compilar a aplicação e disponibilizá-la em um endereço local para visualização no seu navegador:

    ```bash
    npm run dev
    ```

    A aplicação estará acessível em um endereço como `http://localhost:5173` ou similar, que será exibido no terminal após a execução do comando.

## Guia de Uso Detalhado

1.  **Menu Lateral:**
    -   Utilize o menu lateral para navegar entre as seções da aplicação: "Calculadora", "Coeficientes", "Ábaco" e "Sobre". Clique no ícone de menu (hambúrguer) no canto superior esquerdo para expandir ou recolher o menu lateral.

2.  **Seção "Calculadora":**
    -   **Entrada de Investimento:** Insira o valor total do investimento planejado no campo "Valor do Investimento".
    -   **Tipo de Intervenção:** Selecione o tipo de intervenção no menu suspenso "Tipo de Intervenção". As opções são:
        -   "Aumento Percentual da Cobertura de Saneamento": Escolha esta opção se o seu projeto visa aumentar a porcentagem da população com acesso a saneamento.
        -   "Investimento Monetário Direto em Saneamento": Selecione esta opção se você possui um valor de investimento fixo e deseja calcular os benefícios a partir desse montante.
    -   **Seleção de Indicadores:** Marque as caixas de seleção ao lado dos indicadores que você deseja incluir no cálculo. Os indicadores disponíveis mudarão dependendo do tipo de intervenção selecionado.
    -   **Botão "Calcular":** Após inserir os dados e selecionar os indicadores, clique neste botão para realizar o cálculo dos benefícios.
    -   **Visualização dos Resultados:** Os resultados serão exibidos em duas formas:
        -   **Gráfico:** Um gráfico interativo mostrará a distribuição dos benefícios entre os diferentes indicadores.
        -   **Tabela:** Uma tabela detalhada apresentará os valores calculados para cada indicador selecionado, permitindo uma análise mais aprofundada.

3.  **Seção "Coeficientes":**
    -   **Visualizar Coeficientes:** A tabela nesta seção exibe todos os coeficientes utilizados nos cálculos. Cada linha representa um coeficiente, com informações como nome, descrição, unidade de entrada, unidade de saída e valor atual.
    -   **Editar Coeficiente:** Para modificar um coeficiente existente, localize-o na tabela e clique no botão "Editar" (ícone de lápis). Uma janela modal será aberta, permitindo que você altere o valor do coeficiente. Após a edição, clique em "Salvar" para aplicar as mudanças.
    -   **Excluir Coeficiente:** Para remover um coeficiente, localize-o na tabela e clique no botão "Excluir" (ícone de lixeira). Confirme a exclusão na janela de confirmação.
    -   **Adicionar Coeficiente:** Para adicionar um novo coeficiente, clique no botão "Adicionar Coeficiente" no topo da tabela. Uma janela modal será aberta com um formulário para preencher os detalhes do novo coeficiente (nome, descrição, unidade de entrada, unidade de saída, valor inicial). Após preencher os dados, clique em "Salvar" para adicionar o novo coeficiente.

4.  **Seção "Ábaco":**
    -   [Em Breve: Descrição da funcionalidade do Ábaco interativo, assim que implementado]
    -   [Placeholder para futura descrição do Ábaco]

5.  **Seção "Sobre":**
    -   A seção "Sobre" apresenta informações gerais sobre a calculadora, sua intenção, estrutura e tecnologias utilizadas. Inclui a documentação completa do projeto.

## Contribuições são Bem-vindas!

Se você tem interesse em contribuir para o desenvolvimento e melhoria desta ferramenta, suas contribuições são muito bem-vindas! Seja através de sugestões de novas funcionalidades, identificação e correção de bugs, melhorias na interface do usuário ou contribuições de código, toda ajuda é valiosa.

Para contribuir, sinta-se à vontade para abrir issues relatando problemas ou propondo melhorias, ou enviar pull requests com suas alterações.

## Licença

[Adicionar informações sobre a licença sob a qual o projeto é distribuído. Exemplo: MIT License]

## Contato

Desenvolvido por Itaipu Parquetec, Itaipu Binacional e Sanepar.

Para questões, sugestões ou informações adicionais, entre em contato: contato@itaipuparquetec.com.br
