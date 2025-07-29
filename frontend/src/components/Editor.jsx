import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import socket from "../socket";

const CodeEditor = ({ roomId }) => {
  const [code, setCode] = useState("");

  useEffect(() => {
    socket.emit("joinRoom", roomId); // ✅ Ensure the room is joined

    socket.on("codeUpdate", (newCode) => {
      setCode(newCode);
    });

    return () => {
      socket.off("codeUpdate"); // ✅ Cleanup on unmount
    };
  }, [roomId]);

  const handleChange = (newCode) => {
    setCode(newCode);
    socket.emit("codeChange", { roomId, newCode });
  };

  return (
    <div style={{ height: "400px", border: "1px solid #ccc" }}>
      <Editor
        height="100%"
        defaultLanguage="javascript"
        theme="vs-dark"
        value={code}
        onChange={handleChange}
      />
    </div>
  );
};

export default CodeEditor;
