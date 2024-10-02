export interface Env {
	// If you set another name in wrangler.toml as the value for 'binding',
	// replace "AI" with the variable name you defined.
	AI: Ai;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		// Parse the request body to get the prompt
		const body = await request.json() as { prompt?: string, num_steps?: number };
		const prompt = body.prompt;
		const num_steps = body.num_steps || 20;

		if (!prompt) {
			return new Response('Missing prompt in request body', { status: 400 });
		}

		const inputs = {
			prompt: prompt,
			num_steps: num_steps
		};

		try {
			// Generate the image using the Flux model
			const response = await env.AI.run('@cf/stabilityai/stable-diffusion-xl-base-1.0', inputs);

			// The response is a ReadableStream, so we can return it directly
			return new Response(response, {
				headers: {
					'Content-Type': 'image/png',
				},
			});
		} catch (error) {
			console.error('Error generating image:', error);
			return new Response('Error generating image', { status: 500 });
		}
	},
} satisfies ExportedHandler<Env>;