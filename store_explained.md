# Partage d'État et Logique Métier en Svelte 5

## Les Options Disponibles

| Approche | Quand l'utiliser |
|----------|-----------------|
| **Svelte Store** (`writable`) | Svelte 3/4, simple, universel |
| **Rune `$state` dans un module** | Svelte 5, approche moderne recommandée |
| **Class-based Store** | Logique métier complexe, proche d'un Service Angular |

---

## 1️⃣ Svelte Stores — Approche Classique (Svelte 3/4/5)

```typescript
// src/lib/stores/counter.store.ts
import { writable, derived } from 'svelte/store';

function createCounterStore() {
	const { subscribe, set, update } = writable(0);

	return {
		subscribe,
		increment: () => update(n => n + 1),
		decrement: () => update(n => n - 1),
		reset: () => set(0)
	};
}

export const counterStore = createCounterStore();
// Store dérivé (calculé depuis un autre store)
export const doubled = derived(counterStore, $count => $count * 2);
```

**Utilisation dans n'importe quel composant :**
```svelte
<script lang="ts">
	import { counterStore, doubled } from '$lib/stores/counter.store';
</script>

<!-- Le $ devant souscrit automatiquement -->
<p>Compte : {$counterStore}</p>
<p>Doublon : {$doubled}</p>
<button onclick={() => counterStore.increment()}>+1</button>
```

---

## 2️⃣ Runes dans un Module — Approche Svelte 5 ⭐

```typescript
// src/lib/stores/counter.svelte.ts  ← extension .svelte.ts obligatoire !
let count = $state(0);

export function useCounter() {
	return {
		get count() { return count; },          // getter réactif
		increment: () => count++,
		decrement: () => count--,
		reset: () => (count = 0)
	};
}
```

**Utilisation :**
```svelte
<script lang="ts">
	import { useCounter } from '$lib/stores/counter.svelte';

	const counter = useCounter();
</script>

<p>Compte : {counter.count}</p>
<button onclick={counter.increment}>+1</button>
```

> ⚠️ L'extension `.svelte.ts` est **obligatoire** pour que les runes soient compilées dans un fichier `.ts` externe.

---

## 3️⃣ Class-based Store — Le plus proche d'un Service Angular ⭐⭐

```typescript
// src/lib/services/user.service.svelte.ts
class UserService {
	// État privé réactif
	#users = $state<User[]>([]);
	#loading = $state(false);
	#error = $state<string | null>(null);

	// Getters publics (lecture seule depuis l'extérieur)
	get users() { return this.#users; }
	get loading() { return this.#loading; }
	get error() { return this.#error; }

	// Dérivé réactif
	get activeUsers() {
		return this.#users.filter(u => u.active);
	}

	// Logique métier
	async fetchUsers() {
		this.#loading = true;
		this.#error = null;
		try {
			const res = await fetch('/api/users');
			this.#users = await res.json();
		} catch (e) {
			this.#error = 'Erreur lors du chargement';
		} finally {
			this.#loading = false;
		}
	}

	addUser(user: User) {
		this.#users.push(user);
	}

	removeUser(id: number) {
		this.#users = this.#users.filter(u => u.id !== id);
	}
}

// Singleton partagé — une seule instance pour toute l'app
export const userService = new UserService();
```

**Utilisation dans n'importe quel composant :**
```svelte
<script lang="ts">
	import { userService } from '$lib/services/user.service.svelte';

	$effect(() => {
		userService.fetchUsers();
	});
</script>

{#if userService.loading}
	<p>Chargement...</p>
{:else if userService.error}
	<p class="error">{userService.error}</p>
{:else}
	{#each userService.users as user}
		<div>{user.name}</div>
	{/each}
{/if}
```

---

## Structure Recommandée pour Votre Projet

```
src/lib/
  services/
    user.service.svelte.ts    ← logique métier + fetch API
    auth.service.svelte.ts
  stores/
    ui.store.svelte.ts        ← état UI (theme, modal, sidebar)
    cart.store.svelte.ts      ← état applicatif partagé
  types/
    user.ts
    product.ts
```

---

## Résumé — Que Choisir ?

| | Svelte Store | Module Rune | Class Service |
|---|---|---|---|
| Svelte 5 | ✅ | ✅ | ✅ |
| Logique métier complexe | ⚠️ Verbeux | ⚠️ Limité | ✅ Idéal |
| API fetch / async | ✅ | ✅ | ✅ |
| Proche d'Angular | ❌ | ⚠️ | ✅ |
| Encapsulation | ❌ | ⚠️ | ✅ (`#private`) |

**Recommandation** : Utilisez l'approche **Class-based** (option 3) — c'est la plus proche d'un Service Angular, elle centralise la logique, encapsule l'état avec des champs privés, et s'importe comme un singleton dans n'importe quel composant.
