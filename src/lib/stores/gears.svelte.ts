// Shared reactive state for the epicycloidal gear system
// Used by GearsSvg (writes) and GaugeCanvas (reads)

const Zs = 30;
const Zr = 78;
const ratioSunRing = Zs / Zr;

// Slider ranges
export const sunMin = -6.5, sunMax = 6.5;
export const carrierMin = 0, carrierMax = 6;

// RPM multiplier: slider value × RPM_FACTOR = RPM
export const RPM_FACTOR = 1000;

// Reference for 200 km/h: ICE=6000 RPM (carrier=6), MG1 at -80% (sun=-5.2)
const refRing = 6 * (1 + ratioSunRing) - (-5.2) * ratioSunRing;
export const MAX_SPEED_KMH = 200;
export const RING_SPEED_AT_MAX = refRing; // ≈ 10.308

let _sunSpeed = $state(0);
let _carrierSpeed = $state(1);

export const gears = {
	get sunSpeed() { return _sunSpeed; },
	set sunSpeed(v: number) { _sunSpeed = v; },

	get carrierSpeed() { return _carrierSpeed; },
	set carrierSpeed(v: number) { _carrierSpeed = v; },

	get ringSpeed() { return _carrierSpeed * (1 + ratioSunRing) - _sunSpeed * ratioSunRing; },

	get iceRpm() { return _carrierSpeed * RPM_FACTOR; },
	get mg1Rpm() { return _sunSpeed * RPM_FACTOR; },
	get mg2Rpm() { return this.ringSpeed * RPM_FACTOR; },

	get speedKmh() {
		const raw = (this.ringSpeed / RING_SPEED_AT_MAX) * MAX_SPEED_KMH;
		return Math.max(0, Math.round(raw));
	}
};
