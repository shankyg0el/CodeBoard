import { useContext } from "react";
import { SettingsContext } from "../../context/SettingsContext";

function Message({ message, sender, timestamp }) {
  const settingsContext = useContext(SettingsContext);
  const formattedSender =
    sender === settingsContext.settings.userName ? "You" : sender;
  return (
    <div
      className={`bg-secondary text-[16px] text-left w-[75%] p-2 rounded-lg ${
        formattedSender === "You" ? "self-end" : "self-start"
      } mx-1.5`}
    >
      <div className="flex justify-between pb-2">
        <span className="text-primary">{formattedSender}</span>
        <span>{timestamp}</span>
      </div>
      {message}
    </div>
  );
}

export default Message;
