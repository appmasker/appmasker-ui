import type { IDomainForm, Redirect } from "../../types";
import { requiredField } from "./form-validators";

export const domainNameValidator = (name: string): string | null => {
  const invalidText = 'Please enter a valid domain name such as example.com or other.example.com';
  const requiredValidation = requiredField(name);
  if (requiredValidation) {
    return invalidText;
  }

  const regex = /^(((?!\-))(xn\-\-)?[a-z0-9\-_]{0,61}[a-z0-9]{1,1}\.)*(xn\-\-)?([a-z0-9\-]{1,61}|[a-z0-9\-]{1,30})\.[a-z]{2,}$/gi;
  const regexIsValid = regex.test(name);
  return regexIsValid ? null : invalidText;
}

const addressHasPort = (address: string): string | null => {
  const regex = /^(.+):([1-9][0-9]*)/gi;
  const port = parseInt(address.match(regex)?.[0].split(':')[1]);
  if (port > 0) {
    return null;
  }
  return 'Please append a valid port number like so: example.com:443 or 92.39.102:443';
}

const validAddress = (address: string): string | null => {
  const validIpAddrOrHost = /(^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]):(\d+))|(^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])):(\d+)/gi;
  return validIpAddrOrHost.test(address) ? null : 'Please provide a valid IPv4 Address or Hostname';
}

export const ipAddressValidator = (address: string): string | null => {
  const requiredValidation = requiredField(address);
  if (requiredValidation) {
    return requiredValidation;
  }

  const portInvalid = addressHasPort(address);
  if (portInvalid) {
    return portInvalid;
  }

  const addressInvalid = validAddress(address);
  if (addressInvalid) {
    return addressInvalid;
  }

  return null;
}

export const ipAddressesValidator = (addresses: string[]): Array<string | null> => {
  if (!addresses || !addresses.length) {
    return ['This field is required'];
  }

  const errors = addresses.map(ipAddressValidator);

  if (!errors.some(Boolean)) {
    return null;
  }

  return errors;
}

export const redirectFromValidator = (from: string): string | null => {
  if (from?.[0] !== '/') {
    return 'The path to redirect from should start with "/"';
  }
  return null;
}

export const redirectToValidator = (to: string): string | null => {
  const urlRegex = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;

  if (to?.[0] !== '/' && !urlRegex.test(to)) {
    return 'You must redirect to a path (e.g. /home) or a URL';
  }
  return null;
}

export const redirectsValidator = (redirects: Redirect[]): Array<string | null> => {

  const errors = redirects.map(redir => {
    if (!redir.from || !redir.to) {
      return 'Please provide a path to redirect from and a path / URL to redirect to';
    }

    const fromValidation = redirectFromValidator(redir.from);
    if (fromValidation) {
      return fromValidation;
    }

    const toValidation = redirectToValidator(redir.to);
    if (toValidation) {
      return toValidation;
    }

    return null;
  });

  if (!errors.some(Boolean)) {
    return null;
  }

  return errors;

}

export type DomainFormValidation = Record<keyof IDomainForm, Array<string | null> | string | null> | null;
export const domainEditFormValidator = (form: IDomainForm): DomainFormValidation => {

  const result: DomainFormValidation = {
    name: domainNameValidator(form.name),
    ipAddresses: ipAddressesValidator(form.ipAddresses),
    data: null,
    redirects: redirectsValidator(form.redirects),
    skipTLSVerify: null,
    headersDownstream: null,
    disableAutoHttps: null
  };

  return Object.values(result).some(val => {
    if (Array.isArray(val)) {
      return val.some(Boolean);
    }
    return Boolean(val);
  }) ? result : null;
}

const labelMap = {
  name: 'Custom Domain Name',
  ipAddresses: 'Service Addresses',
  redirects: 'Redirects',
}

export const displayFirstError = (errorData: DomainFormValidation): [fieldName: string, error: string] => {
  const firstError = Object.entries(errorData)?.find(([field, error]) => {
    if (Array.isArray(error)) {
      return error.some(Boolean);
    }
    return Boolean(error);
  });

  const label = labelMap[firstError[0]];

  if (Array.isArray(firstError[1])) {
    return [label, firstError[1].filter(Boolean).join('\n')];
  }

  return [label, firstError[1]];
}
