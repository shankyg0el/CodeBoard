import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useMemo } from "react";
import {
  Tldraw,
  DefaultColorThemePalette,
  defaultShapeUtils,
  createTLStore,
  throttle,
  createPresenceStateDerivation,
  atom,
} from "tldraw";
import ACTIONS from "../Actions";

DefaultColorThemePalette.lightMode.black.solid = "white";

function generateRandomColor() {
  const red = Math.floor(Math.random() * 256);
  const green = Math.floor(Math.random() * 256);
  const blue = Math.floor(Math.random() * 256);

  const color =
    "#" + ((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1);

  return color;
}
function Canvas({ socketRef, roomId, username, newCanvasChanges, canvasData }) {
  // const editor = useEditor();
  console.log("Username is", username);
  const [store] = useState(() => {
    const store = createTLStore({
      shapeUtils: [...defaultShapeUtils],
    });
    return store;
  });

  // const currentUser = useMemo(() => {
  //   return atom("user", {
  //     id: uuidv4(),
  //     name: username,
  //     color: generateRandomColor(),
  //   });
  // }, [username]);

  // const userPresence = createPresenceStateDerivation(currentUser)(store);

  useEffect(() => {
    const handleIncomingCanvasChanges = () => {
      if (newCanvasChanges.length === 0 || canvasData.length === 0) return;

      for (const update of newCanvasChanges) {
        store.mergeRemoteChanges(() => {
          {
            const {
              changes: { added, updated, removed },
            } = update;

            for (const record of Object.values(added)) {
              store.put([record]);
            }
            for (const [, to] of Object.values(updated)) {
              store.put([to]);
            }
            for (const record of Object.values(removed)) {
              store.remove([record.id]);
            }
          }
        });
      }
    };
    handleIncomingCanvasChanges();
  }, [newCanvasChanges]);

  useEffect(() => {
    const pendingChanges = [];
    const sendCanvasChanges = throttle(() => {
      if (pendingChanges.length === 0) return;
      socketRef.current.emit(ACTIONS.CANVAS_CHANGE, {
        type: "update",
        username,
        roomId,
        newChanges: pendingChanges,
      });
      pendingChanges.length = 0;
    }, 100);

    const handleCanvasChanges = (event) => {
      if (event.source !== "user") return;
      // const presence = userPresence.get();
      // if (presence) {
      //   console.log(username);
      //   socketRef.current.emit("user-presence", { presence, roomId, username });
      // }
      const updatedChanges = event.changes.updated;
      console.log();

      const keys = Object.keys(updatedChanges);

      const dontPropagateEvent = keys.every(
        (key) =>
          key === "pointer:pointer" ||
          key === "instance:instance" ||
          key === "camera:page:page"
      );

      if (!dontPropagateEvent) {
        console.log("Sent event is", event);
        pendingChanges.push(event);
        sendCanvasChanges();
      }
    };
    // if (otherUserPresence) {
    //   console.log("Other user presence is", otherUserPresence.userName);
    //   console.log("And current user is", username);
    // }

    store.listen(handleCanvasChanges);
  }, [store]);

  return (
    <div className="fixed top-0 bottom-0 right-0 left-0 lg:left-[49px]">
      <Tldraw
        store={store}
        onMount={(editor) => {
          editor.user.updateUserPreferences({
            isDarkMode: true,
            isSnapMode: true,
          });
          console.log("Editor Canvas Data is", canvasData);
          if (canvasData.length > 0) {
            for (const update of canvasData) {
              editor.store.mergeRemoteChanges(() => {
                {
                  const {
                    changes: { added, updated, removed },
                  } = update;

                  for (const record of Object.values(added)) {
                    editor.store.put([record]);
                  }
                  for (const [, to] of Object.values(updated)) {
                    editor.store.put([to]);
                  }
                  for (const record of Object.values(removed)) {
                    editor.store.remove([record.id]);
                  }
                }
              });
            }
          }
        }}
      />
    </div>
  );
}

export default Canvas;
