import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getChannels } from "../../api/authApi";
import guser from "../../assets/guser.svg";
import pin from "../../assets/pin.svg";
import search from "../../assets/search.svg";
import cross from "../../assets/cross.svg";
// Displays channel name; if an ObjectId is passed and name map isn't available yet, attempts to resolve.
const InfoBar = ({ channelName = 'Team 1', memberCount = 0, onlineCount = 0, onSearchChange }) => {
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [resolvedName, setResolvedName] = useState(channelName);
  const workspaceId = useSelector(s => s.user.workspaceId);

  useEffect(() => {
    const looksLikeObjectId = /^[0-9a-fA-F]{24}$/.test(channelName);
    if (!looksLikeObjectId) { setResolvedName(channelName); return; }
    let cancelled = false;
    const resolve = async () => {
      if (!workspaceId) { setResolvedName(channelName); return; }
      try {
        const res = await getChannels(workspaceId);
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.channels || []);
        const found = list.find(ch => ch._id === channelName);
        if (!cancelled) setResolvedName(found?.name || channelName);
      } catch (e) {
        console.warn('[InfoBar] resolve channel name failed', e?.response?.data || e?.message || e);
        if (!cancelled) setResolvedName(channelName);
      }
    };
    resolve();
    return () => { cancelled = true; };
  }, [channelName, workspaceId]);

  const toggleSearch = () => {
    setShowSearch(s => !s);
    if (showSearch) {
      // closing search resets
      setQuery("");
      onSearchChange?.("");
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onSearchChange?.(val);
  };

  return (
    <div className="relative flex-1 overflow-y-auto space-y-4">
      <div className="sticky top-0 flex bg-gray-200 justify-between p-3 z-10">
        <div className="flex items-center">
          <p className="text-[26px] mr-2">#</p>
          <p className="text-2xl pt-0.5 truncate max-w-40" title={channelName}>{channelName}</p>
        </div>
        <div className="flex items-center gap-5 mr-3">
          <button type="button" onClick={toggleSearch} title="Search messages" className="w-5">
            <img src={search} alt="search" className="w-4" />
          </button>
        </div>
      </div>
      {showSearch && (
        <div className="px-3 pb-3">
          <input
            autoFocus
            value={query}
            onChange={handleChange}
            placeholder="Search in messages..."
            className="w-full rounded-md border border-[#BFA2E1] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#5C0EA4]"
          />
          <p className="text-[10px] text-[#707070] mt-1">Searching content & sender username (case-insensitive). Empty to reset.</p>
        </div>
      )}
    </div>
  );
};
export default InfoBar; 