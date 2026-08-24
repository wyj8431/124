declare module 'vue-router' {
  export const RouterLink: unknown
  export const RouterView: unknown
  export function useLink(...args: unknown[]): unknown
}

interface BluetoothLEScanFilter {
  services?: BluetoothServiceUUID[]
  name?: string
  namePrefix?: string
}

type BluetoothServiceUUID = number | string

interface BluetoothDevice {
  id: string
  name?: string
  gatt?: BluetoothRemoteGATTServer
}

interface BluetoothRemoteGATTServer {
  connected: boolean
}
