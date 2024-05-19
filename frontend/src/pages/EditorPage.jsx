import { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { SettingsContext } from "../../context/SettingsContext";
import Navbar from "../Components/Navbar";
import CodeMirror from "@uiw/react-codemirror";
import * as themes from "@uiw/codemirror-themes-all";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { color } from "@uiw/codemirror-extensions-color";
import { hyperLink } from "@uiw/codemirror-extensions-hyper-link";
import { initSocket } from "../socket";
import ACTIONS from "../Actions";
import Canvas from "../Components/Canvas";

function EditorPage() {
  const socketRef = useRef(null);
  const [showCanvas, setShowCanvas] = useState(false);
  const [newCanvasChanges, setNewCanvasChanges] = useState([]);
  const [canvasData, setCanvasData] = useState([]);
  const settingsContext = useContext(SettingsContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [editorContent, setEditorContent] = useState("");
  const [clients, setClients] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentTab, setCurrentTab] = useState("code");

  const handleEditorChange = (value) => {
    socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code: value });
    setEditorContent(value);
  };

  useEffect(() => {
    if (!location.state || !location.state.username) {
      toast.error("Oops. Something went wrong. Please try again later.");
      navigate("/", { replace: true });
    }

    function handleErrors(e) {
      console.log("Socker Error", e);
      toast.error("Socker Connection Failed. Try again later.");
      navigate("/", { replace: true });
    }

    async function init() {
      settingsContext.updateSettings("userName", location.state.username);
      settingsContext.updateSettings("roomId", roomId);
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      // Listening for joined event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast(`${username} joined the room.`, {
              icon: "📢",
            });
          }
          setClients(clients);
          settingsContext.updateSettings("clients", clients);
          socketRef.current.emit(ACTIONS.SYNC_CHANGES, {
            roomId,
            socketId,
          });
        }
      );

      // Listening for code change
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          setEditorContent(code);
        }
      });
      // Listening for code change
      socketRef.current.on(ACTIONS.SYNC_CHANGES, ({ roomData }) => {
        if (roomData) {
          console.log(roomData);
        }
        if (roomData && roomData.code !== null) {
          setEditorContent(roomData.code);
        }

        if (roomData && roomData.canvasData.length > 0) {
          setCanvasData(roomData.canvasData);
        }
        if (roomData && roomData.messages.length > 0) {
          setMessages(roomData.messages);
        }
      });

      // Listening for message
      socketRef.current.on(
        ACTIONS.MESSAGE,
        ({ message, id, username, timestamp }) => {
          if (username !== location.state?.username) {
            toast(`${username} sent a message`, {
              icon: "💬",
            });
          }

          setMessages((prev) => [
            ...prev,
            { message, username, id, timestamp },
          ]);
        }
      );

      socketRef.current.on(
        ACTIONS.LANGUAGE_CHANGE,
        ({ username, language }) => {
          console.log("New language is", language);
          settingsContext.updateSettings("language", language);
        }
      );

      socketRef.current.on(
        ACTIONS.CANVAS_CHANGE,
        ({ type, username, newChanges }) => {
          if (username !== location.state.username) {
            setNewCanvasChanges(newChanges);
          }
          setCanvasData((prev) => [...prev, ...newChanges]);
        }
      );
      // Listening for disconnected
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast(`${username} left the room.`, {
          icon: "📢",
        });
        setClients((prev) =>
          prev.filter((client) => client.socketId !== socketId)
        );
      });
    }
    init();
    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, []);

  function showCanvasfunc(val) {
    setShowCanvas(val);
  }

  function handleTabClick(icon) {
    switch (icon) {
      case "code":
        setCurrentTab(icon);
        break;
      case "canvas":
        setCurrentTab(icon);
        break;
      case "viewmembers":
        setCurrentTab(icon);
        break;
      case "chat":
        setCurrentTab(icon);
        break;
      case "settings":
        setCurrentTab(icon);
        break;
    }
  }

  return (
    <div className="flex">
      <Navbar
        clients={clients}
        socketRef={socketRef}
        messages={messages}
        handleTabClick={handleTabClick}
        setShowCanvas={showCanvasfunc}
      />
      {showCanvas ? (
        <Canvas
          username={location.state.username}
          socketRef={socketRef}
          roomId={roomId}
          newCanvasChanges={newCanvasChanges}
          canvasData={canvasData}
          currentTab={currentTab}
        />
      ) : (
        <CodeMirror
          className="overflow-auto"
          value={editorContent}
          onChange={handleEditorChange}
          extensions={[
            loadLanguage(settingsContext.settings.language),
            color,
            hyperLink,
          ]}
          theme={themes[settingsContext.settings.theme]}
          width="100vw"
          height="100vh"
          style={{ fontSize: "20px" }}
        />
      )}
    </div>
  );
}

export default EditorPage;
