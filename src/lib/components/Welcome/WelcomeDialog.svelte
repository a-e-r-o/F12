<script lang="ts">
	import { onDestroy } from 'svelte';
	import { themeState, type ThemeId } from '$lib/stores/theme.svelte';
	import { i18n } from '$lib/stores/i18n.svelte';
	import { windowsState } from '$lib/stores/windows.svelte';
	import { markFirstRunDone } from '$lib/stores/firstRun';

	// Selecting a theme applies it straight away — a theme picker with no preview is useless.
	// "Validate" then confirms the choice and retires the dialog for good.
	let selected = $derived(themeState.current);

	function choose(theme: ThemeId) {
		themeState.set(theme);
	}

	function confirm() {
		markFirstRunDone();
		windowsState.close('welcome');
	}

	// Dismissing with the X counts as accepting whatever is currently previewed:
	// the dialog is a one-time greeting, not a nag.
	onDestroy(markFirstRunDone);
</script>

<div class="welcome">
	<p class="intro">{i18n.t('welcome.intro')}</p>

	<div class="choices">
		<button
			class="choice"
			class:selected={selected === 'win95'}
			onclick={() => choose('win95')}
			aria-pressed={selected === 'win95'}
		>
			<span class="preview preview-retro" aria-hidden="true">
				<span class="preview-titlebar"></span>
				<span class="preview-body"></span>
				<span class="preview-taskbar"></span>
			</span>
			<span class="choice-name">{i18n.t('personalization.retro')}</span>
			<span class="choice-sub">Windows 95</span>
		</button>

		<button
			class="choice"
			class:selected={selected === 'win7aero'}
			onclick={() => choose('win7aero')}
			aria-pressed={selected === 'win7aero'}
		>
			<span class="preview preview-aero" aria-hidden="true">
				<span class="preview-titlebar"></span>
				<span class="preview-body"></span>
				<span class="preview-taskbar"></span>
			</span>
			<span class="choice-name">{i18n.t('personalization.aero')}</span>
			<span class="choice-sub">Windows 7</span>
		</button>
	</div>

	<p class="hint">
		{i18n.t('welcome.hint')}
		<strong class="path">{i18n.t('welcome.path')}</strong>
	</p>

	<div class="actions">
		<button class="win95-btn confirm-btn" onclick={confirm}>{i18n.t('welcome.confirm')}</button>
	</div>
</div>

<style>
	.welcome {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 12px;
		max-width: 420px;

		.intro {
			font-size: 12px;
			line-height: 1.5;
		}

		.choices {
			display: flex;
			gap: 10px;
		}

		.choice {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 4px;
			padding: 8px;
			cursor: pointer;
			font-family: inherit;
			color: var(--color-text);
			background: var(--win-btn-face);
			border: 2px solid;
			border-color: var(--win-border-light) var(--win-border-darkest) var(--win-border-darkest) var(--win-border-light);
			box-shadow: inset 1px 1px 0 var(--win-border-mid), inset -1px -1px 0 var(--win-border-dark);

			&.selected {
				border-color: var(--win-border-darkest) var(--win-border-light) var(--win-border-light) var(--win-border-darkest);
				box-shadow: inset 1px 1px 0 var(--win-border-dark), inset -1px -1px 0 var(--win-border-mid);
			}

			.choice-name {
				font-size: 12px;
				font-weight: bold;
			}

			.choice-sub {
				font-size: 10px;
				color: var(--color-text-secondary);
			}
		}

		/* Miniature of each desktop, drawn in CSS — no assets needed */
		.preview {
			display: flex;
			flex-direction: column;
			width: 100%;
			height: 62px;
			overflow: hidden;

			.preview-titlebar {
				height: 9px;
			}

			.preview-body {
				flex: 1;
			}

			.preview-taskbar {
				height: 10px;
			}
		}

		.preview-retro {
			background: #008080;
			border: 1px solid #000;

			.preview-titlebar {
				background: linear-gradient(90deg, #000080, #1084d0);
				margin: 8px 10px 0;
			}

			.preview-body {
				background: #c0c0c0;
				margin: 0 10px;
				border: 1px solid #000;
				border-top: 0;
			}

			.preview-taskbar {
				background: #c0c0c0;
				border-top: 1px solid #fff;
			}
		}

		.preview-aero {
			background: linear-gradient(160deg, #2b6cb0, #63b3ed 60%, #90cdf4);
			border: 1px solid #1a365d;

			.preview-titlebar {
				background: rgba(255, 255, 255, 0.45);
				margin: 8px 10px 0;
				border-radius: 3px 3px 0 0;
			}

			.preview-body {
				background: rgba(255, 255, 255, 0.9);
				margin: 0 10px;
			}

			.preview-taskbar {
				background: rgba(16, 36, 76, 0.72);
				border-top: 1px solid rgba(255, 255, 255, 0.5);
			}
		}

		.hint {
			font-size: 11px;
			line-height: 1.5;
			color: var(--color-text-secondary);

			.path {
				display: block;
				margin-top: 2px;
				color: var(--color-text);
			}
		}

		.actions {
			display: flex;
			justify-content: flex-end;
		}

		.confirm-btn {
			min-width: 90px;
		}
	}

	/* ============== WIN7 AERO OVERRIDES ================== */
	:global([data-theme="win7aero"]) .welcome {
		.choice {
			border: 1px solid #d5d5d5;
			border-radius: 4px;
			background: #fff;
			box-shadow: none;

			&:hover {
				border-color: #7da2ce;
				background: linear-gradient(#ddecfd, #c2dcfd);
				box-shadow: inset 0 0 0 1px #fff;
			}

			&.selected {
				border-color: #3c7fb1;
				background: linear-gradient(#eaf6fd, #bee6fd);
				box-shadow: inset 0 0 0 1px #fff, 0 0 4px 1px rgba(60, 127, 177, 0.4);
			}
		}
	}
</style>
