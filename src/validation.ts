/**
 * Minimal request-body validation for the demo controllers. Values are
 * checked before anything is written, so an invalid field never leaves a
 * half-updated entity behind.
 */

/** A request field failed validation; the controllers answer 400. */
export class ValidationError extends Error {}

/** A non-empty string of at most `maxLength` characters. */
export function readText(value: unknown, field: string, maxLength = 200): string {
    if (typeof value !== 'string' || value.trim() === '' || value.length > maxLength) {
        throw new ValidationError(`Field ${field} must be a non-empty string of at most ${maxLength} characters`);
    }
    return value;
}

/** A string (possibly empty) of at most `maxLength` characters. */
export function readOptionalText(value: unknown, field: string, maxLength = 2000): string {
    if (typeof value !== 'string' || value.length > maxLength) {
        throw new ValidationError(`Field ${field} must be a string of at most ${maxLength} characters`);
    }
    return value;
}

/**
 * A finite number (a JSON number, or a numeric string such as "12.5")
 * greater than or equal to `min`; with `integer`, a whole number.
 */
export function readNumber(value: unknown, field: string, options: { integer?: boolean; min?: number } = {}): number {
    const { integer = false, min = 0 } = options;
    const number = typeof value === 'number'
        ? value
        : typeof value === 'string' && value.trim() !== '' ? Number(value) : Number.NaN;
    if (!Number.isFinite(number) || number < min || (integer && !Number.isInteger(number))) {
        throw new ValidationError(`Field ${field} must be a ${integer ? 'whole ' : ''}number >= ${min}`);
    }
    return number;
}

/** Sends 400 for a {@link ValidationError}, otherwise passes the error on. */
export function handleError(err: unknown, res: { status(code: number): { json(body: unknown): unknown } }, next: (err: unknown) => void): void {
    if (err instanceof ValidationError) {
        res.status(400).json({ error: err.message });
        return;
    }
    next(err);
}
