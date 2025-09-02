import DglabProviderContainer from "./provider/DglabProviderContainer.ts";
import module from "./module.ts";
import {useEffect, useState} from "react";
import type DglabProvider from "./provider/DglabProvider.ts";

export default function DglabPage() {
  const [providerName, setProviderName] = useState<string>(module.providerName);
  const [provider, setProvider] = useState<DglabProvider>(module.provider);
  const [powerA, setPowerA] = useState<number>(module.powerA);
  const [powerB, setPowerB] = useState<number>(module.powerB);

  useEffect(() => {
    const listener = (a: number, b: number) => {
      setPowerA(a);
      setPowerB(b);
    };
    module.addPowerListener(listener);
    return () => {
      module.removePowerListener(listener);
    };
  }, []);

  useEffect(() => {
    const newProvider = module.providerList.find(p => p.name === providerName);
    if (newProvider) {
      module.setProvider(providerName, setProvider);
    }
  }, [providerName]);

  return (<>
    <select value={providerName} onChange={e => setProviderName(e.target.value)}>
      {module.providerList.map((p, index) => (
        <option key={index} value={p.name}>{p.name}</option>
      ))}
    </select>
    <DglabProviderContainer provider={provider}/>
    <hr/>
    <div>
      <label>
        A:
        <input type="range" min={0} max={1} step={0.01} value={powerA} placeholder="Power A"/>
        {Math.round(powerA * 100)}%
      </label>
    </div>
    <div>
      <label>
        B:
        <input type="range" min={0} max={1} step={0.01} value={powerB} placeholder="Power B"/>
        {Math.round(powerB * 100)}%
      </label>
    </div>
  </>);
}
