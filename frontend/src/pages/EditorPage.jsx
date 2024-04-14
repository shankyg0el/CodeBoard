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
import ACTIONS, { CANVASACTIONS } from "../Actions";
import Canvas from "../Components/Canvas";

function EditorPage() {
  const socketRef = useRef(null);
  const settingsContext = useContext(SettingsContext);
  const [showCanvas, setShowCanvas] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [editorContent, setEditorContent] = useState("");
  const [clients, setClients] = useState([]);
  const [messages, setMessages] = useState([]);
  const [rectangles, setRectangles] = useState([]);
  const [circles, setCircles] = useState([]);
  const [arrows, setArrows] = useState([]);
  const [scribbles, setScribbles] = useState([]);
  const [texts, setTexts] = useState([]);
  const [layerContent, setLayerContent] = useState([]);
  const [actionPerformed, setActionPerformed] = useState("");
  const [shapeId, setShapeId] = useState("");

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
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
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

      // Listening for message
      socketRef.current.on(
        ACTIONS.MESSAGE,
        ({ message, id, username, timestamp }) => {
          if (username !== location.state.username) {
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

      // Listening foR Rectangles Drawn on Canvas
      socketRef.current.on(
        CANVASACTIONS.RECTANGLE,
        ({ rectangles, action }) => {
          setActionPerformed(action);
          setRectangles(rectangles);
        }
      );

      // Listening foR Circles Drawn on Canvas
      socketRef.current.on(CANVASACTIONS.CIRCLE, ({ circles, action }) => {
        setActionPerformed(action);
        setCircles(circles);
      });

      // Listening foR Arrows Drawn on Canvas
      socketRef.current.on(CANVASACTIONS.ARROW, ({ arrows, action }) => {
        setArrows(arrows);
        setActionPerformed(action);
      });

      // Listening foR Scribbles Drawn on Canvas
      socketRef.current.on(CANVASACTIONS.SCRIBBLE, ({ scribbles, action }) => {
        setScribbles(scribbles);
        setActionPerformed(action);
      });
      // Listening foR text typed on Canvas
      socketRef.current.on(CANVASACTIONS.TEXT, ({ texts, action }) => {
        setTexts(texts);
        setActionPerformed(action);
      });
      // Listening foR text typed on Canvas
      socketRef.current.on(
        CANVASACTIONS.ERASE,
        ({ layerContent, action, shapeId }) => {
          setLayerContent(layerContent);
          setActionPerformed(action);
          setShapeId(shapeId);
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

  function handleCanvasClick(icon) {
    if (icon === "canvas") {
      setShowCanvas(true);
    } else {
      setShowCanvas(false);
    }
  }

  return (
    <div className="flex">
      <Navbar
        clients={clients}
        socketRef={socketRef}
        messages={messages}
        handleCanvasClick={handleCanvasClick}
      />
      {showCanvas == true ? (
        <Canvas
          socketRef={socketRef}
          roomId={roomId}
          newRectangles={rectangles}
          newCircles={circles}
          newArrows={arrows}
          newScribbles={scribbles}
          newTexts={texts}
          actionPerformed={actionPerformed}
          newLayerContent={layerContent}
          shapeId={shapeId}
        />
      ) : (
        <CodeMirror
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
