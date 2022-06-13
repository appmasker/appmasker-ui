import { DNS_RECORD_STATUS, DomainDNSRecordData } from "../types";
import { APPMASKER_IPV4_ADDRESS, APPMASKER_IPV6_ADDRESS } from "./environment";

export const chooseDNSStatus = (status: DomainDNSRecordData): { status: DNS_RECORD_STATUS, message: string } => {
  const goodMessage = 'Your DNS settings look good!';

  if (status.ipv4.error) {
    return {
      status: DNS_RECORD_STATUS.ERROR,
      message: status.ipv4.error
    };
  }

  if (status.ipv4.addresses.length > 1) {
    return {
      status: DNS_RECORD_STATUS.ERROR,
      message: `Please remove the A Record with value ${status.ipv4.addresses.find(addr => addr !== APPMASKER_IPV4_ADDRESS)} from your registrar DNS settings.`
    };
  }

  if (!arraysAreEqual(status.ipv4.addresses, [APPMASKER_IPV4_ADDRESS])) {
    return {
      status: DNS_RECORD_STATUS.ERROR,
      message: `Please modify the A Record so that the value is ${APPMASKER_IPV4_ADDRESS}.`
    }
  }

  if (!status.ipv6.addresses?.length) {
    return {
      status: DNS_RECORD_STATUS.GOOD,
      message: goodMessage
    }
  }

  if (status.ipv6.error) {
    return {
      status: DNS_RECORD_STATUS.WARNING,
      message: status.ipv6.error
    };
  }

  if (status.ipv6.addresses.length > 1) {
    return {
      status: DNS_RECORD_STATUS.WARNING,
      message: `Please remove the AAAA Record with value ${status.ipv6.addresses.find(addr => addr !== APPMASKER_IPV6_ADDRESS)} from your registrar DNS settings.`
    };
  }

  if (!arraysAreEqual(status.ipv6.addresses, [APPMASKER_IPV6_ADDRESS])) {
    return {
      status: DNS_RECORD_STATUS.WARNING,
      message: `Please modify the AAAA Record so that the value is ${APPMASKER_IPV6_ADDRESS}.`
    };
  }

  return {
    status: DNS_RECORD_STATUS.GOOD,
    message: goodMessage
  };

}

const arraysAreEqual = (arr1: any[], arr2: any[]): boolean => {
  if (arr1?.length !== arr2?.length) {
    return false;
  }
  return arr1.every((val, index) => val === arr2[index]);
}