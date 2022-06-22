import { flyRegions } from "../../../utils/consts";
import { FlyRegion, Server, ServerConfigType, ServerForm } from "../../../types";

export const validateForm = (form: ServerForm): { [field: string]: string | null } => {
  const validation: { [field: string]: string | null } = {};

  if (!form.name) {
    validation['name'] = 'Give your server a name';
  }
  if (!Object.keys(form.regions).some(key => form.regions[key])) {
    validation['regions'] = 'Please select at least 1 region';
  }
  if (form.configType === ServerConfigType.CADDYFILE && !form.caddyFileConfig) {
    validation['caddyFileConfig'] = 'Please enter a Caddyfile';
  }
  if (form.configType === ServerConfigType.JSON && !form.caddyJSONConfig) {
    validation['caddyJSONConfig'] = 'Please enter a Caddy JSON config';
  }

  return validation;
}

export const serverToForm = (server: Server): ServerForm => {
  if (server) {
    return {
      regions: flyRegions.reduce((prev, curr) => {
        prev[curr.id] = server.regions.includes(curr.id);
        return prev
      }, {} as Record<FlyRegion, boolean>),
      name: server.name ?? '',
      caddyFileConfig: server.configType === ServerConfigType.CADDYFILE ? server.configFile as string : '',
      caddyJSONConfig: server.configFile === ServerConfigType.JSON ? typeof server.configFile === 'string' ? server.configFile : JSON.stringify(server.configFile) : '',
      configType: server.configType
    }
  } else {
    return {
      name: '',
      regions: {} as Record<FlyRegion, boolean>,
      caddyFileConfig: '',
      caddyJSONConfig: '',
      configType: ServerConfigType.CADDYFILE
    }
  }
};

export const regionDictToList = (regionDict: Record<FlyRegion, boolean>): FlyRegion[] => {
  return Object.keys(regionDict).filter((region) => regionDict[region]) as FlyRegion[];
}

export const caddyFilePlaceholder = `example.com

root * /var/www/wordpress
php_fastcgi unix//run/php/php-version-fpm.sock
file_server`

export const caddyJSONConfigPlaceholder = JSON.stringify({
  "apps": {
    "http": {
      "servers": {
        "srv0": {
          "listen": [
            ":443"
          ],
          "routes": [
            {
              "handle": [
                {
                  "body": "Hello, world!",
                  "handler": "static_response"
                }
              ]
            }
          ]
        }
      }
    }
  }
}, null, 4);