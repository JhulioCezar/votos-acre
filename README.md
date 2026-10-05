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

Escolha cargo e candidato, depois município, zona e local de votação. Há filtros de presença e quantidade de votos, busca, ranking, mapa municipal, distribuição por seção e tabela com acesso ao BU original. Ao selecionar um município, a tabela exibe somente seções com votos no candidato. O mapa mostra totais por município; não representa a posição de cada eleitor ou endereço exato de cada seção.

## Exportações para Excel

Os CSVs usam UTF-8 e separador ponto e vírgula. Abra-os no Excel ou importe em Dados → De Texto/CSV.

- CSV da seleção: seções do candidato conforme filtros e regra da tabela.
- CSV dos candidatos do cargo: resumo estadual de todos os candidatos daquele cargo.
- CSV do cargo — Todas as seções: todos os 2.270 boletins, com nominais, legenda, brancos, nulos, votos anulados sub judice e números fora do resumo oficial. Esse arquivo não depende dos filtros da seleção.

Os totais nominais dos candidatos incluem a votação registrada nos boletins mesmo quando a destinação é anulada sub judice. Essa destinação aparece junto ao nome. A visão geral apresenta separadamente as categorias oficiais, evitando confundir votos registrados com votos válidos. Para senador, cada eleitor podia registrar dois votos.

Foram preservados cinco números presentes nos BUs e ausentes do resumo de candidatos: 4000, 4022 e 4033 para deputado federal (45 votos ao todo), e 10333 e 20777 para deputado estadual (19 votos). Esses totais correspondem aos nulos técnicos do resumo oficial. Não foram inventados nomes para esses números.

## Conferência e manutenção

`conferencia.json` registra a conferência dos 323 candidatos, sem divergências entre as somas dos boletins e seus totais oficiais. `data.json` contém a base completa utilizada pelo painel e URLs das fontes oficiais. Os limites municipais são do IBGE.

Para alterar o projeto, edite os arquivos em `src` e execute `python build.py`. O script verifica os totais dos candidatos e gera novamente `index.html` com tudo incorporado. Alterar apenas src não modifica o HTML publicado até executar o script.

Desenvolvido por Jhulio Soluções. Painel independente, sem vínculo oficial com a Justiça Eleitoral.
