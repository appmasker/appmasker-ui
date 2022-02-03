import type { DomainPreset } from "src/types";

const calendlyPreset: DomainPreset = {
  name: 'calendly',
  label: 'Calendly',
  config: {
    name: '',
    ipAddresses: ['calendly.com:443'],
    headersDownstream: { 'Access-Control-Allow-Origin': ['*'] },
    skipTLSVerify: true,
    redirects: [{ from: '/', to: '' }]
  },
}

const calPreset: DomainPreset = {
  name: 'cal',
  label: 'Cal.com',
  config: {
    name: '',
    ipAddresses: ['app.cal.com:443'],
    headersDownstream: { 'Access-Control-Allow-Origin': ['*'] },
    skipTLSVerify: true,
    redirects: [{ from: '/', to: '' }]
  },
}



// https://discourse.webflow.com/t/partial-site-hosting-with-reverse-proxy/58802
// export const webflowPreset: DomainPreset = {
//   name: 'webflow',
//   label: 'Webflow',
//   config: {
//     name: 'proxy.webflow.com',
//     ipAddresses: ['proxy'],
//     headersDownstream: {}

//   }
// }


const allPresets = [
  calendlyPreset,
  calPreset
  // webflowPreset
];

const getDomainPreset = (name: string): DomainPreset => {
  if (name) {
    const found = allPresets.find((preset) => name === preset.name);
    return found ? { ...found } : null;
  }
  return null;
}

export const getDomainPresetFromUrl = (): DomainPreset => {
  const urlParams = new URLSearchParams(window.location.search);
  const presetName = urlParams.get('preset');
  return getDomainPreset(presetName);

}

export const removePresetQueryParam = (): void => {
  if (typeof URL !== 'undefined') {
    const url = new URL(location.href);
    url.searchParams.delete('preset');

    window.history.pushState({}, document.title, url);
  } else {
    console.error(`Your browser ${navigator} does not support URL`)
  }
}