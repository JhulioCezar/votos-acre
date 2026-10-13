# Votos Acre — prestação de contas, versão de cobertura parcial

Coleta de prestação de contas: 13/10/2026. A fotografia eleitoral permanece em 05/10/2026, conforme o painel original. Não há atualização automática. O domínio e a aplicação dedicada a Antônio Pedro não foram alterados.

## Como publicar

1. Faça uma cópia do repositório atual antes de substituir arquivos.
2. Extraia o ZIP. Para atualizar somente o site publicado, substitua `index.html` na raiz do repositório `votos-acre` e confirme o commit. O HTML contém os dados e o código, sem depender de uma consulta a APIs financeiras no navegador.
3. Para manter o projeto reproduzível, envie também `src/`, `build.py`, `prestacao-contas.json`, `conferencia-prestacao-contas.json` e este documento. Os demais arquivos do pacote preservam a base anterior. Mantenha `CNAME` e `.nojekyll`.
4. Aguarde a execução de Pages e abra o menu **Prestação de contas**. O endereço direto termina em `#pagina=prestacao`.

O arquivo index.html tem aproximadamente 14 MB, abaixo do limite de 25 MB por arquivo do upload pelo navegador. Não envie o ZIP como substituto do index: é necessário extrair os arquivos.

## O que foi integrado

- Filtros por instituição, situação institucional/eleitoral, nome, pessoa e ano financeiro.
- Visão conjunta de cotas e folha bruta identificadas, com total explicitamente parcial. Valores sem cobertura são “não apurado”.
- Cotas da Câmara nos arquivos 2008–2026, para os 91 cadastros históricos recuperados do Acre; registros encontrados para parte deles. CEAPS do Senado 2010–2026, consultando cadastros históricos pela UF dos mandatos.
- Folha de governador/vice-governador: consulta mensal 2002–outubro de 2026 para os nomes identificados Jorge Viana, Tião Viana, Binho Marques, Gladson Cameli e Mailza Assis. Competências ausentes não são zero. Agosto–outubro de 2026 não têm registros localizados na coleta. Não é uma coleta de todos os ocupantes de vice-governador.
- Trajetórias Câmara/ALEAC/Senado e vínculos de governador/vice registrados na folha. A data de admissão da folha não comprova mandato completo; eventos de histórico não comprovam exercício contínuo. Licenças e afastamentos exigem leitura da fonte.
- Situação de candidaturas da fotografia do TSE; mandatos legislativos futuros identificados como previstos. Segundo turno não é tratado como eleição concluída.
- Autoria/coautoria de projetos e propostas da Câmara, Senado e ALEAC. Tramitações e registros de votação estaduais têm sua cobertura informada. O serviço de autoria do Senado é legado e pode ter lacunas.
- Comparação da folha bruta identificada com renda mensal inteiramente poupada; cenário separado de subsídio federal/estadual constante, por mês e de 1 a 4 anos, ou 8 anos para senador. Valores nominais, sem correção de inflação; a renda de referência é o mínimo de 2026, R$ 1.621.
- Impressão/PDF inclui todas as páginas das tabelas da seleção e expande os detalhes. Pode ser extenso: filtre uma pessoa e/ou ano antes de imprimir.

## Limites de cobertura — não chamar de custo completo

Folhas individuais dos legisladores, gastos efetivos e encargos das equipes de gabinete, discriminação das rubricas e benefícios, despesas operacionais do Executivo e ALEAC, deliberações federais, conversão em lei, resultados do Executivo e histórico de todas as vice-governadorias ainda não estão apurados. O módulo pode ser publicado como **consulta de dados com cobertura parcial**, mas não como prestação de contas financeira completa ou ranking de eficiência.

Subsídio legal e limite de gabinete não são remuneração individual comprovadamente paga. Bruto e líquido não são somados. A folha bruta pode incluir acertos e extras. Restituições de cotas são apresentadas separadamente, sem desconto automático que possa duplicar abatimentos. Créditos negativos da fonte são preservados.

União de cadastros: nome civil completo normalizado apenas para acentos, caixa e espaços. Mailza Assis da Silva / Mailza Assis Cameli é uma exceção documentada pela trajetória oficial do Governo e registros do Senado. Grafias divergentes ou nomes abreviados não são fundidos automaticamente: pode haver perfis separados da mesma pessoa. O número de perfis não deve ser tratado como contagem definitiva de políticos distintos. Coautorias são contadas individualmente; não somar esses números como quantidade única de projetos.

Um registro inexistente de votação não demonstra que uma matéria nunca foi deliberada. “Dias sem andamento registrado” não demonstra atraso irregular. Contagens não autorizam conclusão sobre retorno dos impostos ou mérito da atuação.

## Atualização e conferência

`prestacao-contas.json` é a base incorporada no build. Rode `python build.py` para regenerar o index. O build também reconcilia os 323 candidatos e 2.270 seções da base eleitoral. A coleta não é executada pelo build.

`conferencia-prestacao-contas.json` registra a validação de identidades, valores em centavos, somas mensais/anuais, bruto menos descontos igual ao líquido, tamanho do HTML e preservação do arquivo original. Os arquivos brutos de coleta e identificadores pessoais de terceiros não estão no pacote publicado.

Principais fontes: Câmara (Dados Abertos e CEAP); Senado (Dados Abertos legislativos e CEAPS); SAPL/ALEAC; Portal de Transparência do Acre; TSE. Cada linha apresenta seu link institucional. Os dados são uma fotografia, sem sincronização posterior ao upload.
