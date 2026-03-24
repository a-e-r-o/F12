<script lang="ts">
	import { i18n } from '$lib/stores/i18n.svelte';

	type Nature = 'Hardy' | 'Docile' | 'Brave' | 'Jolly' | 'Impish' | 'Naive' | 'Timid' | 'Hasty' | 'Sassy' | 'Calm' | 'Relaxed' | 'Lonely' | 'Quirky';
	type Pts = Partial<Record<Nature, number>>;
	const NATURES: Nature[] = ['Hardy','Docile','Brave','Jolly','Impish','Naive','Timid','Hasty','Sassy','Calm','Relaxed','Lonely','Quirky'];

	interface Ans { pts: Pts; followUp?: boolean }

	const followUpAns: Ans[] = [
		{ pts: { Sassy: 1, Relaxed: 1 } },
		{ pts: { Brave: 4 } },
	];

	// Pure scoring data – text lives in i18n under pq.c{cat}q{q} / pq.c{cat}q{q}a{ans}
	const data: Ans[][][] = [
		/* #01 Hardy */ [
			[{ pts: { Hardy: 2 } }, { pts: { Relaxed: 2 } }, { pts: { Impish: 2 } }],
			[{ pts: { Hardy: 2, Docile: 1 } }, { pts: { Quirky: 2 } }],
			[{ pts: { Hardy: 2, Brave: 2 } }, { pts: { Sassy: 2, Quirky: 2 } }],
			[{ pts: { Hardy: 2 } }, { pts: { Calm: 2 } }, { pts: { Quirky: 2 } }],
		],
		/* #02 Docile */ [
			[{ pts: { Docile: 2, Naive: 1 } }, { pts: { Timid: 2, Calm: 1 } }],
			[{ pts: { Docile: 2, Hasty: 1 } }, { pts: { Naive: 2, Relaxed: 1 } }],
			[{ pts: { Docile: 2 } }, { pts: { Naive: 1, Lonely: 1 } }, { pts: { Sassy: 2 } }],
			[{ pts: { Docile: 2 } }, { pts: { Naive: 2 } }, { pts: { Impish: 2 } }],
		],
		/* #03 Brave */ [
			[{ pts: { Brave: 3, Impish: 1 } }, { pts: { Docile: 2, Timid: 1 } }],
			[{ pts: {}, followUp: true }, { pts: { Timid: 2 } }, { pts: { Relaxed: 2 } }],
			[{ pts: { Hardy: 1, Brave: 2 } }, { pts: { Naive: 2 } }],
			[{ pts: { Brave: 3 } }, { pts: { Hardy: 2, Brave: 2 } }, { pts: { Docile: 1, Timid: 1, Relaxed: 1 } }, { pts: { Timid: 2 } }],
		],
		/* #04 Jolly */ [
			[{ pts: { Jolly: 2, Naive: 1 } }, { pts: { Sassy: 1, Quirky: 1 } }],
			[{ pts: { Jolly: 2, Lonely: 1 } }, { pts: { Timid: 1 } }],
			[{ pts: { Jolly: 2 } }, { pts: { Calm: 2 } }, { pts: { Quirky: 2 } }],
			[{ pts: { Jolly: 3 } }, { pts: { Hardy: 2 } }, { pts: { Timid: 2 } }],
		],
		/* #05 Impish */ [
			[{ pts: { Impish: 2, Lonely: 1 } }, { pts: { Calm: 2 } }],
			[{ pts: { Impish: 2 } }, { pts: { Docile: 1, Relaxed: 1 } }],
			[{ pts: { Hardy: 1, Impish: 2 } }, { pts: { Sassy: 1, Quirky: 2 } }],
			[{ pts: { Brave: 3 } }, { pts: { Timid: 2 } }, { pts: { Impish: 2 } }],
		],
		/* #06 Naive */ [
			[{ pts: { Impish: 1, Naive: 3 } }, { pts: { Jolly: 2 } }, { pts: { Sassy: 2 } }],
			[{ pts: { Docile: 1, Naive: 2 } }, { pts: { Quirky: 2 } }],
			[{ pts: { Jolly: 1, Naive: 2 } }, { pts: { Calm: 2 } }],
			[{ pts: { Naive: 2 } }, { pts: { Hasty: 2 } }],
		],
		/* #07 Timid */ [
			[{ pts: { Timid: 2 } }, { pts: { Hardy: 1, Calm: 2 } }, { pts: { Brave: 2, Impish: 1, Naive: 1 } }],
			[{ pts: { Timid: 2 } }, { pts: { Hasty: 2 } }, { pts: { Jolly: 2 } }, { pts: { Sassy: 2 } }, { pts: { Lonely: 2 } }],
			[{ pts: { Timid: 2 } }, { pts: { Lonely: 2 } }, { pts: { Impish: 2, Quirky: 1 } }],
			[{ pts: { Brave: 3 } }, { pts: { Timid: 2 } }, { pts: { Sassy: 2 } }],
		],
		/* #08 Hasty */ [
			[{ pts: { Hasty: 2 } }, { pts: { Calm: 2 } }, { pts: { Timid: 2 } }],
			[{ pts: { Jolly: 2, Hasty: 1 } }, { pts: { Hardy: 1, Calm: 1 } }, { pts: { Brave: 2, Quirky: 2 } }],
			[{ pts: { Hasty: 2 } }, { pts: { Timid: 2 } }, { pts: { Sassy: 2 } }],
			[{ pts: { Docile: 1, Hasty: 2 } }, { pts: { Relaxed: 2 } }, { pts: { Hasty: 3 } }],
		],
		/* #09 Sassy */ [
			[{ pts: { Hardy: 2 } }, { pts: { Docile: 2 } }, { pts: { Sassy: 2 } }],
			[{ pts: { Impish: 1, Sassy: 2 } }, { pts: { Calm: 2 } }],
			[{ pts: { Sassy: 2 } }, { pts: { Relaxed: 2 } }],
			[{ pts: { Docile: 2, Calm: 1 } }, { pts: { Sassy: 2, Quirky: 1 } }],
		],
		/* #10 Calm */ [
			[{ pts: { Calm: 2, Lonely: 1 } }, { pts: { Hardy: 2 } }],
			[{ pts: { Calm: 2 } }, { pts: { Impish: 2 } }],
			[{ pts: { Impish: 1, Timid: 2 } }, { pts: { Calm: 2, Lonely: 1 } }],
			[{ pts: { Calm: 2, Relaxed: 1 } }, { pts: { Hardy: 1, Hasty: 2 } }],
		],
		/* #11 Relaxed */ [
			[{ pts: { Sassy: 1, Relaxed: 2 } }, { pts: { Hardy: 2, Hasty: 1 } }],
			[{ pts: { Relaxed: 2 } }, { pts: { Impish: 1, Hasty: 2 } }],
			[{ pts: { Jolly: 2 } }, { pts: { Relaxed: 2 } }, { pts: { Hasty: 2 } }],
			[{ pts: { Calm: 1, Relaxed: 2 } }, { pts: { Hardy: 2 } }],
		],
		/* #12 Lonely */ [
			[{ pts: { Timid: 1, Lonely: 2 } }, { pts: { Sassy: 2 } }],
			[{ pts: { Timid: 1, Lonely: 2 } }, { pts: { Brave: 3, Relaxed: 1 } }],
			[{ pts: { Timid: 1, Lonely: 2 } }, { pts: { Calm: 2 } }],
			[{ pts: { Jolly: 1, Lonely: 1 } }, { pts: { Calm: 1, Relaxed: 2 } }, { pts: { Timid: 1, Lonely: 3 } }],
		],
		/* #13 Quirky */ [
			[{ pts: { Quirky: 2 } }, { pts: { Hardy: 2 } }],
			[{ pts: { Hardy: 1, Hasty: 1 } }, { pts: { Quirky: 2 } }, { pts: { Sassy: 2 } }],
			[{ pts: { Hardy: 1, Brave: 3 } }, { pts: { Quirky: 2 } }, { pts: { Impish: 2 } }, { pts: { Timid: 2 } }],
			[{ pts: { Docile: 2 } }, { pts: { Sassy: 2 } }, { pts: { Quirky: 2 } }],
		],
		/* #14 Misc */ [
			[{ pts: { Hasty: 1, Quirky: 1 } }, { pts: { Jolly: 1, Lonely: 1 } }],
			[{ pts: { Jolly: 2 } }, { pts: { Sassy: 1, Quirky: 1 } }],
			[{ pts: { Naive: 1, Lonely: 1 } }, { pts: { Hasty: 1, Sassy: 1 } }],
		],
	];

	const pokemonDex: Record<string, number> = {
		Bulbasaur: 1, Charmander: 4, Squirtle: 7, Pikachu: 25,
		Meowth: 52, Psyduck: 54, Machop: 66, Cubone: 104,
		Eevee: 133, Chikorita: 152, Cyndaquil: 155, Totodile: 158,
		Treecko: 252, Torchic: 255, Mudkip: 258, Skitty: 300,
	};

	const resultMap: Record<'male' | 'female', Record<Nature, string>> = {
		male: {
			Hardy: 'Charmander', Docile: 'Bulbasaur', Brave: 'Machop',
			Jolly: 'Squirtle',   Impish: 'Pikachu',   Naive: 'Totodile',
			Timid: 'Cyndaquil',  Hasty: 'Torchic',    Sassy: 'Treecko',
			Calm: 'Mudkip',      Relaxed: 'Psyduck',  Lonely: 'Cubone',
			Quirky: 'Meowth',
		},
		female: {
			Hardy: 'Pikachu',    Docile: 'Chikorita',  Brave: 'Charmander',
			Jolly: 'Totodile',   Impish: 'Cubone',     Naive: 'Eevee',
			Timid: 'Mudkip',     Hasty: 'Skitty',      Sassy: 'Torchic',
			Calm: 'Bulbasaur',   Relaxed: 'Squirtle',  Lonely: 'Psyduck',
			Quirky: 'Treecko',
		},
	};

	let phase = $state<'intro' | 'quiz' | 'followup' | 'gender' | 'result'>('intro');
	let scores = $state<Record<Nature, number>>(initScores());
	let questionIndex = $state(0);
	let quizPicks = $state<{ ci: number; qi: number }[]>([]);
	let resultNature = $state<Nature>('Hardy');
	let resultPokemonName = $state('');
	let resultDex = $state(0);

	function initScores(): Record<Nature, number> {
		return Object.fromEntries(NATURES.map(n => [n, 0])) as Record<Nature, number>;
	}

	function shuffle<T>(arr: T[]): T[] {
		const a = [...arr];
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}

	function qKey(ci: number, qi: number): string {
		return `pokemonQuiz.c${ci + 1}q${qi + 1}`;
	}

	function aKey(ci: number, qi: number, ai: number): string {
		return `pokemonQuiz.c${ci + 1}q${qi + 1}a${ai + 1}`;
	}

	function startQuiz() {
		scores = initScores();
		const indices = shuffle(Array.from({ length: 14 }, (_, i) => i));
		const selected = indices.slice(0, 8);
		quizPicks = selected.map(ci => {
			const qi = Math.floor(Math.random() * data[ci].length);
			return { ci, qi };
		});
		questionIndex = 0;
		phase = 'quiz';
	}

	function answer(ansIdx: number) {
		const pick = quizPicks[questionIndex];
		const ans = data[pick.ci][pick.qi][ansIdx];
		for (const [nature, pts] of Object.entries(ans.pts)) {
			scores[nature as Nature] += pts!;
		}
		if (ans.followUp) {
			phase = 'followup';
			return;
		}
		advanceQuestion();
	}

	function answerFollowUp(ansIdx: number) {
		const ans = followUpAns[ansIdx];
		for (const [nature, pts] of Object.entries(ans.pts)) {
			scores[nature as Nature] += pts!;
		}
		advanceQuestion();
	}

	function advanceQuestion() {
		questionIndex++;
		if (questionIndex >= quizPicks.length) {
			phase = 'gender';
		} else {
			phase = 'quiz';
		}
	}

	function chooseGender(g: 'male' | 'female') {
		let maxNature: Nature = 'Hardy';
		let maxScore = -1;
		const shuffled = shuffle(NATURES);
		for (const n of shuffled) {
			if (scores[n] > maxScore) {
				maxScore = scores[n];
				maxNature = n;
			}
		}
		resultNature = maxNature;
		resultPokemonName = resultMap[g][maxNature];
		resultDex = pokemonDex[resultPokemonName];
		phase = 'result';
	}
</script>

<div class="quiz-container">
	{#if phase === 'intro'}
		<div class="intro">
			<div class="intro-icon">❓</div>
			<h3>{i18n.t('pokemonQuiz.title')}</h3>
			<p class="subtitle">{i18n.t('pokemonQuiz.subtitle')}</p>
			<p class="desc">{i18n.t('pokemonQuiz.desc')}</p>
			<button class="btn-start" onclick={startQuiz}>{i18n.t('pokemonQuiz.start')}</button>
		</div>

	{:else if phase === 'quiz'}
		{@const pick = quizPicks[questionIndex]}
		<div class="question-phase">
			<div class="progress-bar">
				<div class="progress-fill" style="width: {((questionIndex) / quizPicks.length) * 100}%"></div>
			</div>
			<div class="question-counter">{i18n.t('pokemonQuiz.question')} {questionIndex + 1} / {quizPicks.length}</div>
			<p class="question-text">{i18n.t(qKey(pick.ci, pick.qi))}</p>
			<div class="answers">
				{#each data[pick.ci][pick.qi] as _, ai}
					<button class="btn-answer" onclick={() => answer(ai)}>{i18n.t(aKey(pick.ci, pick.qi, ai))}</button>
				{/each}
			</div>
		</div>

	{:else if phase === 'followup'}
		<div class="question-phase">
			<div class="progress-bar">
				<div class="progress-fill" style="width: {((questionIndex) / quizPicks.length) * 100}%"></div>
			</div>
			<div class="question-counter">⚡ {i18n.t('pokemonQuiz.bonus')}</div>
			<p class="question-text">{i18n.t('pokemonQuiz.followQ')}</p>
			<div class="answers">
				{#each followUpAns as _, ai}
					<button class="btn-answer" onclick={() => answerFollowUp(ai)}>{i18n.t(`pokemonQuiz.followA${ai + 1}`)}</button>
				{/each}
			</div>
		</div>

	{:else if phase === 'gender'}
		<div class="gender-phase">
			<p class="question-text">{i18n.t('pokemonQuiz.genderQ')}</p>
			<div class="answers">
				<button class="btn-answer" onclick={() => chooseGender('male')}>🚹 {i18n.t('pokemonQuiz.boy')}</button>
				<button class="btn-answer" onclick={() => chooseGender('female')}>🚺 {i18n.t('pokemonQuiz.girl')}</button>
			</div>
		</div>

	{:else if phase === 'result'}
		<div class="result-phase">
			<div class="result-nature">
				<p class="result-label">{i18n.t('pokemonQuiz.personalityIs')}</p>
				<h3 class="nature-name">{resultNature}</h3>
				<p class="nature-desc">{i18n.t(`pokemonQuiz.n${resultNature}`)}</p>
			</div>
			<div class="result-pokemon">
				<p class="result-label">{i18n.t('pokemonQuiz.youWouldBe')}</p>
				<img
					class="pokemon-sprite"
					src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{resultDex}.png"
					alt={resultPokemonName}
				/>
				<h2 class="pokemon-name">{i18n.t(`pokemonQuiz.pokemon.${resultPokemonName}`)}</h2>
			</div>
			<button class="btn-start" onclick={startQuiz}>{i18n.t('pokemonQuiz.tryAgain')}</button>
		</div>
	{/if}
</div>

<style>
	.quiz-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 12px;
		font-size: 12px;
		min-height: 300px;
		width: 350px;
		user-select: none;
	}

	.intro {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 8px;
		padding: 16px 8px;
	}

	.intro-icon {
		font-size: 36px;
	}

	.intro h3 {
		font-size: 15px;
		font-weight: bold;
		margin: 0;
	}

	.subtitle {
		font-size: 10px;
		color: var(--color-text-secondary, #666);
		margin: 0;
		font-style: italic;
	}

	.desc {
		font-size: 12px;
		margin: 6px 0;
	}

	.btn-start {
		margin-top: 8px;
		padding: 6px 20px;
		font-size: 12px;
		font-weight: bold;
		background: var(--win95-surface, #c0c0c0);
		border: 2px solid;
		border-color: var(--win95-border-light, #fff) var(--win95-border-darkest, #000) var(--win95-border-darkest, #000) var(--win95-border-light, #fff);
		cursor: pointer;
		font-family: inherit;
	}

	.btn-start:active {
		border-color: var(--win95-border-darkest, #000) var(--win95-border-light, #fff) var(--win95-border-light, #fff) var(--win95-border-darkest, #000);
	}

	.question-phase, .gender-phase {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		gap: 10px;
	}

	.progress-bar {
		width: 100%;
		height: 14px;
		background: var(--win95-surface, #c0c0c0);
		border: 1px solid;
		border-color: var(--win95-border-darkest, #000) var(--win95-border-light, #fff) var(--win95-border-light, #fff) var(--win95-border-darkest, #000);
	}

	.progress-fill {
		height: 100%;
		background: #000080;
		transition: width 0.3s ease;
	}

	.question-counter {
		font-size: 11px;
		font-weight: bold;
		color: var(--color-text-secondary, #666);
	}

	.question-text {
		font-size: 13px;
		text-align: center;
		padding: 4px 8px;
		line-height: 1.4;
		margin: 0;
	}

	.answers {
		display: flex;
		flex-direction: column;
		gap: 6px;
		width: 100%;
		max-width: 380px;
	}

	.btn-answer {
		padding: 7px 12px;
		font-size: 12px;
		text-align: left;
		background: var(--win95-surface, #c0c0c0);
		border: 2px solid;
		border-color: var(--win95-border-light, #fff) var(--win95-border-darkest, #000) var(--win95-border-darkest, #000) var(--win95-border-light, #fff);
		cursor: pointer;
		font-family: inherit;
		line-height: 1.3;
	}

	.btn-answer:hover {
		background: #000080;
		color: #fff;
	}

	.btn-answer:active {
		border-color: var(--win95-border-darkest, #000) var(--win95-border-light, #fff) var(--win95-border-light, #fff) var(--win95-border-darkest, #000);
	}

	.result-phase {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 10px;
		padding: 8px;
	}

	.result-nature {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}

	.result-label {
		font-size: 12px;
		color: var(--color-text-secondary, #666);
		margin: 0;
	}

	.nature-name {
		font-size: 16px;
		font-weight: bold;
		color: #000080;
		margin: 0;
	}

	.nature-desc {
		font-size: 11px;
		font-style: italic;
		margin: 0;
		max-width: 320px;
		line-height: 1.4;
	}

	.result-pokemon {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		margin-top: 4px;
	}

	.pokemon-sprite {
		width: 96px;
		height: 96px;
		image-rendering: pixelated;
	}

	.pokemon-name {
		font-size: 18px;
		font-weight: bold;
		margin: 0;
	}
</style>
