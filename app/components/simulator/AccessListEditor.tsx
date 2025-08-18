import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/Input";
import { Plus, Trash2 } from "lucide-react";

export default function AccessListEditor({
  accessList,
  setAccessList,
}: {
  accessList: { address: string; storageKeys: string[] }[];
  setAccessList: React.Dispatch<
    React.SetStateAction<{ address: string; storageKeys: string[] }[]>
  >;
}) {
  const [showAccessList, setShowAccessList] = useState(false);

  if (!showAccessList) {
    return (
      <div className="mt-6 flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAccessList(true)}
        >
          + Enable Access List
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6 p-4 border rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium">Optional Access Lists</label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAccessList(false)}
        >
          ✕ Close
        </Button>
      </div>

      <div className="mt-2 space-y-2">
        {accessList.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="Contract address"
              value={item.address}
              onChange={(e: { target: { value: string; }; }) => {
                const newAccessList = [...accessList];
                newAccessList[index].address = e.target.value;
                setAccessList(newAccessList);
              }}
            />
            <Input
              placeholder="Storage key (comma-separated)"
              value={item.storageKeys.join(",")}
              onChange={(e: { target: { value: string; }; }) => {
                const keys = e.target.value
                  .split(",")
                  .map((k: string) => k.trim());
                const newAccessList = [...accessList];
                newAccessList[index].storageKeys = keys;
                setAccessList(newAccessList);
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newAccessList = accessList.filter(
                  (_, i) => i !== index
                );
                setAccessList(newAccessList);
              }}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setAccessList([
              ...accessList,
              { address: "", storageKeys: [] },
            ])
          }
        >
          <Plus size={10} /> Add Address to Access List
        </Button>
      </div>
    </div>
  );
}
