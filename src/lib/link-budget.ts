/**
 * Link budget model: RF path loss, received power, and SNR between two radios.
 *
 * Ported to TypeScript from the Link-Budget-GUI project by SpecterStrider
 * (https://github.com/SpecterStrider/Link-Budget-GUI), which is a Python/NiceGUI
 * app. Licensed Apache-2.0; see the attribution note on /tools/link-budget/.
 *
 * The original needs a Python server to run. This site is static (GitHub Pages),
 * so the math lives here and runs in the browser instead. The formulas and the
 * ITU coefficient tables are unchanged from the original, with one deliberate
 * fix noted on `thermalNoiseFloor` below.
 *
 * Underlying references: Friis transmission equation, ITU-R P.676-13
 * (atmospheric gases), ITU-R P.840-9 (cloud/fog), ITU-R P.838-3 + P.530-17
 * (rain), Johnson-Nyquist thermal noise.
 *
 * Valid for roughly 1-1000 GHz (cloud model only to 200 GHz). Below 1 GHz the
 * free-space term is still exact; the ITU gas/rain terms are extrapolation.
 */

/* ITU-R P.676-13 Table 1: oxygen spectroscopic data (a_4 is all zeros, omitted) */
const O_f0 = [50.47, 50.99, 51.5, 52.02, 52.54, 53.07, 53.6, 54.13, 54.67, 55.22, 55.78, 55.78, 56.36, 56.97, 57.61, 58.32, 58.45, 59.16, 59.59, 60.31, 60.43, 61.15, 61.8, 62.41, 62.49, 63.0, 63.57, 64.13, 64.68, 65.22, 65.76, 66.3, 66.84, 67.37, 67.9, 68.43, 68.96, 118.75, 368.5, 424.76, 487.25, 715.39, 773.84, 834.15];
const O_a1 = [0.98, 2.53, 6.19, 14.32, 31.24, 64.29, 124.6, 227.3, 389.7, 627.1, 945.3, 945.3, 1331.8, 1746.6, 2120.1, 2363.7, 1442.1, 2379.9, 2090.7, 2103.4, 2438.0, 2479.5, 2275.9, 1915.4, 1503.0, 1490.2, 1078.0, 728.7, 461.3, 274.0, 153.0, 80.4, 39.8, 18.56, 8.17, 3.4, 1.33, 940.3, 67.4, 637.7, 237.4, 98.1, 572.3, 183.1];
const O_a2 = [9.65, 8.65, 7.71, 6.82, 5.98, 5.2, 4.47, 3.8, 3.18, 2.62, 2.11, 2.11, 1.65, 1.26, 0.91, 0.62, 0.08, 0.39, 0.21, 0.21, 0.39, 0.62, 0.91, 1.26, 0.08, 1.65, 2.11, 2.62, 3.18, 3.8, 4.47, 5.2, 5.98, 6.82, 7.71, 8.65, 9.65, 0.01, 0.05, 0.04, 0.05, 0.15, 0.14, 0.15];
const O_a3 = [6.69, 7.17, 7.64, 8.11, 8.58, 9.06, 9.55, 9.96, 10.37, 10.89, 11.34, 11.34, 11.89, 12.23, 12.62, 12.95, 14.91, 13.53, 14.08, 14.15, 13.39, 12.92, 12.63, 12.17, 15.13, 11.74, 11.34, 10.88, 10.38, 9.96, 9.55, 9.06, 8.58, 8.11, 7.64, 7.17, 6.69, 16.64, 16.4, 16.4, 16.0, 16.0, 16.2, 14.7];
const O_a5 = [2.57, 2.25, 1.95, 1.67, 1.39, 1.35, 2.23, 3.17, 3.56, 2.56, -1.172, -1.172, -2.378, -3.545, -5.416, -1.932, 6.77, -6.561, 6.96, -6.395, 6.34, 1.01, 5.01, 3.03, -4.499, 1.86, 0.66, -3.036, -3.968, -3.528, -2.548, -1.66, -1.68, -1.956, -2.216, -2.492, -2.773, -0.439, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
const O_a6 = [6.85, 6.8, 6.73, 6.64, 6.53, 6.21, 5.09, 3.75, 2.65, 2.95, 6.14, 6.14, 6.55, 6.45, 6.06, 0.44, -1.273, 2.31, -0.776, 0.7, -2.825, -0.584, -6.619, -6.759, 0.84, -6.675, -6.139, -2.895, -2.59, -3.68, -5.002, -6.091, -6.393, -6.475, -6.545, -6.6, -6.65, 0.08, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
/* ITU-R P.676-13 Table 2: water vapour spectroscopic data */
const W_f0 = [22.24, 67.8, 120.0, 183.31, 321.23, 325.15, 336.23, 380.2, 390.13, 437.35, 439.15, 443.02, 448.0, 470.89, 474.69, 488.49, 503.57, 504.48, 547.68, 552.02, 556.94, 620.7, 645.77, 658.01, 752.03, 841.05, 859.97, 899.3, 902.61, 906.21, 916.17, 923.11, 970.32, 987.93, 1780.0];
const W_b1 = [0.11, 0.0, 0.0, 2.27, 0.05, 1.51, 0.0, 11.67, 0.0, 0.06, 0.91, 0.19, 10.41, 0.33, 1.26, 0.25, 0.04, 0.01, 0.98, 0.18, 497.0, 5.02, 0.01, 0.27, 243.4, 0.01, 0.13, 0.05, 0.04, 0.18, 8.4, 0.01, 9.01, 134.6, 17506.0];
const W_b2 = [2.14, 8.73, 8.35, 0.67, 6.18, 1.54, 9.83, 1.05, 7.35, 5.05, 3.6, 5.05, 1.41, 3.6, 2.38, 2.85, 6.73, 6.73, 0.16, 0.16, 0.16, 2.39, 8.63, 7.82, 0.4, 8.18, 8.06, 7.91, 8.43, 5.11, 1.44, 10.29, 1.92, 0.26, 0.95];
const W_b3 = [26.38, 28.58, 29.48, 29.06, 24.04, 28.23, 26.93, 28.11, 21.52, 18.45, 20.07, 15.55, 25.64, 21.34, 23.2, 25.86, 16.12, 16.12, 26.0, 26.0, 30.86, 24.38, 18.0, 32.1, 30.86, 15.9, 30.6, 29.85, 28.65, 24.08, 26.73, 29.0, 25.5, 29.85, 196.3];
const W_b4 = [0.76, 0.69, 0.7, 0.77, 0.67, 0.64, 0.69, 0.54, 0.63, 0.6, 0.63, 0.6, 0.66, 0.66, 0.65, 0.69, 0.61, 0.61, 0.7, 0.7, 0.69, 0.71, 0.6, 0.69, 0.68, 0.33, 0.68, 0.68, 0.7, 0.7, 0.7, 0.7, 0.64, 0.68, 2.0];
const W_b5 = [5.09, 4.93, 4.78, 5.02, 4.4, 4.89, 4.74, 5.06, 4.81, 4.23, 4.48, 5.08, 5.03, 4.51, 4.8, 5.2, 3.98, 4.01, 4.5, 4.5, 4.55, 4.86, 4.0, 4.14, 4.35, 5.76, 4.09, 4.53, 5.1, 4.7, 5.15, 5.0, 4.94, 4.55, 24.15];
const W_b6 = [1.0, 0.82, 0.79, 0.85, 0.54, 0.74, 0.61, 0.89, 0.55, 0.48, 0.52, 0.5, 0.67, 0.65, 0.64, 0.72, 0.43, 0.45, 1.0, 1.0, 1.0, 0.68, 0.5, 1.0, 0.84, 0.45, 0.84, 0.9, 0.95, 0.53, 0.78, 0.8, 0.67, 0.9, 5.0];

const C_LIGHT = 2.99792458e8; // m/s
const K_BOLTZMANN = 1.380649e-23; // J/K

export interface RadioConfig {
	/** transmit antenna / system gain (dB) */
	gTx: number;
	/** transmit-side losses, e.g. feedline (dB) */
	lTx: number;
	/** transmit power (dBm) */
	pTx: number;
	/** receive antenna / system gain (dB) */
	gRx: number;
	/** receive-side losses (dB) */
	lRx: number;
}

export interface EnvState {
	atmo: boolean;
	cloud: boolean;
	rain: boolean;
	/** ambient temperature (C) */
	tempC: number;
	/** atmospheric pressure (kPa) */
	pressureKPa: number;
	/** relative humidity, 0-1 */
	humidity: number;
	/** cloud temperature (C) */
	cloudTempC: number;
	/** cloud liquid water density (g/m^3) */
	cloudDensity: number;
	/** fraction of the path inside cloud, 0-1 */
	cloudPathFrac: number;
	/** rain rate (mm/hr) */
	rainRate: number;
	/** fraction of the path in rain, 0-1 */
	rainPathFrac: number;
}

export interface LinkState {
	distanceKm: number;
	freqGHz: number;
	bandwidthMHz: number;
	/** path elevation angle (degrees) */
	elevDeg: number;
	/** polarization tilt angle (degrees); 0 = horizontal, 90 = vertical */
	polarTiltDeg: number;
	/** transmit antenna height above ground (m), horizon check only */
	hTxM: number;
	/** receive antenna height above ground (m), horizon check only */
	hRxM: number;
}

export interface Breakdown {
	freeSpace: number;
	atmo: number;
	cloud: number;
	rain: number;
	/** total propagation loss (dB) */
	total: number;
}

export interface Result {
	loss: Breakdown;
	/** system gain, tx + rx (dB) */
	gain: number;
	/** system losses, tx + rx (dB) */
	systemLoss: number;
	/** received power (dBm) */
	pRx: number;
	/** thermal noise floor (dBm) */
	noiseFloor: number;
	/** signal-to-noise ratio (dB) */
	snr: number;
}

const toK = (c: number) => c + 273.15;
const rad = (d: number) => (d * Math.PI) / 180;

/**
 * Relative humidity -> water vapour density (g/m^3).
 * Saturation vapour density is ~4.85 g/m^3 at 273 K, scaled linearly with temp.
 */
export function relHumToVaporDensity(humidity: number, tempK: number): number {
	const svd = (4.85 * tempK) / 273;
	return humidity * svd;
}

/** Free-space path loss (dB). Friis, far-field. */
export function freeSpaceLoss(distKm: number, freqGHz: number): number {
	if (distKm <= 0 || freqGHz <= 0) return 0;
	const wavelength = C_LIGHT / (freqGHz * 1e9);
	const distM = distKm * 1e3;
	// near-field guard, carried over from the original
	if (distM <= (wavelength / 4) * Math.PI) return 0;
	return 20 * Math.log10((4 * Math.PI * distM) / wavelength);
}

/**
 * Thermal noise floor (dBm). N = kTB.
 *
 * NOTE: this differs from the upstream Python, which returns 10*log10(kTB).
 * That is dBW, but it was then subtracted from a dBm figure to get SNR, making
 * the result 30 dB optimistic. The `* 1e3` here converts W to mW so the units
 * line up. Sanity check: 1 MHz at 290 K gives -114 dBm, the textbook value.
 */
export function thermalNoiseFloor(bandwidthHz: number, tempK = 290): number {
	if (bandwidthHz <= 0) return -Infinity;
	return 10 * Math.log10(K_BOLTZMANN * bandwidthHz * tempK * 1e3);
}

/* ── cloud / fog: ITU-R P.840-9 ────────────────────────────────── */

/** Cloud specific attenuation ((dB/km) at the given liquid water density). */
export function cloudSpecificAttenuation(freqGHz: number, tempK: number, density: number): number {
	const theta = 300 / tempK - 1;
	const e0 = 77.66 + 103.3 * theta;
	const e1 = 0.0671 * e0;
	const e2 = 3.52;

	const fp = 20.2 - 146 * theta + 316 * theta ** 2; // primary relaxation freq
	const fs = 39.8 * fp; // secondary relaxation freq

	const epsPri =
		(e0 - e1) / (1 + (freqGHz / fp) ** 2) + (e1 - e2) / (1 + (freqGHz / fs) ** 2) + e2;
	const epsPri2 =
		(freqGHz * (e0 - e1)) / (fp * (1 + (freqGHz / fp) ** 2)) +
		(freqGHz * (e1 - e2)) / (fs * (1 + (freqGHz / fs) ** 2));

	const nu = (2 + epsPri) / epsPri2;
	const kl = (0.819 * freqGHz) / (epsPri2 * (1 + nu ** 2));
	return kl * density;
}

/** Cloud/fog path loss (dB). */
export function cloudLoss(
	distKm: number,
	freqGHz: number,
	tempK: number,
	density: number
): number {
	if (distKm <= 0 || freqGHz <= 0) return 0;
	return distKm * cloudSpecificAttenuation(freqGHz, tempK, density);
}

/* ── rain: ITU-R P.838-3 / P.530-17 ────────────────────────────── */

function gaussianFit(
	freqGHz: number,
	aj: number[],
	bj: number[],
	cj: number[],
	m: number,
	c: number
): number {
	const logF = Math.log10(freqGHz);
	let sum = 0;
	for (let j = 0; j < aj.length; j++) {
		sum += aj[j] * Math.exp(-(((logF - bj[j]) / cj[j]) ** 2));
	}
	return sum + m * logF + c;
}

const kComponent = (f: number, aj: number[], bj: number[], cj: number[], m: number, c: number) =>
	10 ** gaussianFit(f, aj, bj, cj, m, c);

const aComponent = gaussianFit;

/** Rain specific attenuation (dB/km). */
export function rainSpecificAttenuation(
	rainRate: number,
	freqGHz: number,
	elevDeg: number,
	tiltDeg: number
): number {
	if (freqGHz <= 0 || rainRate <= 0) return 0;

	const kH = kComponent(
		freqGHz,
		[-5.3398, -0.35351, -0.23789, -0.94158],
		[-0.10008, 1.2697, 0.86036, 0.64552],
		[1.13098, 0.454, 0.15354, 0.16817],
		-0.18961,
		0.71147
	);
	const kV = kComponent(
		freqGHz,
		[-3.80595, -3.44965, -0.39902, 0.50167],
		[0.56934, -0.22911, 0.73042, 1.07319],
		[0.81061, 0.51059, 0.11899, 0.27195],
		-0.16398,
		0.63297
	);
	const aH = aComponent(
		freqGHz,
		[-0.14318, 0.29591, 0.32177, -5.3761, 16.1721],
		[1.82442, 0.77564, 0.63773, -0.9623, -3.2998],
		[-0.55187, 0.19822, 0.13164, 1.47828, 3.4399],
		0.67849,
		-1.95537
	);
	const aV = aComponent(
		freqGHz,
		[-0.07771, 0.56727, -0.20238, -48.2991, 48.5833],
		[2.3384, 0.95545, 1.1452, 0.791669, 0.791459],
		[-0.76284, 0.54039, 0.26809, 0.116226, 0.116479],
		-0.053739,
		0.83433
	);

	const cosE2 = Math.cos(rad(elevDeg)) ** 2;
	const cos2t = Math.cos(rad(2 * tiltDeg));

	const k = (kH + kV + (kH - kV) * cosE2 * cos2t) / 2;
	const a = (kH * aH + kV * aV + (kH * aH - kV * aV) * cosE2 * cos2t) / (2 * k);

	return k * rainRate ** a;
}

/** Rain path loss (dB), assuming rainfall is uniform along the path. */
export function rainLoss(
	distKm: number,
	freqGHz: number,
	rainRate: number,
	elevDeg = 0,
	tiltDeg = 0
): number {
	if (distKm <= 0) return 0;
	return distKm * rainSpecificAttenuation(rainRate, freqGHz, elevDeg, tiltDeg);
}

/* ── atmospheric gases: ITU-R P.676-13 ─────────────────────────── */

function oxygenRefractivity(freq: number, theta: number, dryP: number, wetP: number): number {
	let n = 0;
	for (let i = 0; i < O_f0.length; i++) {
		// spectral line strength
		const s = O_a1[i] * 1e-7 * dryP * theta ** 3 * Math.exp(O_a2[i] * (1 - theta));

		// line width, then adjusted for Zeeman splitting
		let df = O_a3[i] * 1e-4 * (dryP * theta ** 0.8 + 1.1 * wetP * theta);
		df = Math.sqrt(df ** 2 + 2.25e-6);

		// interference correction between oxygen lines
		const delta = (O_a5[i] + O_a6[i] * theta) * 1e-4 * (wetP + dryP) * theta ** 0.8;

		const t1 = (df - delta * (O_f0[i] - freq)) / ((O_f0[i] - freq) ** 2 + df ** 2);
		const t2 = (df - delta * (O_f0[i] + freq)) / ((O_f0[i] + freq) ** 2 + df ** 2);
		n += s * (freq / O_f0[i]) * (t1 + t2);
	}
	return n;
}

function waterVapourRefractivity(freq: number, theta: number, dryP: number, wetP: number): number {
	let n = 0;
	for (let i = 0; i < W_f0.length; i++) {
		const s = W_b1[i] * 1e-1 * theta ** 3.5 * Math.exp(W_b2[i] * (1 - theta)) * wetP;

		// line width, then adjusted for Doppler broadening
		let df = W_b3[i] * 1e-4 * (dryP * theta ** W_b4[i] + W_b5[i] * wetP * theta ** W_b6[i]);
		df = 0.535 * df + Math.sqrt(0.217 * df ** 2 + (2.1326e-12 * W_f0[i] ** 2) / theta);

		const t1 = df / ((W_f0[i] - freq) ** 2 + df ** 2);
		const t2 = df / ((W_f0[i] + freq) ** 2 + df ** 2);
		n += s * (freq / W_f0[i]) * (t1 + t2);
	}
	return n;
}

/** Atmospheric gas specific attenuation (dB/km). `pressureHPa` is total pressure. */
export function atmoSpecificAttenuation(
	freqGHz: number,
	tempK: number,
	pressureHPa: number,
	vaporDensity: number
): number {
	const theta = 300 / tempK;

	const wetP = (vaporDensity * tempK) / 216.7; // water vapour partial pressure (hPa)
	const dryP = pressureHPa - wetP; // dry air partial pressure (hPa)

	let nO = oxygenRefractivity(freqGHz, theta, dryP, wetP);

	// dry continuum: Debye spectrum + pressure-induced nitrogen absorption
	const d = 5.6e-4 * pressureHPa * theta ** 0.8;
	const t1 = 6.14e-5 / (d * (1 + (freqGHz / d) ** 2));
	const t2 = (1.4e-12 * dryP * theta ** 1.5) / (1 + 1.9e-5 * freqGHz ** 1.5);
	nO += freqGHz * dryP * theta ** 2 * (t1 + t2);

	const nW = waterVapourRefractivity(freqGHz, theta, dryP, wetP);

	return 0.182 * freqGHz * (nO + nW);
}

/** Atmospheric gas path loss (dB). */
export function atmoLoss(
	distKm: number,
	freqGHz: number,
	tempK: number,
	pressureHPa: number,
	vaporDensity: number
): number {
	if (distKm <= 0 || freqGHz <= 0) return 0;
	return distKm * atmoSpecificAttenuation(freqGHz, tempK, pressureHPa, vaporDensity);
}

/* ── geometry sanity check ───────────────────────────────────── */

/**
 * Radio horizon (km) for two antennas at the given heights (m).
 *
 * NOT part of the upstream port. Added because the loss model assumes a flat
 * earth, so on its own it will cheerfully report a healthy margin for a link
 * that runs straight through the planet. `d = 4.12 * (sqrt(h1) + sqrt(h2))`
 * is the standard 4/3-earth approximation.
 */
export function radioHorizonKm(hTxM: number, hRxM: number): number {
	return 4.12 * (Math.sqrt(Math.max(hTxM, 0)) + Math.sqrt(Math.max(hRxM, 0)));
}

/* ── the whole link ────────────────────────────────────────────── */

/** Propagation loss broken out by contributor (dB). */
export function pathLoss(link: LinkState, env: EnvState): Breakdown {
	const { distanceKm: d, freqGHz: f } = link;

	const freeSpace = freeSpaceLoss(d, f);
	let atmo = 0;
	let cloud = 0;
	let rain = 0;

	if (env.atmo) {
		const tempK = toK(env.tempC);
		// the whole path is assumed to sit inside the atmosphere
		atmo = atmoLoss(d, f, tempK, env.pressureKPa * 10, relHumToVaporDensity(env.humidity, tempK));
	}
	if (env.cloud) {
		cloud = cloudLoss(env.cloudPathFrac * d, f, toK(env.cloudTempC), env.cloudDensity);
	}
	if (env.rain) {
		rain = rainLoss(env.rainPathFrac * d, f, env.rainRate, link.elevDeg, link.polarTiltDeg);
	}

	return { freeSpace, atmo, cloud, rain, total: freeSpace + atmo + cloud + rain };
}

/** Full link budget: received power, noise floor, and SNR. */
export function solve(link: LinkState, env: EnvState, cfg: RadioConfig): Result {
	const loss = pathLoss(link, env);

	const gain = cfg.gTx + cfg.gRx;
	const systemLoss = cfg.lTx + cfg.lRx;

	const pRx = cfg.pTx + gain - (loss.total + systemLoss);
	const noiseFloor = thermalNoiseFloor(link.bandwidthMHz * 1e6, toK(env.tempC));

	return { loss, gain, systemLoss, pRx, noiseFloor, snr: pRx - noiseFloor };
}

export const defaultConfig = (): RadioConfig => ({
	gTx: 3,
	lTx: 0.5,
	pTx: 30,
	gRx: 3,
	lRx: 0.5,
});

export const defaultEnv = (): EnvState => ({
	atmo: true,
	cloud: false,
	rain: false,
	tempC: 20,
	pressureKPa: 101.3,
	humidity: 0.5,
	cloudTempC: 20,
	cloudDensity: 7.5,
	cloudPathFrac: 1,
	rainRate: 10,
	rainPathFrac: 1,
});

export const defaultLink = (): LinkState => ({
	distanceKm: 5,
	freqGHz: 0.915,
	bandwidthMHz: 0.25,
	elevDeg: 0,
	polarTiltDeg: 90,
	hTxM: 10,
	hRxM: 10,
});
