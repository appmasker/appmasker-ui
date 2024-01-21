import { FlyRegion, Server, ServerConfigType, ServerForm } from '../../../types';
import { goModuleValidator } from '../../../utils/validators';

export const validateForm = (form: ServerForm): { [field: string]: string | null } => {
	const validation: { [field: string]: string | null } = {};

	if (!form.name) {
		validation['name'] = 'Give your server a name';
	}
	if (!Object.keys(form.regions).some((key) => form.regions[key])) {
		validation['regions'] = 'Please select at least 1 region';
	}
	if (form.configType === ServerConfigType.CADDYFILE && !form.caddyFileConfig) {
		validation['caddyFileConfig'] = 'Please enter a Caddyfile';
	}
	if (form.configType === ServerConfigType.JSON && !form.caddyJSONConfig) {
		validation['caddyJSONConfig'] = 'Please enter a Caddy JSON config';
	}
	if (form.plugins.some(goModuleValidator)) {
		validation['plugins'] = 'Please enter valid Caddy plugin Go module paths, or delete them';
	}

	return validation;
};

export const serverToForm = (server: Server): ServerForm => {
	if (server) {
		return {
			regions: server.regions || [],
			name: server.name ?? '',
			caddyFileConfig:
				server.configType === ServerConfigType.CADDYFILE ? (server.configFile as string) : '',
			caddyJSONConfig:
				server.configFile === ServerConfigType.JSON
					? typeof server.configFile === 'string'
						? server.configFile
						: JSON.stringify(server.configFile)
					: '',
			configType: server.configType,
			plugins: server.plugins || [],
			staticContent: server.staticContent,
			variables: server.variables || []
		};
	} else {
		return {
			name: '',
			regions: [],
			caddyFileConfig: '',
			caddyJSONConfig: '',
			configType: ServerConfigType.CADDYFILE,
			plugins: [],
			staticContent: null,
			variables: []
		};
	}
};

export const regionDictToList = (regionDict: Record<FlyRegion, boolean>): FlyRegion[] => {
	return Object.keys(regionDict).filter((region) => regionDict[region]) as FlyRegion[];
};

export const caddyFilePlaceholder = `{$FLY_APP_NAME}.fly.dev {
  # Respond "Hello World" to requests on the root path
  respond / "Hello World" 200

  # Health check endpoint
  respond /health "Healthy" 200
}`;

export const caddyJSONConfigPlaceholder = JSON.stringify(
	{
		apps: {
			http: {
				servers: {
					srv0: {
						listen: [':443'],
						routes: [
							{
								match: [
									{
										host: ['{env.FLY_APP_NAME}.fly.dev']
									}
								],
								handle: [
									{
										body: 'Hello, world!',
										handler: 'static_response'
									}
								]
							}
						]
					}
				}
			}
		}
	},
	null,
	4
);
