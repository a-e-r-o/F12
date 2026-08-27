/** Liters in one US gallon */
export const LITERS_PER_GALLON = 3.785411784;

/**
 * Conversion factor: 100 miles in km × liters per gallon
 * mpg → L/100km:  FACTOR / mpg
 * L/100km → mpg:  FACTOR / lper100
 */
export const MPG_FACTOR = 235.214583;

export function mpgToLper100(mpg: number): number {
	return Math.round((MPG_FACTOR / mpg) * 100) / 100;
}

export function lper100ToMpg(lper100: number): number {
	return Math.round((MPG_FACTOR / lper100) * 100) / 100;
}

/** €/L → $/gal using EUR→USD rate */
export function eurLiterToUsdGallon(eurPerLiter: number, eurToUsd: number): number {
	return Math.round(eurPerLiter * LITERS_PER_GALLON * eurToUsd * 100) / 100;
}

/** $/gal → €/L using EUR→USD rate */
export function usdGallonToEurLiter(usdPerGallon: number, eurToUsd: number): number {
	return Math.round((usdPerGallon / (LITERS_PER_GALLON * eurToUsd)) * 100) / 100;
}

/** km → miles */
export function kmToMiles(km: number): number {
	return Math.round(km * 0.621371 * 10) / 10;
}

/** miles → km */
export function milesToKm(miles: number): number {
	return Math.round(miles / 0.621371 * 10) / 10;
}
