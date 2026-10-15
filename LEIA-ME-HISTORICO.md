# Votos Acre — ficha com histórico eleitoral

Interface e nova coleta histórica: 15/10/2026.

## Atualizar o site
1. Extraia votos-acre-historico-eleitoral.zip.
2. Substitua index.html na raiz do GitHub e envie a pasta historico inteira na mesma raiz.
3. Preserve seu CNAME e as demais configurações de domínio e Pages.
4. Aguarde a publicação e recarregue sem cache.

Não basta enviar somente index.html nesta versão: os arquivos historico/secoes-AAAA.json
são carregados ao consultar as seções de eleições anteriores. Não envie o ZIP fechado ao
repositório. Para testar localmente, use um servidor HTTP; abrir HTML por file:// pode
bloquear a leitura desses arquivos no navegador.

## Consulta na mesma ficha
Ao escolher uma pessoa, a visão geral apresenta sua trajetória vinculada pelo TSE.
Eleições e mapas reúne cargo, partido, votos nominais, posição por votação, situação
publicada, evolução da votação, comparecimento do Acre, mapa municipal e seções com votos.
Há seleção de disputa (ano, cargo e turno) ou todos os anos. Primeiro e segundo turnos
ficam separados. Selecionar uma disputa também ajusta o ano financeiro consultado.
Remuneração, projetos, emendas, campanhas e patrimônio permanecem nas abas da mesma ficha.
Detalhes de bairros, locais e relatórios da base atual de 2026 continuam acessíveis.

## Cobertura e limites
923 registros vinculados, incluindo 323 candidaturas atuais, com histórico do Acre
desde 2004. Há 554 disputas históricas com seções localizadas, totalizando 314.511 linhas.
Perfis sem vínculo eleitoral oficial continuam com a trajetória institucional disponível.
Ausência de resultado localizado não é voto zero. Vices e suplentes podem não ter votação
nominal individualizada. Não se associa uma pessoa apenas pela coincidência do número.
Posição é calculada no mesmo cargo/circunscrição/eleição/turno, com empates; não determina
cadeiras. Mapas históricos usam a malha municipal atual; nomes de locais atuais não são
atribuídos a seções antigas. O acumulado de votos entre eleições não é eleitorado único.
Segundo turno municipal cobre apenas municípios participantes. Para senador com duas
escolhas, votos registrados e eleitores presentes são grandezas distintas.
Válidos históricos somam componentes nominais e de legenda; nulos incluem técnicos.
Diferenças cadastrais existentes nas bases de 2012 e 2016 são explicadas sem inventar causa.

Resultados atuais de 2026 preservam a coleta de 05/10/2026. Fontes financeiras anteriores
mantêm suas datas, e o histórico eleitoral de 2004 a 2024 foi coletado em 15/10/2026.
Não há sincronização automática com os portais oficiais. Estimativas não comprovam
pagamento e ausência de informação não significa zero. Cada consulta oferece suas fontes.

O pacote completo inclui src, build.py e as bases públicas sanitizadas para manutenção.
Não inclui os ZIPs de pesquisa com documentos pessoais ou os dados privados do workspace.
