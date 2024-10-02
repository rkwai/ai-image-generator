export interface Env {
	AI: Ai;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		// Parse query string parameters
		const url = new URL(request.url);
		const prompt = url.searchParams.get('prompt');
		const num_steps = parseInt(url.searchParams.get('num_steps') || '20', 10);

		if (!prompt) {
			return new Response('Missing prompt in query parameters', { status: 400 });
		}

		if (isNaN(num_steps) || num_steps < 1 || num_steps > 20) {
			return new Response('Invalid num_steps parameter. Must be between 1 and 50.', { status: 400 });
		}

		const inputs = {
			prompt: prompt,
			num_steps: num_steps
		};

		try {
			// Generate the image using the stable diffusion xl model
			const response = await env.AI.run('@cf/stabilityai/stable-diffusion-xl-base-1.0', inputs);

			// The response is a ReadableStream, so we can return it directly
			return new Response(response, {
				headers: {
					'Content-Type': 'image/png',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
				},
			});
		} catch (error) {
			console.error('Error generating image:', error);
			if (error instanceof Error) {
				return new Response(`Error generating image: ${error.message}`, { status: 500 });
			}
			return new Response('Unknown error generating image', { status: 500 });
		}
	},
} satisfies ExportedHandler<Env>;