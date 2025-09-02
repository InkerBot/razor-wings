interface BluetoothDevice extends EventTarget {
  id: string;
  name?: string;
  gatt?: BluetoothRemoteGATTServer;

  addEventListener(type: 'gattserverdisconnected', listener: (event: Event) => void): void;

  removeEventListener(type: 'gattserverdisconnected', listener: (event: Event) => void): void;
}

interface BluetoothRemoteGATTServer {
  device: BluetoothDevice;
  connected: boolean;

  connect(): Promise<BluetoothRemoteGATTServer>;

  disconnect(): void;

  getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;

  getPrimaryServices(service?: string): Promise<BluetoothRemoteGATTService[]>;
}

interface BluetoothRemoteGATTService {
  device: BluetoothDevice;
  uuid: string;

  getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>;

  getCharacteristics(characteristic?: string): Promise<BluetoothRemoteGATTCharacteristic[]>;
}

interface BluetoothRemoteGATTCharacteristic extends EventTarget {
  service: BluetoothRemoteGATTService;
  uuid: string;
  properties: BluetoothCharacteristicProperties;
  value?: DataView;

  writeValue(value: BufferSource): Promise<void>;

  writeValueWithResponse(value: BufferSource): Promise<void>;

  writeValueWithoutResponse(value: BufferSource): Promise<void>;

  readValue(): Promise<DataView>;

  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;

  stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;

  addEventListener(type: 'characteristicvaluechanged', listener: (event: Event) => void): void;

  removeEventListener(type: 'characteristicvaluechanged', listener: (event: Event) => void): void;
}

interface BluetoothCharacteristicProperties {
  authenticatedSignedWrites: boolean;
  broadcast: boolean;
  indicate: boolean;
  notify: boolean;
  read: boolean;
  reliableWrite: boolean;
  writableAuxiliaries: boolean;
  write: boolean;
  writeWithoutResponse: boolean;
}

interface BluetoothRequestDeviceFilter {
  services?: BluetoothServiceUUID[];
  name?: string;
  namePrefix?: string;
  manufacturerData?: BluetoothManufacturerDataFilter[];
  serviceData?: BluetoothServiceDataFilter[];
}

interface BluetoothManufacturerDataFilter {
  companyIdentifier: number;
  dataPrefix?: BufferSource;
  mask?: BufferSource;
}

interface BluetoothServiceDataFilter {
  service: BluetoothServiceUUID;
  dataPrefix?: BufferSource;
  mask?: BufferSource;
}

interface RequestDeviceOptions {
  filters?: BluetoothRequestDeviceFilter[];
  optionalServices?: BluetoothServiceUUID[];
  acceptAllDevices?: boolean;
}

interface Bluetooth extends EventTarget {
  getAvailability(): Promise<boolean>;

  addEventListener(type: 'availabilitychanged', listener: (event: Event) => void): void;

  removeEventListener(type: 'availabilitychanged', listener: (event: Event) => void): void;

  requestDevice(options?: RequestDeviceOptions): Promise<BluetoothDevice>;

  getDevices(): Promise<BluetoothDevice[]>;
}

type BluetoothServiceUUID = number | string;
type BluetoothCharacteristicUUID = number | string;
type BluetoothDescriptorUUID = number | string;

interface Navigator {
  bluetooth?: Bluetooth;
}
