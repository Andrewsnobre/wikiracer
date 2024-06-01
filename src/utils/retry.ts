/**
 * Retries a given function a specified number of times with a delay between retries.
 * 
 * @param fn - The function to retry.
 * @param retries - The number of times to retry the function.
 * @param delay - The delay between retries in milliseconds.
 * @returns The result of the function if successful, otherwise throws an error.
 */
export async function retry<T>(fn: () => Promise<T>, retries: number, delay: number): Promise<T> {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }
    throw new Error('Max retries reached');
}
