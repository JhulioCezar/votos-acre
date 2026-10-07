# Filtros territoriais e comparação — 07/10/2026

Novas áreas: “Situação judicial e simulação de vagas” e “Entenda a distribuição das vagas”, disponíveis na visão geral e na análise de candidatos. Incluem seis casos registrados, hipóteses isoladas para os cinco proporcionais, todos os eleitos federais e estaduais, votos nominais e de legenda, QE/QP, múltiplos do QE, requisitos individuais, vagas e rodadas das sobras. Ambas têm relatórios próprios para PDF. Os cadastros são atualizados manualmente; não há monitoramento judicial automático. Veja `CALCULO-VAGAS.md` para metodologia, validação e manutenção. O pacote deve manter `situacoes-judiciais.json`, `distribuicao-vagas.json` e `tools/calcular_vagas.py` junto aos fontes para futuras reconstruções; o `index.html` permanece independente.

Última atualização: todos os botões e rotinas de exportação CSV foram removidos. “Abrir BU” foi substituído por “Consultar local · TRE-AC”, com link para o cadastro público de locais, preenchendo município, zona e seção pela rota de consulta do portal. A lista de bairros agora mostra os votos do candidato principal em cada bairro, respeitando os filtros ativos. O relatório passou a incluir “Explore as regionais e os bairros”, com mapa, legenda em tabela das regionais e tabela dos bairros com seções e votos. Na seleção de todo o Acre, essa parte apresenta o subconjunto de Rio Branco; quando há uma regional selecionada, apresenta apenas essa regional. A soma dos bairros foi conferida contra o total de votos da seleção.

Relatório: o botão do resumo de candidatos agora é “Gerar Relatório”. Abre um documento em uma nova aba e a impressão do navegador; selecione “Salvar como PDF”. Na visão geral, mostra eleitorado, comparecimento e totais estaduais dos cargos. Com candidato selecionado, mostra o resumo dos filtros, ranking completo no agrupamento escolhido, distribuição por seção, mapa, comparação se houver candidatos adicionados e todas as seções filtradas, sem limitar à paginação. Um filtro de regional recorta o mapa à regional. A comparação no relatório usa exatamente as seções filtradas, incluindo limites e presença do candidato principal, com essa diferença explicitada no documento. A apresentação é sempre clara para impressão, independente do tema da aplicação. O navegador pode solicitar permissão para abrir a nova aba. O PDF é salvo pela opção do navegador, não por download automático de um arquivo binário.

O campo de comparecimento agora inclui 79,6% dos cadastrados. O cabeçalho mostra somente “DADOS OFICIAIS DO TSE”. A abertura sem filtros inicia na visão geral, sem candidato predefinido; endereços compartilhados com `#filtros=` continuam abrindo a seleção compartilhada. Testado o relatório geral e de uma regional, incluindo conferência das seções e renderização de PDF A4 para verificar mapas, gráficos, tabelas e quebras de página.

Mapa específico de Rio Branco: dez regionais urbanas em cores distintas, seleção pelo polígono ou pela legenda, zoom, arraste após ampliar e camada opcional dos limites de bairros. Selecionar no mapa atualiza os filtros da votação e da comparação. A lista de bairros é formada por bairros com prédios associados na base; não é cadastro administrativo completo. Os polígonos de bairros são recortados visualmente pelos de regionais, sem assumir que todo bairro pertence exclusivamente a uma regional. A classificação dos prédios segue o cruzamento geográfico já documentado. Seções sem regional identificada ficam fora dos polígonos e são contadas no aviso. A tabela da SEAD, citada no mapa, define cinco regionais estaduais que agrupam municípios; não define estes limites urbanos. Calafate permanece como regional própria conforme o mapa municipal, e não foi incluído arbitrariamente em Floresta. Os polígonos estão incorporados no HTML e em `data.json`, sem dependência de acesso à internet para mostrar o mapa.

Atualização visual: rodapé com “Links oficiais de referência”, remoção do link JSON de deputado estadual e novo endereço dos Resultados do TSE indicado pelo usuário. Eleitorado com 125.345 ausentes (cadastrados menos comparecimento), gráfico de rosca com 79,6% de comparecimento e 20,4% de ausência. Comparação com gráfico de barras dos totais dos candidatos na seleção. Temas Claro, Escuro e Sistema, preferência salva localmente e acompanhamento automático do tema do dispositivo quando escolhido Sistema. As contagens permanecem inalteradas; os gráficos incluem valores e legendas em texto.

A página inicial original foi recuperada do HTML publicado: visão geral dos quatro cargos, eleitorado, comparecimento, opção “Todos os cargos” e busca de candidatos entre cargos. Os arquivos de `src` agora incluem essa tela, para preservá-la nas próximas reconstruções. Os filtros territoriais e a comparação permanecem disponíveis ao selecionar um candidato.

## Publicação

Para atualizar o site existente, substitua `index.html` na raiz do repositório. Ele continua independente, com dados, estilos e código incorporados. Para manter os fontes sincronizados, envie também `data.json`, `src/app.js`, `src/index.html`, `src/styles.css`, `build.py`, `conferencia-territorial.json`, `README.md` e este documento. Não é necessário alterar o domínio ou as configurações do GitHub Pages.

## Novidades

- Busca por nome do prédio, endereço, bairro, regional, município, zona e seção, sem diferenciar acentos e maiúsculas. Exemplos: UFAC; IFAC Xavier Maia.
- Filtros encadeados por município, regional, bairro, zona eleitoral e prédio.
- Ranking por bairro e regional, além de município, zona e local.
- Comparação de dois ou mais candidatos do mesmo cargo por município, zona, prédio, bairro ou regional; votos, percentuais, empate e diferença entre as duas maiores votações do grupo.
- Ordenação da comparação por mais ou menos votos do primeiro candidato adicionado, ou pelo nome do grupo.
- Exportação da comparação em CSV e novos campos territoriais no CSV das seções.
- Links compartilhados preservam os candidatos da comparação e seus agrupamentos.
- A tabela inclui seções com zero votos mesmo após selecionar um município.

## Fontes e correspondência

Cadastro de locais: https://planeleito.tre-ac.jus.br/rotas-publicas/locais-votacao (exportação pública XLSX, coletada em 07/10/2026).

Bairros: https://rbgeo.riobranco.ac.gov.br/server/rest/services/Hosted/Bairros_2023/FeatureServer/0 (base municipal de 2023).

Regionais: https://rbgeo.riobranco.ac.gov.br/server/rest/services/Regionais/MapServer/0.

Os nomes e endereços foram associados pela combinação de município, zona e seção principal. As 2.270 seções têm correspondência única no cadastro consultado, sem mudar votos ou códigos originais. Cada seção agregada continua contabilizada apenas no boletim principal.

Rio Branco tem 908 seções na base: 861 receberam bairro (76 bairros distintos) e 850 receberam regional (10 regionais distintas). A associação territorial usa o ponto de latitude/longitude cadastrado pelo TRE dentro do polígono publicado pela Prefeitura. Nenhum bairro ou regional foi deduzido do nome da escola. Pontos fora dos polígonos ou sem correspondência única permanecem “Não identificado”. Não foi criada uma classificação informal de “parte alta” ou “segundo distrito”; esses termos não são equivalentes às dez regionais urbanas do mapa consultado. As regionais rurais não estão cobertas por esse mapa.

O bairro do prédio não indica a residência dos eleitores. A classificação depende da precisão das coordenadas do cadastro e dos limites municipais; pode diferir do nome do bairro utilizado informalmente em um endereço. Os bairros e regionais desta versão são específicos de Rio Branco; em outros municípios, os nomes e endereços dos prédios estão disponíveis, mas esses campos territoriais ficam sem identificação.

## Como ler a comparação

Os filtros territoriais e de texto são iguais para todos os candidatos comparados. Presença e limites de votos do candidato principal são exclusivos da análise individual; não restringem a comparação, para evitar excluir seções com base na votação de apenas um candidato.

O percentual divide os votos do candidato pela soma dos votos nominais de todos os candidatos cadastrados para aquele cargo nas mesmas seções, incluindo votos anulados sub judice. Não inclui legenda, brancos, nulos ou números fora do resumo de candidatos. Não é percentual de eleitores, nem dos votos nominais válidos. No Senado, cada eleitor podia registrar dois votos. Com denominador zero, o percentual aparece como travessão.

“Maior votação” considera apenas os candidatos adicionados à comparação; empate é explicitado. A diferença é calculada entre as duas maiores votações, mesmo quando mais candidatos foram selecionados. Não há inferência de intenção de voto, recomendação ou projeção.

## Manutenção

Edite os arquivos em `src` e execute `python build.py` para regenerar o HTML. `data.json` contém os novos campos e `territorySources` documenta sua procedência. Os votos e seus totais permanecem os da coleta original em 05/10/2026.

Validação: reconstrução com conferência dos 323 candidatos e 2.270 seções; execução em Chrome sem erros de JavaScript; filtros por município, busca IFAC, bairro e zero votos; comparação de três candidatos; restauração por URL; troca de cargo; visualização em celular.

## Bairros dos demais municípios

- Mapas e filtros adicionados para oito municípios com malha de bairros do IBGE (Censo 2022).
- A área antes restrita a Rio Branco agora acompanha o município selecionado e permite selecionar bairros no mapa ou nos botões com votos.
- Relatório inclui mapa e tabela de bairros do município, conforme os filtros.
- Mais 502 seções identificadas em 49 bairros; totais eleitorais e regionais de Rio Branco preservados.
- Municípios sem malha apresentam mensagem de ausência de cobertura.
- Consulte cobertura-bairros.json para contagens por município.

## Complemento: Cruzeiro do Sul e Senador Guiomard

- Bairro identificado em todas as 337 seções dos dois municípios pelo cadastro TSE 2026, com código, nome e endereço do prédio conferidos.
- Visualização de pontos dos prédios, sem inventar limites de bairros.
- Bairros e categorias rurais disponíveis nos filtros, ranking, comparação e relatório PDF.
- Nomes de bairros seguem o cadastro eleitoral, não uma divisão municipal completa.

## Menu lateral e fotos oficiais

A aplicação apresenta áreas separadas: Página Inicial, Senador, Governador, Deputado Estadual, Deputado Federal, Quociente eleitoral e Candidatos sub judice. O menu marca a área ativa e fica recolhido no celular. A página inicial preserva o eleitorado, comparecimento, visão geral de todos os cargos e busca de candidatos. Ao escolher um cargo, selecione o candidato para explorar filtros, bairros, mapas, gráficos e comparação. Os cálculos de vagas e situações judiciais possuem suas próprias áreas e relatórios.

Foram retirados o símbolo da marca, ícone da aba, setas de navegação decorativas e símbolos dos controles dos mapas, substituídos por texto.

As fotos dos 323 candidatos foram baixadas do TSE e associadas pelo identificador oficial sqcand no cargo e número correspondentes. Estão incorporadas ao HTML e ao data.json, sem necessidade de enviar uma pasta adicional de fotos. O candidato selecionado apresenta foto, nome, número e informações eleitorais. A foto acompanha o relatório do candidato. Sem foto disponível, a identificação continua em texto. Veja conferencia-fotos.json para URLs e conferência. O HTML ficou maior por conter todas as imagens.

Fonte e formato das fotos: https://www.tse.jus.br/eleicoes/informacoes-tecnicas-sobre-a-divulgacao-de-resultados-2024 (estrutura sqcand.jpeg da divulgação de resultados, aplicada ao ciclo ele2026/6259).
