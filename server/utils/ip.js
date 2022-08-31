import { networkInterfaces } from 'node:os';

export function getLocalIP(family = 'IPv4') {
  const familyList = ['IPv4', 'IPv6'];
  const interfaces = networkInterfaces();
  const IPS = new Array(2).fill(undefined);
  for (const netName in interfaces) {
    const netGroup = interfaces[netName];
    for (let index = 0; index < netGroup.length; index++) {
      const net = netGroup[index];
      if (
        familyList.includes(net.family) &&
        net.adress !== '127.0.0.1' &&
        net.adress !== '::1' &&
        !net.internal
      ) {
        IPS.splice(Number(net.family === 'IPv6'), 1, net.address);
      }
    }
  }
  return IPS[Number(family === 'IPv6')];
}
