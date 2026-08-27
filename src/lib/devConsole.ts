/**
 * F12 est la touche qui ouvre les devtools — alors évidemment, la console
 * devait dire quelque chose la première fois qu'on l'ouvre ici. Un seul
 * appel, au montage du layout : rien à nettoyer, rien à refaire au focus.
 */
const ART = String.raw`
   ┌─────────┐
   │   F12   │  ← t'as appuyé sur la bonne touche
   └─────────┘
`;

export function greetConsole(): void {
	console.log('%c' + ART, 'color: #D3001F; font-weight: bold;');
	console.log(
		'%cbienvenue sur le bureau.%c fais comme chez toi, mais touche à rien.',
		'color: #D3001F; font-weight: bold;',
		'color: inherit; font-weight: normal;'
	);
}
