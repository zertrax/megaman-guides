const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),base='https://zertrax.github.io/megaman-guides/';
const publisherProfile='https://steamcommunity.com/id/Catophi/';
const icons=require('../src/guide-icons.json'),ui=require('../src/locales/ui.json');
const {locales,names}=require('../src/localization.cjs');
const collections=[
 ['363440',['mm1','mm2','mm3','mm4','mm5','mm6']],
 ['495050',['mm7','mm8','mm9','mm10']],
 ['742300',['mm11']],
 ['743890',['x1','x2','x3','x4','x4-zero']],
 ['743900',['x5','x6','x7','x8']],
 ['999020',['zero1','zero2','zero3','zero4','zx','zx-advent']],
 ['1798010',['bn1','bn2','bn3-blue','bn3-white']],
 ['1798020',['bn4-blue-moon','bn4-red-sun','bn5-team-protoman','bn5-team-colonel','bn6-cybeast-gregar','bn6-cybeast-falzar']]
];
const copy={
 en:{suffix:'Field guides',intro:'Open a game below for its route, upgrades and important warnings. The full guides are on the linked website.',games:'Choose a game',website:'Using the website',features:'Enlarge images inside a guide, check off cleared stages and finished games, and return to your last reading section. Progress stays in that browser; it does not sync with Steam Cloud.',library:'Open the full guide library',credit:'Independent fan guides. Mega Man and its artwork belong to Capcom. Image credits and references are listed at the bottom of each guide.'},
 'es-MX':{suffix:'Guías',intro:'Elige un juego para consultar su ruta, mejoras y advertencias importantes. Las guías completas están en el sitio enlazado.',games:'Elige un juego',website:'Cómo usar el sitio',features:'Puedes ampliar las imágenes, marcar las etapas y juegos completados, y volver a la sección donde dejaste la lectura. El progreso se guarda en ese navegador; no se sincroniza con Steam Cloud.',library:'Abrir la biblioteca de guías',credit:'Guías independientes hechas por fans. Mega Man y sus ilustraciones pertenecen a Capcom. Los créditos de las imágenes y las fuentes están al final de cada guía.'},
 'pt-BR':{suffix:'Guias',intro:'Escolha um jogo abaixo para consultar a rota, as melhorias e os avisos importantes. Os guias completos estão no site indicado nos links.',games:'Escolha um jogo',website:'Como usar o site',features:'Amplie as imagens, marque as fases e os jogos concluídos e volte à seção em que parou de ler. O progresso fica salvo nesse navegador; não é sincronizado com o Steam Cloud.',library:'Abrir a biblioteca de guias',credit:'Guias independentes feitos por fãs. Mega Man e suas ilustrações pertencem à Capcom. Os créditos das imagens e as fontes estão no fim de cada guia.'},
 ja:{suffix:'攻略ガイド',intro:'下のゲーム名から、攻略手順、強化アイテム、見落としやすい注意点を確認できます。詳しいガイドはリンク先のウェブサイトにあります。',games:'ゲームを選ぶ',website:'ウェブサイトの使い方',features:'ガイド内で画像を拡大したり、クリアしたステージやゲームに印を付けたりできます。再び開くと、前回読んでいた項目に戻れます。進捗はそのブラウザーに保存され、Steam Cloudとは同期されません。',library:'すべてのガイドを開く',credit:'ファンが制作した非公式ガイドです。Mega Manとそのアートワークの権利はCapcomに帰属します。画像のクレジットと参考資料は各ガイドの末尾に掲載しています。'},
 'zh-Hans':{suffix:'攻略指南',intro:'选择下方的游戏，即可查看攻略路线、强化道具和重要提醒。完整指南位于链接指向的网站。',games:'选择游戏',website:'网站使用说明',features:'你可以在指南中放大图片，标记已完成的关卡和游戏，再次打开时回到上次阅读的章节。进度保存在该浏览器中，不会与Steam Cloud同步。',library:'打开全部指南',credit:'本站是粉丝制作的非官方指南。Mega Man及其美术素材归Capcom所有。图片署名和参考资料列在各篇指南的末尾。'},
 fr:{suffix:'Guides',intro:'Choisissez un jeu ci-dessous pour consulter son parcours, ses améliorations et les avertissements importants. Les guides complets se trouvent sur le site indiqué par les liens.',games:'Choisir un jeu',website:'Utiliser le site',features:'Agrandissez les images, cochez les niveaux et les jeux terminés, puis retrouvez la section où vous aviez arrêté votre lecture. La progression reste dans ce navigateur ; elle ne se synchronise pas avec Steam Cloud.',library:'Ouvrir tous les guides',credit:'Guides indépendants réalisés par des fans. Mega Man et ses illustrations appartiennent à Capcom. Les crédits des images et les références figurent au bas de chaque guide.'},
 de:{suffix:'Spielhilfen',intro:'Wähle unten ein Spiel aus, um die Route, Verbesserungen und wichtige Hinweise nachzulesen. Die vollständigen Spielhilfen findest du auf der verlinkten Website.',games:'Spiel auswählen',website:'Die Website nutzen',features:'Vergrößere Bilder, hake abgeschlossene Level und Spiele ab und kehre zum zuletzt gelesenen Abschnitt zurück. Dein Fortschritt wird in diesem Browser gespeichert und nicht mit Steam Cloud synchronisiert.',library:'Alle Spielhilfen öffnen',credit:'Unabhängige Spielhilfen von Fans. Mega Man und die zugehörigen Bilder gehören Capcom. Bildnachweise und Quellen stehen am Ende jeder Spielhilfe.'},
 ru:{suffix:'Руководства',intro:'Выберите игру ниже, чтобы узнать маршрут прохождения, расположение улучшений и важные условия. Полные руководства находятся на сайте по ссылкам.',games:'Выберите игру',website:'Как пользоваться сайтом',features:'В руководстве можно увеличивать изображения, отмечать пройденные этапы и игры и возвращаться к разделу, на котором вы остановились. Прогресс сохраняется в этом браузере и не синхронизируется со Steam Cloud.',library:'Открыть все руководства',credit:'Независимые руководства, созданные поклонниками серии. Mega Man и иллюстрации принадлежат Capcom. Авторы изображений и источники указаны в конце каждого руководства.'}
};
const games=new Map();
for(const folder of ['games','campaigns'])for(const file of fs.readdirSync(path.join(root,'src',folder)).filter(f=>f.endsWith('.json'))){const game=JSON.parse(fs.readFileSync(path.join(root,'src',folder,file),'utf8'));games.set(game.id,game);}
assert.deepEqual([...collections.flatMap(([,ids])=>ids)].sort(),[...games.keys()].sort(),'Every campaign must belong to exactly one Steam collection.');
const output=path.join(root,'steam'),drafts=[];
for(const locale of locales){
 const directory=path.join(output,locale);fs.mkdirSync(directory,{recursive:true});
 const text=copy[locale],catalog=ui.locales||ui;
 const link=id=>base+(locale==='en'?'':locale+'/')+(id==='x4-zero'?'x4/zero.html':id+'/')+(locale==='en'?'?lang=en':'');
 for(const [appid,ids] of collections){
  const release=icons.releases[appid];assert.ok(release,'Unknown Steam application');
  const body=text.intro+'\n\n[h1]'+text.games+'[/h1]\n[list]\n'+ids.map(id=>'[*][url='+link(id)+']'+games.get(id).title+'[/url]').join('\n')+'\n[/list]\n\n[h1]'+text.website+'[/h1]\n'+text.features+'\n\n[url='+base+(locale==='en'?'?lang=en':locale+'/')+']'+text.library+'[/url]\n\n[hr][/hr]\n'+text.credit+(locale==='en'?'':'\n\n'+catalog[locale].translationNote+'\n'+catalog[locale].translationCredit)+'\n';
  const relative=locale+'/'+appid+'.txt';fs.writeFileSync(path.join(output,relative),body);
  drafts.push({appid,collection:release.name,locale,language:names[locale],title:release.name+' · '+text.suffix,description:text.intro,body:relative,games:ids,hub:'https://steamcommunity.com/app/'+appid+'/guides/',originalIcon:release.src,iconSource:release.source,store:release.store});
 }
}
fs.writeFileSync(path.join(output,'drafts.json'),JSON.stringify({status:'LOCAL DRAFTS — NOT UPLOADED OR PUBLISHED TO STEAM',publisherProfile,website:base,note:'One collection hub per language. Uses Steam BBCode, not website HTML. Account login, collection ownership, an upload-compatible original thumbnail, actual editor language/category choices and a pilot preview remain to be checked. Keep returned Steam guide IDs to update existing guides rather than create duplicates.',drafts},null,2)+'\n');
console.log('Prepared '+drafts.length+' local Steam drafts: '+collections.length+' application hubs × '+locales.length+' languages; all '+games.size+' campaign links included. No Steam account accessed.');
