import { MdOutlineChat } from "react-icons/md";
import { LiaUserFriendsSolid } from "react-icons/lia";
import { IoSettingsOutline } from "react-icons/io5";
import { useEffect, useRef, useState } from "react";
import ViewMembers from "./ViewMembers";
import Chat from "./Chat";
import Settings from "./Settings";
function Navbar({ socketRef, messages }) {
  const [sideBarWidth, setSideBarWidth] = useState(300);
  const [showSidebar, setShowSidebar] = useState(false);
  const [lastClickedIcon, setLastClickedIcon] = useState("");

  function handleViewMembersClick(icon) {
    if (showSidebar && lastClickedIcon === icon) {
      setShowSidebar(false);
      setLastClickedIcon(null);
    } else {
      setShowSidebar(true);
      setLastClickedIcon(icon);
    }
  }
  function handleChatClick(icon) {
    if (showSidebar && lastClickedIcon === icon) {
      setShowSidebar(false);
      setLastClickedIcon(null);
    } else {
      setShowSidebar(true);
      setLastClickedIcon(icon);
    }
  }

  function handleSettingsClick(icon) {
    if (showSidebar && lastClickedIcon === icon) {
      setShowSidebar(false);
      setLastClickedIcon(null);
    } else {
      setShowSidebar(true);
      setLastClickedIcon(icon);
    }
  }

  return (
    <div className="flex">
      <div className=" fixed bottom-0 left-0 z-50 flex items-center h-[50px] w-full gap-10 px-5 border-t border-[#89919d] bg-background  md:static md:h-screen md:w-[50px] md:min-w-[50px] md:flex-col md:border-r md:border-t-0 md:p-2 md:pt-4 cursor-pointer text-[#89919d]">
        <LiaUserFriendsSolid
          className={`${
            lastClickedIcon === "viewmembers" && "text-white scale-[2.2]"
          } scale-[2] `}
          onClick={() => handleViewMembersClick("viewmembers")}
        />
        <div className="relative" onClick={() => handleChatClick("chat")}>
          <MdOutlineChat
            className={`${
              lastClickedIcon === "chat" && " text-white scale-[2.2]"
            } scale-[1.6] `}
          />
        </div>
        <IoSettingsOutline
          className={`${
            lastClickedIcon === "settings" && "text-white  scale-[2.2]"
          } scale-[1.6] `}
          onClick={() => handleSettingsClick("settings")}
        />
      </div>

      <div
        className={`absolute left-0 top-0 z-20 h-screen w-screen flex-col bg-dark md:static md:w-[350px] bg-background ${
          showSidebar ? "block" : "hidden"
        }`}
      >
        {lastClickedIcon === "settings" && <Settings />}
        {lastClickedIcon === "viewmembers" && <ViewMembers />}
        {lastClickedIcon === "chat" && (
          <Chat socketRef={socketRef} messagesArray={messages} />
        )}
      </div>
    </div>
  );
}

export default Navbar;
