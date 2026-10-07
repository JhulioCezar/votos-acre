# Votos no Acre

Painel independente do primeiro turno de 2026, com os 2.270 boletins de urna do Acre. Não inclui presidente. Dados da coleta de 05/10/2026; não há atualização automática.

## Publicar no GitHub Pages

Crie um novo repositório, por exemplo `votos-acre`, mantendo o repositório de Antônio Pedro como está. Envie `index.html` e `.nojekyll` para a raiz. Em Settings → Pages, selecione Deploy from a branch, branch main e pasta / (root).

O HTML já contém os dados, estilos, gráficos e código. Não depende da planilha nem da pasta src para funcionar. Os demais arquivos servem para manutenção e conferência.

O arquivo CNAME deste pacote contém `votosacre.jhuliosolucoes.com.br`. Envie esse arquivo apenas se usar esse endereço. Na Cloudflare, crie um CNAME de `votosacre` para `jhuliocezar.github.io`, inicialmente com proxy desativado. No GitHub Pages, configure o mesmo domínio e habilite Enforce HTTPS quando o certificado estiver disponível. Para outro domínio, altere o CNAME. Não altere o domínio do site de Antônio Pedro.

## Conteúdo

- Governador: 6 candidatos.
- Senador: 8 candidatos.
- Deputado federal: 87 candidatos.
- Deputado estadual: 222 candidatos.

Escolha cargo e candidato, depois município, zona e local de votação. Há filtros de presença e quantidade de votos, busca, ranking, mapa municipal, distribuição por seção e tabela com consulta ao cadastro oficial de locais do TRE-AC. A tabela inclui as seções com zero votos, conforme os filtros. O mapa mostra totais por município; não representa a posição de cada eleitor ou endereço exato de cada seção.

## Relatórios

Use Gerar Relatório para abrir o documento com os filtros selecionados, gráficos, mapas e tabelas. Na impressão do navegador, escolha Salvar como PDF. Não há botões CSV.

Os totais nominais dos candidatos incluem a votação registrada nos boletins mesmo quando a destinação é anulada sub judice. Essa destinação aparece junto ao nome. A visão geral apresenta separadamente as categorias oficiais, evitando confundir votos registrados com votos válidos. Para senador, cada eleitor podia registrar dois votos.

Foram preservados cinco números presentes nos BUs e ausentes do resumo de candidatos: 4000, 4022 e 4033 para deputado federal (45 votos ao todo), e 10333 e 20777 para deputado estadual (19 votos). Esses totais correspondem aos nulos técnicos do resumo oficial. Não foram inventados nomes para esses números.

## Conferência e manutenção

`conferencia.json` registra a conferência dos 323 candidatos, sem divergências entre as somas dos boletins e seus totais oficiais. `data.json` contém a base completa utilizada pelo painel e URLs das fontes oficiais. Os limites municipais são do IBGE.

Para alterar o projeto, edite os arquivos em `src` e execute `python build.py`. O script verifica os totais dos candidatos e gera novamente `index.html` com tudo incorporado. Alterar apenas src não modifica o HTML publicado até executar o script.

Desenvolvido por Jhulio Soluções. Painel independente, sem vínculo oficial com a Justiça Eleitoral.


## Atualização territorial e comparação

Veja `ALTERACOES.md` para os novos filtros, comparação entre candidatos, fontes, cobertura e instruções para atualizar o GitHub Pages.

## Bairros por município

A visualização territorial acompanha a escolha do município, inclusive quando selecionado no mapa do Acre. Rio Branco mantém bairros e dez regionais urbanas da Prefeitura. Assis Brasil, Brasiléia, Epitaciolândia, Feijó, Rodrigues Alves, Sena Madureira, Tarauacá e Xapuri usam os limites de bairros do IBGE, Censo 2022. Foram identificadas mais 502 seções em 49 bairros nesses oito municípios. A malha inclui também bairros sem locais de votação identificados.

Nos outros 11 municípios, a área informa que não há malha de bairros nesta base. Não são inferidos bairros pelo nome de escola ou endereço. A associação identifica o bairro do prédio, não a residência dos eleitores. Limites do censo podem ter mudado; o cruzamento não garante que todos os locais tenham coordenadas atualizadas. `cobertura-bairros.json` detalha a cobertura de cada município.

Fonte: https://geoftp.ibge.gov.br/organizacao_do_territorio/malhas_territoriais/malhas_de_setores_censitarios__divisoes_intramunicipais/censo_2022/bairros/shp/UF/AC_bairros_CD2022.zip

## Cruzeiro do Sul e Senador Guiomard

Bairros obtidos diretamente do cadastro oficial de locais de votação do TSE 2026, gerado em 07/10/2026. Correspondência estrita por município, zona, código do local, nome e endereço; sem divergências. Cruzeiro do Sul: 256 seções em 25 denominações urbanas e uma categoria Zona Rural. Senador Guiomard: 81 seções em 9 denominações urbanas e 7 categorias rurais. As categorias reproduzem o cadastro, não um inventário completo dos bairros atuais. Os nomes são padronizados em maiúsculas para agrupar registros equivalentes.

Não foi localizada malha oficial de polígonos utilizável desses dois municípios. A visualização mostra pontos dos prédios com coordenadas do TRE-AC, bairro declarado e votos nos filtros. Não delimita nem estima limites de bairros. Filtros, comparação e relatório PDF usam as novas identificações. O PDF explica a diferença entre pontos e polígonos.

Fonte: https://dadosabertos.tse.jus.br/dataset/eleitorado-2026/resource/300626b4-2b24-4d2e-b4fc-46b569cfffe5
Conferência: conferencia-bairros-tse.json.

## Menu lateral e fotos oficiais

A aplicação apresenta áreas separadas: Página Inicial, Senador, Governador, Deputado Estadual, Deputado Federal, Quociente eleitoral e Candidatos sub judice. O menu marca a área ativa e fica recolhido no celular. A página inicial preserva o eleitorado, comparecimento, visão geral de todos os cargos e busca de candidatos. Ao escolher um cargo, selecione o candidato para explorar filtros, bairros, mapas, gráficos e comparação. Os cálculos de vagas e situações judiciais possuem suas próprias áreas e relatórios.

Foram retirados o símbolo da marca, ícone da aba, setas de navegação decorativas e símbolos dos controles dos mapas, substituídos por texto.

As fotos dos 323 candidatos foram baixadas do TSE e associadas pelo identificador oficial sqcand no cargo e número correspondentes. Estão incorporadas ao HTML e ao data.json, sem necessidade de enviar uma pasta adicional de fotos. O candidato selecionado apresenta foto, nome, número e informações eleitorais. A foto acompanha o relatório do candidato. Sem foto disponível, a identificação continua em texto. Veja conferencia-fotos.json para URLs e conferência. O HTML ficou maior por conter todas as imagens.

Fonte e formato das fotos: https://www.tse.jus.br/eleicoes/informacoes-tecnicas-sobre-a-divulgacao-de-resultados-2024 (estrutura sqcand.jpeg da divulgação de resultados, aplicada ao ciclo ele2026/6259).
