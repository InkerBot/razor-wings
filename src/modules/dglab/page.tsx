import DglabProviderContainer from "./provider/DglabProviderContainer.ts";
import module from "./module.ts";
import {useEffect, useState} from "react";
import type DglabProvider from "./provider/DglabProvider.ts";
import {InlineLabel, RangeInput, Select} from "../../components/FieldControls";

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
    <Select className="mb-[var(--rw-space-2)] w-full" value={providerName}
            onChange={e => setProviderName(e.target.value)}>
      {module.providerList.map((p, index) => (
        <option key={index} value={p.name}>{p.name}</option>
      ))}
    </Select>
    <DglabProviderContainer provider={provider}/>
    <hr/>
    <div className="flex flex-col gap-[var(--rw-space-2)]">
      <InlineLabel className="w-full">
        <span className="w-[18px]">A:</span>
        <RangeInput min={0} max={1} step={0.01} value={powerA} placeholder="Power A" readOnly className="flex-1"/>
        <span className="rw-value w-[42px]">{Math.round(powerA * 100)}%</span>
      </InlineLabel>
      <InlineLabel className="w-full">
        <span className="w-[18px]">B:</span>
        <RangeInput min={0} max={1} step={0.01} value={powerB} placeholder="Power B" readOnly className="flex-1"/>
        <span className="rw-value w-[42px]">{Math.round(powerB * 100)}%</span>
      </InlineLabel>
    </div>
  </>);
}
