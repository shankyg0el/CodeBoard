import { useState } from "react";

function NameModal({ handleJoinClick }) {
  const [username, setUsername] = useState("");
  return (
    <>
      <div className="absolute z-50 w-screen h-screen overflow-y-hidden opacity-95 bg-white-300 backdrop-blur-sm bg-opacity-10">
        <div className=" fixed sm:left-[25%] md:top-[25%] md:left-[35%] top-[20%] z-50 justify-center items-center w-full font-Montserrat">
          <div className="relative w-full max-w-md max-h-full p-4">
            <div className="relative rounded-lg shadow bg-background">
              <div className="flex items-center justify-between p-4 border-b rounded-t md:p-5 dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Hang On!
                </h3>
              </div>

              <div className="p-4 md:p-5">
                <div className="pb-3">
                  <p className="text-[15px] font-mono">
                    Your presence requires a name.
                  </p>
                  <input
                    className="bg-secondary border-[#89919d] border-[1px] rounded py-2 text-xl font-bold px-2 outline-none placeholder:font-normal w-full"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                    }}
                    onKeyUp={(e) => {
                      if (e.code === "Enter") {
                        handleJoinClick(username);
                      }
                    }}
                    type="text"
                    placeholder="Username"
                  />
                </div>

                <button
                  onClick={() => {
                    handleJoinClick(username);
                  }}
                  className={`py-2 text-xl rounded ${
                    username.length > 4 && username.length < 20
                      ? "bg-primary cursor-pointer"
                      : "bg-gray-400 cursor-not-allowed"
                  }  w-full `}
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default NameModal;
