<script lang="ts">
	let count = $state(0);
</script>

<div class="container">
	<h1>Welcome to SvelteKit</h1>

	<button onclick={() => count++}>Clique-moi !</button>
	<p>Nombre de clics : <strong>{count}</strong></p>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		gap: 1rem;
	}

	button {
		padding: 0.75rem 2rem;
		font-size: 1.1rem;
		border: none;
		border-radius: 8px;
		background-color: var(--color-primary);
		color: white;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	button:hover {
		background-color: var(--color-primary-hover);
	}

	p {
		font-size: 1.2rem;
	}
</style>
