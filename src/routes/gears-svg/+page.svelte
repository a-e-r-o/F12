<script lang="ts">
	import { GearsSvg } from '$lib/components';
</script>


<div class="main-content">
	<h2>Train Épicycloïdal — SVG</h2>

	<GearsSvg />

	<div class="hint">
		<p>
			<span class="highlight sun">MG1</span> = Petit moteur électrique, moins puissant que MG2. Il permet de faire varier le rapport de transmission entre <span class="highlight planet">ICE</span> et <span class="highlight ring">MG2</span> en faisant tourner <span class="highlight sun">l'engrenage central</span> dans un sens pour avoir un rôle de réducteur ou dans l'autre pour avoir un rôle de démultiplicateur.
			Il peut servir de générateur dans les phases de décélération. Il sert aussi de moteur pour démarrer le moteur thermique.
		</p>
		<br>
		<p>
			<span class="highlight planet">ICE</span> = Moteur thermique. À basse vitesse : quand la batterie est pleine il est à l'arrêt, quand la batterie est vide il propulse tout seul la voiture et génère de l'électricité pour recharger la batterie.
			À haute vitesse : il est assisté par <span class="highlight ring">MG2</span> pour propulser la voiture.
			<br>
			<span class="note"> Ce qui importe est la vitesse de rotation de <span class="highlight planet">l'ensemble</span> autour de <span class="highlight sun">l'engrenage central</span> et non pas la vitesse de rotation individuelle de chaque engrenage.</span>
		</p>
		<br>
		<p>
			<span class="highlight ring">MG2</span> = Second moteur électrique, plus puissant que <span class="highlight sun">MG1</span>. Il est connecté aux roues via une chaîne de transmission et un différentiel. A basse vitesse, il propulse tout seul la voiture, à haute vitesse il est assisté par <span class="highlight planet">ICE</span>. Durant les phases de décélération il peut faire du freinage régénératif pour recharger la batterie.
		</p>
	</div>
</div>


<style>
	.main-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		max-width: 1000px;
		margin-left: auto;
		margin-right: auto;
		padding: 2rem;
	}

	h2 {
		color: var(--color-text);
		font-size: 1.4rem;
	}

	.hint {
		margin-top: 2rem;
		font-size: 1.1rem;
		line-height: 1.6;
	}

	.highlight {
		font-weight: bold;

		&.sun {
			color: var(--gear-sun);
		}
	
		&.planet {
			color: var(--gear-planet);
		}
	
		&.ring {
			color: var(--gear-ring);
		}
	}
	.note {
		font-size: 0.9rem;
		color: var(--color-text-secondary);
	}


</style>