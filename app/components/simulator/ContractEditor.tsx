"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import Editor from "@monaco-editor/react";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";

export default function ContractEditor() {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState<string>(
`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Demo {
    uint256 public value;

    function setValue(uint256 _v) public {
        value = _v;
    }
}`
  );

  const [message, setMessage] = useState<string | null>(null);

  const handleSave = () => {
    setMessage("✅ Contract updated! Simulation will now use modified code (mock).");
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Contract Code Editing (Optional)</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? "Hide Editor" : "Show Editor"}
        </Button>
      </CardHeader>

      {isOpen && (
        <CardContent>
          <div className="h-[400px] border rounded">
            <Editor
              height="100%"
              defaultLanguage="sol"
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || "")}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSave}>Save & Re-Simulate</Button>
          </div>
          {message && (
            <p className="mt-2 text-green-600 text-sm">{message}</p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
